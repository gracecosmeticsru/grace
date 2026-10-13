CREATE TABLE `guest_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`session_hash` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`request_hash` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`total_kopecks` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_hash`) REFERENCES `guest_sessions`(`token_hash`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "guest_orders_snapshot_valid" CHECK(json_valid("guest_orders"."snapshot_json")),
	CONSTRAINT "guest_orders_total_positive" CHECK("guest_orders"."total_kopecks" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guest_orders_idempotency_key` ON `guest_orders` (`idempotency_key`);--> statement-breakpoint
CREATE TABLE `guest_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_outbox` (
	`order_id` text PRIMARY KEY NOT NULL,
	`channel` text DEFAULT 'telegram' NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` integer NOT NULL,
	`message_ids_json` text DEFAULT '[]' NOT NULL,
	`message_parts_json` text,
	`target_chat_id` text,
	`failure_code` text,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`claim_token` text,
	`lease_until` integer,
	`accepted_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `guest_orders`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "order_outbox_channel" CHECK("order_outbox"."channel" = 'telegram'),
	CONSTRAINT "order_outbox_state" CHECK("order_outbox"."state" IN ('pending', 'sending', 'sent', 'failed')),
	CONSTRAINT "order_outbox_ids_valid" CHECK(json_valid("order_outbox"."message_ids_json")),
	CONSTRAINT "order_outbox_parts_valid" CHECK("order_outbox"."message_parts_json" IS NULL OR json_valid("order_outbox"."message_parts_json"))
);
--> statement-breakpoint
CREATE TABLE `order_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`attempts` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `telegram_dispatch` (
	`id` integer PRIMARY KEY NOT NULL,
	`token` text,
	`next_send_at` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "telegram_dispatch_singleton" CHECK("telegram_dispatch"."id" = 1)
);
