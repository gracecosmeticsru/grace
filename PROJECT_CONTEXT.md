# Grace: устойчивый контекст

Последняя проверка исходников: 14 октября 2026, Europe/Moscow. Метки: `VERIFIED` — проверено по указанному источнику; `USER_SPECIFIED` — поручение владельца; `PROPOSED` — предложение; `UNKNOWN` — не подтверждено; `OBSOLETE` — устаревшее знание. Исторический отчёт не означает свежую живую проверку.

- `USER_SPECIFIED`: рабочая папка `D:/grace`; резерв на C: не менять. Это перенесённый существующий сайт, не новый starter. Происхождение: [TRANSFER](docs/TRANSFER.md), [история](docs/source-conversation.md), [перенос на D](docs/MOVE-TO-D.md).
- `VERIFIED`: React 19.2.6, TypeScript 5.9.3, Vinext 1.0.0-beta.5, Vite 8.0.13, маршруты Next 16.2.6, Cloudflare Workers/D1 и Drizzle; источник [package.json](package.json), [Vite](vite.config.ts), [схема](db/schema.ts). Это версии проекта, не утверждение о последней версии пакетов.
- `VERIFIED`: страницы в `app/`, общий интерфейс в `components/`, бизнес-правила в `lib/`; каталог JSON в `data/`, изображения в `public/`, исходные материалы в `materials/`. Историческая [архитектура](docs/ARCHITECTURE.md) полезна как карта, её ограничения этапа 0 требуют сверки с кодом.
- `VERIFIED`: [обёртка запуска](scripts/run-framework.mjs) выбирает portable/managed-linux через локальный профиль; обычный dev использует 5173. Запуск: `node scripts/run-framework.mjs dev --hostname 127.0.0.1`. [README](README.md) содержит запуск и исторические сведения.
- `VERIFIED`: браузерная корзина/избранное — [shop-state](lib/shop-state.ts); серверные гостевые заявки и outbox — [order-service](lib/order-service.ts), [схема D1](db/schema.ts). Нельзя смешивать эти хранилища или утверждать, что D1 вообще не реализована.
- `USER_SPECIFIED`: общий стандарт карточки, точный вариант/ID/цена, две карточки на мобильном; [правила](docs/PRODUCT-CARD-STANDARD.md). Фото товаров только реальные, не найденные пропускать. Тестовое количество — отдельный слой [demo-inventory](lib/demo-inventory.ts), не актуальный остаток 1С.
- `USER_SPECIFIED`: обычные завершённые задачи commit/push в текущую ветку origin с проверкой SHA; [GitHub](docs/GITHUB.md). Git не публикует сайт. Секреты, заявки и игнорируемые служебные каталоги не отправлять.

Текущие ограничения: [PROJECT_STATE](docs/context/PROJECT_STATE.md). Выборочный вход: [INDEX](docs/context/INDEX.md). Начать/продолжить задачу: [протокол](docs/context/README.md), [реестр](docs/context/TASK_REGISTRY.md).

Контекст хранится в отслеживаемом `docs/context/`: `.codex/` исключён из Git и остаётся локальным состоянием инструментов. Это явная адаптация ТЗ, а не изменение `.gitignore`. Требования и поправки принадлежат задаче; доказательства — её checkpoint; знания — этому файлу и доменам. Личные данные и секреты не включать даже в исходный запрос задачи.
