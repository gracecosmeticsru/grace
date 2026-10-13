# Grace Cosmetics — локальный проект

**Впервые скачали проект?** Откройте [START-HERE-RU.txt](START-HERE-RU.txt): запуск с нуля, необходимые доступы, настройки заказов и функции, которые ещё предстоит разработать. [Результат проверки чистой копии](docs/CLEAN-CLONE-CHECK.md).

## GitHub и актуальное состояние — 13 октября 2026

Репозиторий проекта: [gracecosmeticsru/grace](https://github.com/gracecosmeticsru/grace), публичный. После каждой завершённой и проверенной задачи изменения сохраняются отдельным коммитом и отправляются на GitHub; [порядок работы и состав переноса](docs/GITHUB.md). Рабочая папка остаётся `D:\grace`.

Последнее функциональное состояние: приём заявок и Telegram включены только на [сайте для друзей](https://grace-mobile-review.hhuy07775.chatgpt.site); [подробности и ограничения](docs/FRIEND-ORDERS.md). Основной локальный сайт доступен на `http://127.0.0.1:5173/`. Общий план остаётся **13/30**; сведения ниже сохраняют историю предыдущих этапов. Отправка исходников на GitHub сама по себе сайт не публикует и не переносит рабочую D1.

## Актуально 11 октября — подготовка 10Б

СДЭК оставлен на потом и не считается завершённым. Серверное сохранение и форма подготовлены и проверены на изолированной локальной D1; обычный сайт остаётся в режиме проверки без приёма заявок. Полностью завершено **13/30**. Следующий этап — 10В, Telegram в рабочую группу; бота пока нет. [Текущий результат и ограничения](docs/STEP-10B-REVIEW.md), [решение о продолжении](docs/CONTINUATION-2026-10-11.md). Этот блок заменяет исторические указания остановиться перед 10Б ниже.

## 10А возобновлён после ответов владельца

Форма в работе, 13/30. Доставка по России: СДЭК ПВЗ из списка по выбранному городу/курьер и почта; комментарий необязателен. Уведомление менеджеру в будущем 10В — Telegram, связь с покупателем — WhatsApp. [Актуальные решения](docs/STEP-10A-OWNER-DECISIONS.md) заменяют прежнюю паузу и прежний канал уведомлений. Реальные заявки пока не принимаются; после 10А остановиться перед 10Б.

<!-- EXECUTION-ORDER-2026-10-10 -->
## Действующий порядок — 10 октября 2026

**Этап 8 реализован, доступная QA пройдена. Следующий этап — 10А: гостевая форма заказа.** Сейчас остановиться после 8; 10А не начат. Выполнены **13/30**: 0–4, 5А/Б/В, 6А/Б/В, 7А и 8. [План всех 30 заданий](docs/EXECUTION-PLAN-2026-10-10.md), [результат мобильной версии](docs/MOBILE-QA.md).

Порядок владельца: сначала функции и оформление → фото и тексты → 1С и окончательная приёмка. **7Б отложен до фазы 2**. Его точка 1008/5997, 208 фото, 800 пропусков, 4989 pending, тексты 0 сохранена. Тестовый остаток остаётся отдельным слоем. 10Б/10Г/11Г закрывать окончательно после реальных зависимых проверок; финальные 12А–12В/13 не заменять промежуточными результатами. Работа только в D:/grace.

Проверены 104 сочетания страниц/размеров, 35 тестов, TypeScript и сборка; исходная корзина сохранена. Реальные телефоны/Safari, физические жесты, системный zoom/увеличение текста, настоящая клавиатура и медленная мобильная сеть не проверены — границы перечислены в MOBILE-QA. Исторические инструкции ниже не заменяют этот порядок.
<!-- /EXECUTION-ORDER-2026-10-10 -->

<!-- FAST-7B-CURRENT -->
Сохранённая точка 7Б (отложено до фазы 2): **1008/5997 проверено, 208 фото подключено, 800 объяснённых пропусков, 4989 ещё не исследованы**, тексты 0. Первая pending-позиция 590 (gc004594), партия 12. Реестр materials/catalog-7b/manifest.json не перезапускать. Следующая работа — 10А после отдельной команды; 7Б остаётся отложен.
<!-- /FAST-7B-CURRENT -->

Историческая точка на 24 сентября 2026 (актуальный порядок указан выше): **Этап 7А завершён, 7Б в работе.** Сохранены две партии материалов: 100 вариантов проверены, 75 оригиналов найдены, 25 объяснённых пропусков; осталось исследовать 5 897. Владелец изменил порядок: подходящие фото теперь обрабатываются и подключаются сразу, неподходящие пропускаются без длительного поиска. Из 75 найденных оригиналов 35 уже подключены, 40 отклонены по качеству без повторного поиска; [отчёт](docs/STAGE-07B-ROLLING.md). [Прогресс и продолжение с партии 003](docs/STAGE-07B-PROGRESS.md). Утверждённый каталог из 6 089 вариантов и прежняя корзина сохранены. Рабочий сайт: http://127.0.0.1:5173/catalog.

Перенесён из ChatGPT-проекта «Пробный сайт» в **grace test**. Здесь настоящие исходники последней сохранённой версии сайта, полный файловый каталог и изображения, исходная таблица и контекст предыдущей работы.

С 17 сентября 2026 года рабочая папка сайта — **`D:\grace`**. Прежняя папка `C:\Users\pc\Documents\ChatGPT\grace test` сохранена как страховочная копия; дальнейшие изменения выполняются только в `D:\grace`. Сведения о проверке копии — в [отчёте переноса на диск D](docs/MOVE-TO-D.md).

## Открыть сайт на этом компьютере

1. Откройте папку `D:\grace`.
2. Дважды нажмите **`start-local.cmd`**. Оставьте появившееся окно открытым.
3. Когда сервер сообщит о готовности, откройте **http://127.0.0.1:5173/**.
4. Для остановки нажмите `Ctrl+C` в окне сервера.

Адрес доступен на этом компьютере, пока работает сервер. Исходный опубликованный сайт: https://grace-cosmetics.hhuy07775.chatgpt.site.

Для разработки при доступном Node.js: `node scripts/run-framework.mjs dev --hostname 127.0.0.1`. Изменения исходников автоматически подхватываются локальным сервером. Для первой установки на другом компьютере нужны Node.js >=22.13 и npm; выполните `npm run install:ci`, затем `npm run dev -- --hostname 127.0.0.1`. Версии пакетов зафиксированы в `package-lock.json`. На этом компьютере используется явный IPv4-адрес: подключение через IPv6 `localhost` в среде проверки было недоступно.

В текущем окружении Codex Node.js находится в `%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`. Недостающий npm установлен только в игнорируемую папку `.sites-runtime/npm/package`; при необходимости его команда: `node .sites-runtime/npm/package/bin/npm-cli.js run install:ci`. Глобальные настройки Node/npm не изменялись.

## Данные и контекст

- [Отчёт о переносе, составе данных и ограничениях](docs/TRANSFER.md).
- [Предыдущие требования, решения и незавершённая работа](docs/source-conversation.md).
- [Полный доступный текст переписки](docs/source-conversation.json).
- Каталог: `data/`; изображения: `public/images/`; исходная Excel-таблица: `materials/`.

Перенесены 4 526 карточек, 6 089 вариантов и 350 брендов. Серверная база не подключена. Корзина, избранное и история браузера с телефона не входят в эти файлы. Не найден дополнительный исходник `Grace_1C_FINAL_IMPORT_5051.xlsx`, необходимый только для повторного импорта; текущий каталог уже содержит результат его обработки.

Для продолжения работы в Codex используйте **`D:\grace`**, уже выбранную основной папкой проекта, и проверяйте рабочий каталог старых задач. Перенос проверен, этап 0 завершён; следующий промпт запускается отдельно по [текущему статусу](docs/EXECUTION-STATUS.md). Прежнее незавершённое задание по фотографиям сохраняется в истории: реальные фотографии искать в интернете, отсутствующие пропускать, не генерировать. Backend и структуру сайта сохранять. Локальные изменения не публикуются автоматически.

13 сентября 2026 года зависимости установлены, сборка и TypeScript-проверка прошли успешно. Выполнены 52 HTTP-проверки, включая все 189 страниц API каталога и контрольные суммы всех файлов `public/`: ошибок нет. Подробности — [local-validation.json](docs/local-validation.json). Проверки кликов в браузере и мобильного отображения в этот перенос не входили.

## Работа разработчика

Рабочий проект Codex по-прежнему называется **grace test**, но его основная папка уже изменена пользователем на **`D:\grace`**. В старой открытой задаче проверяйте рабочий каталог. Резерв на C не редактировать.

- [Карта проекта, правила данных и будущие границы интеграций](docs/ARCHITECTURE.md).
- [Подтверждённые проблемы и исправления этапа 0](docs/ARCHITECTURE-AUDIT.md).
- [Текущий статус и следующий разрешённый этап](docs/EXECUTION-STATUS.md).
- [Утверждённые требования](docs/REQUIREMENTS-FINAL-REVIEW.md) и [последовательность заданий](docs/GRACE-ASTRA-ALL-PROMPTS.md).

Внешний вид меняется в соответствующем `components/` и существующих CSS. Правила каталога и доступа к JSON — `lib/catalog.ts`, форматирование цен — `lib/pricing.ts`, состояние браузера и операции корзины — `lib/shop-state.ts`, контракты — `lib/catalog-types.ts`. Не импортируйте серверный каталог/БД в клиентские компоненты. API чтения — `app/api/catalog/route.ts`.

### Проверки

Из `D:\grace`, при доступном Node.js >=22.13:

```powershell
node node_modules/typescript/bin/tsc --noEmit --incremental false
node --experimental-strip-types --test tests/shop-state.test.mjs
node scripts/run-framework.mjs build
```

Для проверки настоящего API сначала запустите сайт через `start-local.cmd`, затем:

```powershell
node --test tests/catalog-api.test.mjs
```

При доступном npm равнозначные команды: `npm run test:logic`, `npm run test:api`, `npm run build`. У API-тестов необязательная переменная `GRACE_BASE_URL` для другого локального адреса; по умолчанию `http://127.0.0.1:5173`. Новые зависимости для тестов не нужны. Полный lint локальных служебных папок не является частью этих проверок.

### Конфигурация и ограничения

Секреты для текущей версии не требуются. `.openai/hosting.json` сохраняет ID существующего сайта, D1/R2 отключены. Профиль этого компьютера — `portable`; служебное состояние в `.sites-runtime` и `.wrangler`. `CLOUDFLARE_CF_FETCH_ENABLED` и `WRANGLER_SEND_METRICS` по умолчанию выключены; это настройки инструментов, не бизнес-данные приложения.

Корзина и избранное остаются в localStorage с прежними ключами/форматом; серверных заказов, 1С, WhatsApp и кабинета ещё нет. Повреждённая запись не перезаписывается при одной лишь загрузке страницы. Цены/остатки не актуализировать по догадке. Неизвестная цена — «— ₽»; неизвестное наличие не превращается в ноль. Снимок браузерной корзины не является доверенным источником будущего заказа.

Сохранять ID, связи вариантов, весь каталог, изображения и lockfile. Не запускать повторный импорт: второго исходного XLSX нет, а импортёр перезаписывает данные проекта. Дизайн и материалы дорабатываются только в соответствующих последующих заданиях. Публикация требует отдельного поручения.

## Сохранённая справка инфраструктуры

Ниже — исходная справка платформы. Неиспользуемые возможности D1/ChatGPT-auth не означают, что они подключены к магазину. Создавать новый starter по этой справке для существующего Grace не нужно.

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git is required only for publishing

## Sites Lifecycle

The Sites initializer copies the shared starter with the explicit `--execution-profile portable` or `--execution-profile managed-linux` argument from the plugin's setup instructions. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Whenever reopening or moving a checkout, follow the plugin's instructions to run `configure-execution-profile.mjs --execution-profile <portable|managed-linux>` before project commands. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

`install:ci` runs `npm ci` once against the shared lockfile, disables parent-workspace discovery, and includes required dev/optional dependencies despite production/omit settings. Sharp defaults to prebuilt binaries unless explicitly configured otherwise. Do not overlap installers.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev` uses `vinext dev` with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--hostname <host>` after `npm run dev --` when needed; keep portable previews on loopback.

On managed Linux, use `sites-preview start` only for requested browser QA. The project's dev script runs Vite and accepts the supervisor's `--host 0.0.0.0 --port 4173 --strictPort` arguments. The internal browser uses `http://terminal.local:4173/`; it is not a user-facing URL. The supervisor owns the preview lifecycle. The ignored local profile survives the supervisor's cleared process environment.

The portable profile simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. Mock auth is disabled in the managed-linux profile and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
