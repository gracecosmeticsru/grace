# Выборочный вход

L0: текущий запрос и уже загруженные инструкции. L1: только при продолжении — выбранная задача и её checkpoint из [реестра](TASK_REGISTRY.md). Не выбирать задачу по новизне файла.
L2: эта карта и 1–2 соответствующих домена, когда пути неизвестны. L3: конкретный символ/файл/тест. L4: расширение поиска только для сквозной проблемы. Не перечитывать неизменённые документы в одной сессии.

| Намерение | Минимальный документ | Вероятный код | Проверки | Когда не читать |
|---|---|---|---|---|
| Каталог, варианты, единая карточка | [catalog](domains/catalog.md) | [catalog.ts](../../lib/catalog.ts), [variant-product-card](../../components/variant-product-card.tsx) | [catalog-variants](../../tests/catalog-variants.test.mjs), [shop-state](../../tests/shop-state.test.mjs) | Заказы/доставка не затронуты — их домены не нужны |
| Форма, сохранение, Telegram | [orders](domains/orders.md) | [guest-checkout](../../components/guest-checkout.tsx), [order-service](../../lib/order-service.ts), [order-runtime](../../lib/order-runtime.ts) | [order-flow](../../tests/order-flow.test.mjs), [order-client](../../tests/order-client.test.mjs), [telegram-outbox](../../tests/telegram-outbox.test.mjs) | Для чисто визуальной карточки не читать |
| Город, доставка, ПВЗ СДЭК | [delivery](domains/delivery.md) | [cdek-service](../../lib/cdek-service.ts), [cdek-pickup-list](../../components/cdek-pickup-list.tsx) | [cdek-service test](../../tests/cdek-service.test.mjs), [order-service test](../../tests/order-service.test.mjs) | Если доставка не затронута — не читать |
| Context OS, восстановление/целостность | [протокол](README.md) | [context-os](../../scripts/context-os.mjs) | [synthetic tests](../../tests/context-os.test.mjs) | Для обычной задачи достаточно правил AGENTS |
| 1С, обмен, цены и остатки | [правила 9А](../1C-INTEGRATION.md) | [catalog](../../lib/catalog.ts), [варианты](../../lib/catalog-types.ts), [demo inventory](../../lib/demo-inventory.ts) | Правила приняты; текущий формат ещё не проверен, историческая XLSX не является живым обменом | Для UI без цен/остатков не читать |
| Публикация или Git | [GitHub](../GITHUB.md), [состояние](PROJECT_STATE.md) | [run-framework](../../scripts/run-framework.mjs), [Vite](../../vite.config.ts) | Проверки конкретной задачи; Git SHA не доказывает деплой | Публикацию выполнять только по запросу |

[Решения](DECISIONS.md), [известные проблемы](KNOWN_ISSUES.md), [стабильная карта](../../PROJECT_CONTEXT.md). Сохранённые [ТЗ](spec/GRACE_CODEX_CONTEXT_OS_v4.md) и [стартовый файл](spec/GRACE_CODEX_START_PROMPT.txt) читать при изменении самой системы, не при каждом старте.

`graphify query` — первый поиск по коду при наличии графа; граф не источник истины, результаты проверять по исходнику. Не сканировать vendor/generated/binary/полные исторические логи без необходимости. Экономия токенов не измерена; допустимы только наблюдаемые числа файлов/строк/байтов, без лишнего полного скана для сравнения.
