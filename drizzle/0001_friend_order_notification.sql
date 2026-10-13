CREATE TRIGGER guest_order_notification AFTER INSERT ON guest_orders
BEGIN
  INSERT OR IGNORE INTO telegram_dispatch(id) VALUES (1);
  INSERT INTO order_outbox(order_id, next_attempt_at) VALUES (NEW.id, NEW.created_at);
END;
