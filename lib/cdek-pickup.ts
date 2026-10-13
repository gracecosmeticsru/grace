export type CdekCity = {code: number; city: string; region: string; subRegion?: string};
export type CdekPickupPoint = {code: string; city: string; address: string; countryCode: 'RU'; cityCode?: number; region?: string; workTime?: string};

// API data and checkout values remain untrusted input.
export function parseCdekPoint(value: unknown): CdekPickupPoint | null {
  if (!value || typeof value !== 'object') return null;
  const point = value as Record<string, unknown>;
  const country = point.countryCode ?? point.country_code;
  const text = (key: string, max: number) => typeof point[key] === 'string' &&
    (point[key] as string).trim().length > 0 && (point[key] as string).length <= max &&
    !/[\u0000-\u001f\u007f]/.test(point[key] as string);
  if (country !== 'RU' || !text('code', 50) || !text('city', 120) || !text('address', 250)) return null;
  return {code: (point.code as string).trim(), city: (point.city as string).trim(),
    address: (point.address as string).trim(), countryCode: 'RU',
    ...(Number.isSafeInteger(point.cityCode) && Number(point.cityCode) > 0 ? {cityCode: Number(point.cityCode)} : {}),
    ...(text('region', 120) ? {region: (point.region as string).trim()} : {}),
    ...(text('workTime', 500) ? {workTime: (point.workTime as string).trim()} : {})};
}
