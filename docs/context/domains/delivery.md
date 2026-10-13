# Доставка и СДЭК

`VERIFIED` 14.10.2026: [cdek-service](../../../lib/cdek-service.ts) обслуживает города/ПВЗ через [API](../../../app/api/delivery/cdek/service/route.ts); [pickup list](../../../components/cdek-pickup-list.tsx), [pickup model](../../../lib/cdek-pickup.ts) используются формой. Дополнительная серверная проверка выбора — [order-runtime](../../../lib/order-runtime.ts), [order-service](../../../lib/order-service.ts).

Справочник не создаёт отправления и не рассчитывает тариф. Hosted-ПВЗ требуют включённого флага и проверенного кода города; клиентскому названию ПВЗ без проверки не доверять. Почта/курьер остаются предусмотренными способами.

Минимальная проверка: `node --experimental-strip-types --test tests/cdek-service.test.mjs tests/order-service.test.mjs`. При изменении формы добавить [guest-checkout test](../../../tests/guest-checkout.test.mjs). Эти тесты не доказывают действительность живых ключей.

`USER_SPECIFIED`/исторический отчёт [FRIEND-ORDERS](../../FRIEND-ORDERS.md): 12.10 живой OAuth вернул 401, ПВЗ отключены. Сегодня live-статус `UNKNOWN`; не раскрывать ключи, не включать ПВЗ и не создавать отправлений по предположению. Для изменения нужна отдельная задача с актуальной проверкой.
