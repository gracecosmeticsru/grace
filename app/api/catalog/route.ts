import {queryCatalog} from '@/lib/catalog';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const ids = params.get('ids');
  const result = queryCatalog({
    q: params.get('q') || undefined,
    // Favorites have no item limit; silently truncating IDs hides saved products.
    ids: ids ? ids.split(',').filter(id => /^[a-z0-9-]+$/.test(id)) : undefined,
    page: Number(params.get('page')) || 1,
  });
  return Response.json({...result, brands: []}, {
    headers: {'Cache-Control': 'private, max-age=30'},
  });
}
