# Оформление, сохранение и Telegram

`VERIFIED` 14.10.2026: [форма](../../../components/guest-checkout.tsx) → [клиент](../../../lib/order-client.ts) → [orders route](../../../app/api/orders/route.ts) / [session route](../../../app/api/orders/session/route.ts) → [runtime](../../../lib/order-runtime.ts) → [service](../../../lib/order-service.ts). [Контракт](../../../lib/order-contract.ts), [D1 schema](../../../db/schema.ts), [миграции](../../../db/migrations) задают снимок и защиту от дублей. Telegram идёт через [outbox](../../../lib/telegram-outbox.ts).

Граница доверия: сервер проверяет состав/цены/сессию/Origin/лимиты; повтор попытки не должен создавать вторую заявку. Hosted-приём требует DB и точного настроенного host; [friends gate](../../../lib/friend-orders.ts). Повторы outbox зависят от checkout-трафика; независимое расписание здесь не реализовано.

Минимальные проверки по затронутому пути: `node --experimental-strip-types --test tests/guest-checkout.test.mjs tests/order-client.test.mjs tests/order-service.test.mjs tests/order-flow.test.mjs tests/telegram-outbox.test.mjs tests/friend-orders.test.mjs`. [Тесты outbox](../../../tests/telegram-outbox.test.mjs) и [flow](../../../tests/order-flow.test.mjs) используют изолированные fixtures/mock; перед любым новым сквозным сценарием прочитать его код.

`USER_SPECIFIED`/отчёт 12.10: [FRIEND-ORDERS](../../FRIEND-ORDERS.md), приём только на сайте друзей; разрешённая вымышленная заявка уже отправлена, не повторять. [ORDER-FLOW](../../ORDER-FLOW.md) — ранний документ, его локальные ограничения читать с поправкой FRIEND-ORDERS. Секреты, контакты, адреса и записи реальных заказов не сохранять в Context OS. В этой установке живой канал и БД не проверялись.
