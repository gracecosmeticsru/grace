CREATE TABLE IF NOT EXISTS guest_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS order_rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS guest_orders (
  id TEXT PRIMARY KEY,
  session_hash TEXT NOT NULL REFERENCES guest_sessions(token_hash),
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  snapshot_json TEXT NOT NULL CHECK(json_valid(snapshot_json)),
  total_kopecks INTEGER NOT NULL CHECK(total_kopecks > 0),
  created_at INTEGER NOT NULL,
  UNIQUE(session_hash, idempotency_key)
);
-- Keep a lost guest cookie from turning a retry into a second order.
CREATE UNIQUE INDEX IF NOT EXISTS guest_orders_idempotency_key ON guest_orders(idempotency_key);
CREATE TABLE IF NOT EXISTS order_outbox (
  order_id TEXT PRIMARY KEY REFERENCES guest_orders(id),
  channel TEXT NOT NULL DEFAULT 'telegram' CHECK(channel = 'telegram'),
  state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL
);
-- The job is part of the same SQLite statement: a failed job insert rolls back the order.
CREATE TRIGGER IF NOT EXISTS guest_order_notification AFTER INSERT ON guest_orders
BEGIN
  INSERT INTO order_outbox(order_id, next_attempt_at) VALUES (NEW.id, NEW.created_at);
END;
