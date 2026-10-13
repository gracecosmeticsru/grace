import {parseCdekPoint, type CdekCity, type CdekPickupPoint} from './cdek-pickup.ts';

type CdekSettings = {account?: string; secret?: string};
const apiRoot = 'https://api.cdek.ru/v2/';
const pageSize = 6;
const unavailable = () => Response.json({message: 'Не удалось загрузить пункты СДЭК. Попробуйте ещё раз.'}, {status: 503});
const badRequest = () => Response.json({message: 'Проверьте название города или параметры поиска.'}, {status: 400});
const text = (value: unknown, max: number) => typeof value === 'string' && value.trim().length <= max && !/[\u0000-\u001f\u007f]/.test(value) ? value.trim() : '';

export function cdekSettingsReady(settings: CdekSettings) {
  return Boolean(settings.account?.trim() && settings.secret?.trim());
}

/** Only public city/pickup information. No order, shipment or tariff endpoints. */
export function createCdekService(settings: CdekSettings, request: typeof fetch = fetch) {
  let token: {value: string; expiresAt: number} | undefined;
  let tokenRequest: Promise<string> | undefined;
  const pointCache = new Map<number, {points: CdekPickupPoint[]; expiresAt: number}>();
  async function accessToken() {
    if (token && token.expiresAt > Date.now()) return token.value;
    if (!tokenRequest) tokenRequest = (async () => {
      const response = await request(apiRoot + 'oauth/token', {method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({grant_type: 'client_credentials', client_id: settings.account!, client_secret: settings.secret!}),
        signal: AbortSignal.timeout(10000)});
      if (!response.ok) throw Error('CDEK authorization failed');
      const raw = await response.json();
      if (!raw || typeof raw !== 'object') throw Error('Invalid token');
      const body = raw as Record<string, unknown>;
      if (typeof body.access_token !== 'string' || !body.access_token || typeof body.expires_in !== 'number' || !Number.isFinite(body.expires_in) || body.expires_in <= 0) throw Error('Invalid token');
      token = {value: body.access_token, expiresAt: Date.now() + Math.max(0, body.expires_in - 60) * 1000};
      return token.value;
    })().finally(() => {tokenRequest = undefined;});
    return tokenRequest;
  }
  async function read(path: string, params: URLSearchParams): Promise<Record<string, unknown>[]> {
    const access = await accessToken();
    const response = await request(apiRoot + path + '?' + params, {
      headers: {Authorization: `Bearer ${access}`, Accept: 'application/json'}, signal: AbortSignal.timeout(10000)});
    if (!response.ok) {if (response.status === 401) token = undefined;throw Error('CDEK unavailable');}
    // Bound the response before parsing, even when upstream ignores its page size.
    const reader = response.body?.getReader();
    if (!reader) throw Error('Missing response');
    const chunks: Uint8Array[] = [];let size = 0;
    try {while (true) {const part = await reader.read();if (part.done) break;size += part.value.byteLength;
      if (size > 5_000_000) throw Error('Oversized response');chunks.push(part.value);}
    } finally {await reader.cancel();}
    const joined = new Uint8Array(size);let offset = 0;
    for (const chunk of chunks) {joined.set(chunk, offset);offset += chunk.byteLength;}
    const body: unknown = JSON.parse(new TextDecoder().decode(joined));
    if (!Array.isArray(body) || body.length > 1000) throw Error('Invalid response');
    return body.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
  }
  return async (incoming: Request): Promise<Response> => {
    if (incoming.method !== 'GET') return new Response(null, {status: 405, headers: {Allow: 'GET'}});
    const params = new URL(incoming.url).searchParams;
    const action = params.get('action');
    const pageText = params.get('page') ?? '0';
    const query = text(params.get('q') ?? '', 120);
    const cityCode = params.get('cityCode') ?? '';
    if (!/^\d{1,3}$/.test(pageText) || Number(pageText) > 500 || !['cities', 'points'].includes(action ?? '') ||
      (params.get('q') ?? '').trim() !== query ||
      (action === 'cities' && query.length < 2) || (action === 'points' && !/^[1-9]\d{0,8}$/.test(cityCode))) return badRequest();
    if (!cdekSettingsReady(settings)) return unavailable();
    const page = Number(pageText);
    try {
      if (action === 'cities') {
        const body = await read('location/cities', new URLSearchParams({country_codes: 'RU', city: query, size: String(pageSize), page: String(page), lang: 'rus'}));
        const items: CdekCity[] = body.filter(city => city.country_code === 'RU' && Number.isSafeInteger(city.code) && Number(city.code) > 0 && text(city.city, 120)).slice(0, pageSize).map(city => ({code: Number(city.code), city: text(city.city, 120), region: text(city.region, 120), ...(text(city.sub_region, 120) ? {subRegion: text(city.sub_region, 120)} : {})}));
        return Response.json({items, page, hasMore: body.length >= pageSize}, {headers: {'Cache-Control': 'private, max-age=300'}});
      }
      const code = Number(cityCode);
      let cached = pointCache.get(code);
      if (!cached || cached.expiresAt <= Date.now()) {
        const points: CdekPickupPoint[] = [];
        // Fetch at most three bounded pages. Never present a silently truncated city list.
        for (let upstreamPage = 0; upstreamPage < 3; upstreamPage++) {
          const body = await read('deliverypoints', new URLSearchParams({country_code: 'RU', city_code: cityCode, type: 'PVZ', is_handout: 'true', size: '1000', page: String(upstreamPage), lang: 'rus'}));
          for (const raw of body) {
            const location = raw.location as Record<string, unknown> | undefined;
            if (raw.type !== 'PVZ' || raw.is_handout === false || location?.country_code !== 'RU' || location.city_code !== code) continue;
            const point = parseCdekPoint({code: raw.code, city: location.city, address: location.address, countryCode: 'RU', cityCode: code, region: location.region, workTime: raw.work_time});
            if (point) points.push(point);
          }
          if (body.length < 1000) break;
          if (upstreamPage === 2) throw Error('City list exceeds limit');
        }
        cached = {points: [...new Map(points.map(point => [point.code, point])).values()].sort((a, b) => a.address.localeCompare(b.address, 'ru')), expiresAt: Date.now() + 300000};
        if (pointCache.size >= 10) pointCache.delete(pointCache.keys().next().value!);
        pointCache.set(code, cached);
      }
      const needle = query.toLocaleLowerCase('ru');
      const matches = cached.points.filter(point => `${point.address} ${point.code}`.toLocaleLowerCase('ru').includes(needle));
      return Response.json({items: matches.slice(page * pageSize, (page + 1) * pageSize), page, hasMore: matches.length > (page + 1) * pageSize, total: matches.length}, {headers: {'Cache-Control': 'private, max-age=60'}});
    } catch {return unavailable();} // Do not expose credentials or upstream error bodies.
  };
}
