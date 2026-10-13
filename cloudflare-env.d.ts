declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    GRACE_ORDER_TEST_MODE?: string;
    GRACE_ORDERS_ENABLED?: string;
    GRACE_ORDER_HOST?: string;
    GRACE_TELEGRAM_BOT_TOKEN?: string;
    GRACE_TELEGRAM_CHAT_ID?: string;
    GRACE_CDEK_PICKUP_ENABLED?: string;
    CDEK_ACCOUNT?: string;
    CDEK_SECURE?: string;
    BUCKET?: R2Bucket;
  }
}
