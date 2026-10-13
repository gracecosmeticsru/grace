# Graph Report - grace  (2026-09-22)

## Corpus Check
- 186 files · ~126,800 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: .css 7, (none) 2, .zip 1)

## Summary
- 996 nodes · 2055 edges · 59 communities (52 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.87)
- Token cost: unavailable. Semantic extraction used this Codex session; agent usage counters were not exposed. This is not a measured zero-token run.

## Community Hubs (Navigation)
- Каталог и страницы ассортимента
- Боковая панель и подсказки
- Общие стили и таблицы
- Поля ввода и кнопки
- Планы материалов и заказов
- Главная и страница товара
- Главные баннеры и карусель
- Тематические подборки товаров
- Карточки конкретных вариантов
- Корзина и браузерное состояние
- Пакет приложения и зависимости
- Библиотеки интерфейса
- Общие утилиты интерфейса
- Фильтры и пагинация каталога
- Выпадающие меню и переключатели
- Избранное и страницы брендов
- Диалоги и поиск команд
- Конфигурация сборки и установки
- Оболочка магазина и навигация
- Группы элементов интерфейса
- Настройки TypeScript
- Зависимости среды разработки
- Настройка компонентов shadcn
- Цена и витринные варианты
- Декоративные элементы интерфейса
- Панель меню
- Контекстное меню
- Требования и порядок этапов
- Диаграммы интерфейса
- Подписи и поля формы
- Среда локального запуска
- Диалоги подтверждения
- Состояние полей формы
- Компоненты вложений
- Выдвижные панели
- Примеры D1 и БД
- Меню навигации
- Архитектурный аудит этапа ноль
- Маршруты авторизации ChatGPT
- Планы приёмки и передачи
- Исторический импорт каталога
- Команды проекта
- Всплывающие панели
- История этапов проекта
- Прокрутка товарных лент
- Сохранённый этап четыре
- Единый стандарт карточек
- Правила сохранности проекта
- Поля одноразового кода
- Изменяемые размеры панелей
- Установка зависимостей CI
- Настройки проверки ESLint
- Типы окружения Cloudflare
- План нового подвала
- Конфигурация Drizzle
- Требуемая версия Node
- Конфигурация PostCSS
- Проверенная сборка проекта

## God Nodes (most connected - your core abstractions)
1. `cn()` - 327 edges
2. `react` - 65 edges
3. `lucide-react` - 39 edges

## Surprising Connections (you probably didn't know these)
- `Нативные ProductRail: overflow-x:auto, touch-action:auto и scroll-snap` --references--> `ProductRail()`  [EXTRACTED]
  docs/PRODUCT-CARD-STANDARD.md → components/product-rail.tsx
- `Согласованный тестовый остаток 1 на вариант отдельным слоем` --references--> `demoInventory`  [EXTRACTED]
  docs/HOME-CARDS-REVIEW.md → lib/demo-inventory.ts
- `Один ProductCard / VariantProductCard для всех товарных списков` --references--> `ProductCard()`  [EXTRACTED]
  docs/PRODUCT-CARD-STANDARD.md → components/product-card.tsx

## Import Cycles
- None detected.

## Communities (59 total, 7 thin omitted)

### Community 0 - "Каталог и страницы ассортимента"
Cohesion: 0.06
Nodes (46): GET(), AutumnSkincareArticle(), metadata, metadata, Brand(), Props, Catalog(), metadata (+38 more)

### Community 1 - "Боковая панель и подсказки"
Cohesion: 0.05
Nodes (41): Input(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+33 more)

### Community 2 - "Общие стили и таблицы"
Cohesion: 0.07
Nodes (40): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), BreadcrumbEllipsis(), BreadcrumbItem() (+32 more)

### Community 3 - "Поля ввода и кнопки"
Cohesion: 0.07
Nodes (33): Button(), buttonVariants, Calendar(), CalendarDayButton(), ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear() (+25 more)

### Community 4 - "Планы материалов и заказов"
Cohesion: 0.07
Nodes (41): Guest checkout research and approved direction, Approved guest checkout direction with same-browser session and phone recovery, Shop Pay documentation example; no live checkout or competitor verification, Planned honest price, stock and waitlist states, Planned stage 3: homepage product cards, Planned concrete-variant card and direct add-to-bag, Planned stage 4: homepage navigation and hero banners, Planned real-product K-Beauty, Luxury and Autumn hero compositions (+33 more)

### Community 5 - "Главная и страница товара"
Cohesion: 0.13
Nodes (21): BrandFocus(), brandStories, components_brand_focus_module, ProductCard(), ProductImage(), MouseDrag, HomeProps, labels (+13 more)

### Community 6 - "Главные баннеры и карусель"
Cohesion: 0.08
Nodes (26): campaigns, Hero(), components_hero_module, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps (+18 more)

### Community 7 - "Тематические подборки товаров"
Cohesion: 0.14
Nodes (21): CollectionPage(), generateMetadata(), Props, История реализации 09–10.09.2026; прежний дизайн и правила, Историческая реализация: шесть подборок по 10 существующих товаров, collectionMeta, CollectionSlug, featuredBrands (+13 more)

### Community 8 - "Карточки конкретных вариантов"
Cohesion: 0.13
Nodes (19): components_variant_product_card_module, VariantProductCard(), Variant, demoInventory, purchaseQuantityLimit, stockNotice, homeVariant, resolveProductVariant() (+11 more)

### Community 9 - "Корзина и браузерное состояние"
Cohesion: 0.16
Nodes (22): brandUrl(), StoreShell(), RecentViewed(), addBagLine(), BagLine, isBagLine(), isProduct(), isRecord() (+14 more)

### Community 10 - "Пакет приложения и зависимости"
Cohesion: 0.08
Nodes (24): name, private, type, version, @cloudflare/vite-plugin, @cloudflare/workers-types, clsx, date-fns (+16 more)

### Community 11 - "Библиотеки интерфейса"
Cohesion: 0.08
Nodes (25): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+17 more)

### Community 12 - "Общие утилиты интерфейса"
Cohesion: 0.11
Nodes (11): Badge(), badgeVariants, Checkbox(), HoverCardContent(), Progress(), ScrollArea(), ScrollBar(), Slider() (+3 more)

### Community 13 - "Фильтры и пагинация каталога"
Cohesion: 0.12
Nodes (19): fmt(), Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink(), PaginationLinkProps, PaginationNext() (+11 more)

### Community 14 - "Выпадающие меню и переключатели"
Cohesion: 0.09
Nodes (14): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+6 more)

### Community 15 - "Избранное и страницы брендов"
Cohesion: 0.14
Nodes (12): metadata, metadata, Favorites(), SiteLink(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader() (+4 more)

### Community 16 - "Диалоги и поиск команд"
Cohesion: 0.11
Nodes (16): Command(), CommandDialog(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut() (+8 more)

### Community 17 - "Конфигурация сборки и установки"
Cohesion: 0.14
Nodes (15): build_sites_vite_plugin, build_sites_vite_plugin_sites, openai_hosting, ref_node_child_process, ref_node_fs, ref_node_path, ref_node_url, vinext (+7 more)

### Community 18 - "Оболочка магазина и навигация"
Cohesion: 0.15
Nodes (14): app_globals, metadata, CategoryIcon(), icons, roots, Shop, ShopContext, Accordion() (+6 more)

### Community 19 - "Группы элементов интерфейса"
Cohesion: 0.13
Nodes (17): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Item(), ItemActions(), ItemContent(), ItemDescription() (+9 more)

### Community 20 - "Настройки TypeScript"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 21 - "Зависимости среды разработки"
Cohesion: 0.11
Nodes (19): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, react-server-dom-webpack, tailwindcss (+11 more)

### Community 22 - "Настройка компонентов shadcn"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, registries, rsc (+9 more)

### Community 23 - "Цена и витринные варианты"
Cohesion: 0.25
Nodes (16): Bag(), ProductDetail(), useShop(), formatPrice(), hasPrice(), productPrice(), rubles, clean() (+8 more)

### Community 24 - "Декоративные элементы интерфейса"
Cohesion: 0.14
Nodes (15): Alert(), AlertDescription(), AlertTitle(), alertVariants, Bubble(), BubbleContent(), BubbleGroup(), BubbleReactions() (+7 more)

### Community 25 - "Панель меню"
Cohesion: 0.12
Nodes (11): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator(), MenubarShortcut() (+3 more)

### Community 26 - "Контекстное меню"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 27 - "Требования и порядок этапов"
Cohesion: 0.15
Nodes (16): Навигационный план заданий: не подтверждение реализации, Только выбранный этап; следующий после проверки и отдельного поручения, Основной сборник 30 заданий: будущие работы и зависимости, План интеграций: 9А–Г 1С, 10А–Г заказы, 11А–Г кабинет и WhatsApp, План: 0→1→2→3→4→5А–В→6А–В→7А→8; 7Б отдельной веткой, Утверждённый свод имеет приоритет над ранним проектом требований, Этап 7А: макеты каталога/PDP требуют явного подтверждения до внедрения, Утверждённый свод требований, 17.09.2026 (+8 more)

### Community 28 - "Диаграммы интерфейса"
Cohesion: 0.19
Nodes (12): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+4 more)

### Community 29 - "Подписи и поля формы"
Cohesion: 0.16
Nodes (12): Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup(), FieldLabel(), FieldLegend(), FieldSeparator() (+4 more)

### Community 30 - "Среда локального запуска"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 31 - "Диалоги подтверждения"
Cohesion: 0.15
Nodes (9): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia(), AlertDialogOverlay() (+1 more)

### Community 32 - "Состояние полей формы"
Cohesion: 0.21
Nodes (11): FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue, FormLabel() (+3 more)

### Community 33 - "Компоненты вложений"
Cohesion: 0.20
Nodes (11): Attachment(), AttachmentAction(), AttachmentActions(), AttachmentContent(), AttachmentDescription(), AttachmentGroup(), AttachmentMedia(), attachmentMediaVariants (+3 more)

### Community 34 - "Выдвижные панели"
Cohesion: 0.17
Nodes (7): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle(), vaul

### Community 35 - "Примеры D1 и БД"
Cohesion: 0.33
Nodes (7): getDb(), GET(), POST(), toRouteErrorMessage(), notes, ref_cloudflare_workers, drizzle-orm

### Community 36 - "Меню навигации"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 37 - "Архитектурный аудит этапа ноль"
Cohesion: 0.22
Nodes (10): Архитектурный аудит: завершённый этап 0, 17.09.2026, Этап 0 завершён: пять групп ошибок исправлены и проверены, localStorage: независимые ключи, проверка снимков, сохранение старого формата, JSON → серверный lib/catalog.ts → страницы/API → клиентские props, Архитектура после этапа 0, исторический снимок 17.09.2026, Серверные заказы, кабинет, 1С и WhatsApp пока отсутствуют, Задание этапа 1: исследование без изменения кода, Задание этапа 1 требует исследования и источников без изменения кода (+2 more)

### Community 38 - "Маршруты авторизации ChatGPT"
Cohesion: 0.39
Nodes (8): chatGPTSignInPath(), chatGPTSignOutPath(), ChatGPTUser, getChatGPTUser(), isReservedAuthPath(), requireChatGPTUser(), safeDecodeURIComponent(), safeRelativeReturnPath()

### Community 39 - "Планы приёмки и передачи"
Cohesion: 0.28
Nodes (9): Planned stage 8: mobile usability and validation, Planned accessible mobile navigation and interaction checks, Planned 320-430 pixel mobile QA matrix and evidence report, Planned stages 12A-12V: acceptance and verification, Planned evidence-backed acceptance matrix and prioritized fixes, Planned owner confirmation after final scenario and visual checks, Planned verified runbook, architecture and developer handoff, Planned stage 13: technical audit and developer handoff (+1 more)

### Community 40 - "Исторический импорт каталога"
Cohesion: 0.22
Nodes (7): hashlib, json, openpyxl, pathlib, re, Read-only import: latest uploaded catalog is authoritative; match variant…, sys

### Community 41 - "Команды проекта"
Cohesion: 0.22
Nodes (9): scripts, build, db:generate, dev, install:ci, lint, start, test:api (+1 more)

### Community 42 - "Всплывающие панели"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 43 - "История этапов проекта"
Cohesion: 0.29
Nodes (8): Результат этапа 2: фирменные цвета и логотип, Растровая реконструкция логотипа grace в шапке и подвале, Экранная палитра: #9E91C2, кнопки #655383, Этапы 0–3 и сенсорные товарные ленты приняты, История выполнения: этапы 0–3 приняты, этап 4 не закрыт, Подтверждённый референс Hey!Babes: www.heybabescosmetics.com, Завершённое исследование референсов, этап 1, Исследовательские предложения: четыре темы/24 варианта и шесть нижних пунктов

### Community 44 - "Прокрутка товарных лент"
Cohesion: 0.48
Nodes (5): ProductRail(), pointerEnd(), positions(), scrollTo(), step()

### Community 45 - "Сохранённый этап четыре"
Cohesion: 0.48
Nodes (7): Дневник решений, включая заморозку этапа 4, Текущее поручение: оставить баннеры как есть; автоматические правки остановлены, Актуальная точка продолжения: 22.09.2026, Этап 4: сохранённый результат и незавершённая приёмка, Приёмка этапа 4 открыта: U2/U4/V1, 14 подтверждённых и 3 открытых проверки, Этап 4 сохранён: три баннера, внутренние стрелки, компактный осенний блок, README: запуск, ограничения и текущая остановка этапа 4

### Community 46 - "Единый стандарт карточек"
Cohesion: 0.29
Nodes (7): Согласованный тестовый остаток 1 на вариант отдельным слоем, Отчёт этапа 3: карточки конкретных вариантов и тестовый остаток, Карточка, цена, URL и покупка относятся к одному конкретному варианту, Действующий единый стандарт товарных карточек и лент, Нативные ProductRail: overflow-x:auto, touch-action:auto и scroll-snap, Один ProductCard / VariantProductCard для всех товарных списков, homeVariantIds

### Community 47 - "Правила сохранности проекта"
Cohesion: 0.33
Nodes (6): Правила продолжения Grace и сохранения данных, Сохранять существующий сайт, 4526 товаров, 6089 вариантов и 350 брендов, Товарные фотографии реальные; цены, скидки и наличие не выдумывать, Рабочая копия D:\grace; прежняя копия на C сохранена без изменений, Проверенный перенос рабочей папки на D, 17.09.2026, Фото: собрать оригиналы и реестр → единый белый холст/масштаб → подключать партиями

### Community 48 - "Поля одноразового кода"
Cohesion: 0.33
Nodes (4): InputOTP(), InputOTPGroup(), InputOTPSlot(), input-otp

### Community 49 - "Изменяемые размеры панелей"
Cohesion: 0.40
Nodes (3): ResizableHandle(), ResizablePanelGroup(), react-resizable-panels

### Community 50 - "Установка зависимостей CI"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 52 - "Настройки проверки ESLint"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

## Knowledge Gaps
- **201 isolated node(s):** `metadata`, `metadata`, `Props`, `metadata`, `Props` (+196 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 324 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

- Как единая карточка связана с лентой товаров и выбором варианта?
  Проверенный путь: VariantProductCard() ← product-card.tsx ← product-rail.tsx → ProductRail(); соседние узлы включают Variant и variantProductUrl().

## Scope and integrity notes

Current code/configuration and project documents are indexed. .graphifyignore excludes historical artifacts, raw materials, public media, vendored files, the full conversation JSON and generated lockfile. No product photos were analyzed. The graph is an aid to navigation; explicit source requirements and current code remain authoritative.

Parser diagnostics: 25 dangling-endpoint edges, 0 missing-endpoint edges, 1 self-loop edges, 15 same-endpoint edges collapsed in the default undirected graph. Full diagnostics: GRAPH_HEALTH.md and graph-health.json. Unresolved CSS/data imports and external references must not be treated as verified symbol definitions. Raw extraction is retained in extraction-audit.json.
