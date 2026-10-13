import {sql} from 'drizzle-orm';
import {sqliteTable, text, integer, uniqueIndex, check} from 'drizzle-orm/sqlite-core';

export const guestSessions = sqliteTable('guest_sessions', {
  tokenHash: text('token_hash').primaryKey(), createdAt: integer('created_at').notNull(), expiresAt: integer('expires_at').notNull(),
});
export const orderRateLimits = sqliteTable('order_rate_limits', {
  key: text('key').primaryKey(), windowStart: integer('window_start').notNull(), attempts: integer('attempts').notNull(),
});
export const guestOrders = sqliteTable('guest_orders', {
  id: text('id').primaryKey(), sessionHash: text('session_hash').notNull().references(() => guestSessions.tokenHash),
  idempotencyKey: text('idempotency_key').notNull(), requestHash: text('request_hash').notNull(),
  snapshotJson: text('snapshot_json').notNull(), totalKopecks: integer('total_kopecks').notNull(), createdAt: integer('created_at').notNull(),
}, table => [uniqueIndex('guest_orders_idempotency_key').on(table.idempotencyKey),
  check('guest_orders_snapshot_valid', sql`json_valid(${table.snapshotJson})`), check('guest_orders_total_positive', sql`${table.totalKopecks} > 0`)]);
export const orderOutbox = sqliteTable('order_outbox', {
  orderId: text('order_id').primaryKey().references(() => guestOrders.id), channel: text('channel').notNull().default('telegram'),
  state: text('state').notNull().default('pending'), attempts: integer('attempts').notNull().default(0), nextAttemptAt: integer('next_attempt_at').notNull(),
  messageIdsJson: text('message_ids_json').notNull().default('[]'), messagePartsJson: text('message_parts_json'),
  targetChatId: text('target_chat_id'), failureCode: text('failure_code'), retryCount: integer('retry_count').notNull().default(0),
  claimToken: text('claim_token'), leaseUntil: integer('lease_until'), acceptedAt: integer('accepted_at'),
}, table => [check('order_outbox_channel', sql`${table.channel} = 'telegram'`), check('order_outbox_state', sql`${table.state} IN ('pending', 'sending', 'sent', 'failed')`),
  check('order_outbox_ids_valid', sql`json_valid(${table.messageIdsJson})`), check('order_outbox_parts_valid', sql`${table.messagePartsJson} IS NULL OR json_valid(${table.messagePartsJson})`)]);
export const telegramDispatch = sqliteTable('telegram_dispatch', {
  id: integer('id').primaryKey(), token: text('token'), nextSendAt: integer('next_send_at').notNull().default(0),
}, table => [check('telegram_dispatch_singleton', sql`${table.id} = 1`)]);
