ALTER TABLE order_outbox ADD COLUMN message_ids_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(message_ids_json));
ALTER TABLE order_outbox ADD COLUMN message_parts_json TEXT CHECK(message_parts_json IS NULL OR json_valid(message_parts_json));
ALTER TABLE order_outbox ADD COLUMN target_chat_id TEXT;
ALTER TABLE order_outbox ADD COLUMN failure_code TEXT;
ALTER TABLE order_outbox ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE order_outbox ADD COLUMN claim_token TEXT;
ALTER TABLE order_outbox ADD COLUMN lease_until INTEGER;
ALTER TABLE order_outbox ADD COLUMN accepted_at INTEGER;
CREATE TABLE telegram_dispatch (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  token TEXT,
  next_send_at INTEGER NOT NULL DEFAULT 0
);
INSERT INTO telegram_dispatch(id) VALUES(1);
