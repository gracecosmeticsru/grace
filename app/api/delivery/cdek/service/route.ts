import {createCdekService} from '@/lib/cdek-service';

let service: ReturnType<typeof createCdekService> | undefined;
export function GET(request: Request) {
  service ??= createCdekService({account: process.env.CDEK_ACCOUNT, secret: process.env.CDEK_SECURE});
  return service(request);
}
