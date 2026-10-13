# Graph Report - grace  (2026-09-24)

## Corpus Check
- 220 files · ~152,210 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .css 11, (none) 2, .zip 1)

## Summary
- 1426 nodes · 2616 edges · 110 communities (93 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0d439c31`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- catalog.ts
- combobox.tsx
- breadcrumb.tsx
- avatar.tsx
- Замечания
- journal.tsx
- alert-dialog.tsx
- storefront.tsx
- product-detail.tsx
- shop-state.ts
- package.json
- dependencies
- catalog-view.tsx
- popover.tsx
- alert.tsx
- Grace Cosmetics — все промпты для GPT-6 Astra
- command.tsx
- sheet.tsx
- Grace — этапы и готовые задания
- radix-ui
- compilerOptions
- devDependencies
- components.json
- Страницы и компоненты
- bubble.tsx
- catalog-variants.test.mjs
- context-menu.tsx
- Исследование референсов и Grace — этап 1
- chart.tsx
- ProductRail
- sites-env.sh
- carousel.tsx
- form.tsx
- attachment.tsx
- drawer.tsx
- notes/route.ts
- field.tsx
- Grace Cosmetics — initial catalog website
- Grace Cosmetics — локальный проект
- store-shell.tsx
- import-catalog.py
- scripts
- menubar.tsx
- variant-cards.test.mjs
- Прогресс Grace
- Grace Cosmetics — свод требований для подтверждения
- EXECUTION-STATUS.md
- personal-pages.tsx
- 7А — макет до внедрения, 24 сентября 2026
- Этап 6А — оригиналы фотографий и реестр
- install-ci.sh
- 6В — фотографии и проверенные тексты
- eslint.config.mjs
- cloudflare-env.d.ts
- Архитектура Grace Cosmetics
- Этап 5Б — редакционные источники и выбор товаров
- Дневник изменений Grace Cosmetics
- postcss.config.mjs
- build-verified.sh
- Приложение — утверждённые требования
- Grace Cosmetics — итоговый свод на подтверждение
- Задание 13 для GPT-6 Astra — полная техническая ревизия и передача разработчику
- react
- 13. Техническая ревизия и передача разработчику
- Перенос рабочей папки на диск D
- Контекст исходной работы Grace Cosmetics
- Задание 8 для GPT-6 Astra — полноценная мобильная версия
- Перенос Grace Cosmetics в grace test
- Этап 2 — цвета и логотип Grace
- 8. Полноценная мобильная версия
- site-footer.tsx
- Q: Stage 5A: storefront collections and Anua dependencies
- Этап 4 — сверка источников
- Задание 0 для GPT-6 Astra — привести проект в порядок перед доработками
- Этап 9 — четыре отдельных задания для GPT-6 Astra
- Этап 10 — четыре отдельных задания для GPT-6 Astra
- Этап 11 — кабинет и уведомления для GPT-6 Astra
- site-link.tsx
- 0. Техническая подготовка существующего проекта
- Возвращающийся покупатель без обязательной регистрации
- Этап 6 для GPT-6 Astra — материалы товаров главной
- Этап 12 для GPT-6 Astra — финальная проверка
- START-ASTRA.md
- STEP-02-BRAND-ASTRA.md
- STEP-03-CARDS-ASTRA.md
- STEP-04-HERO-ASTRA.md
- STAGE-05A-REVIEW.md
- STEP-05B-BLOG-ASTRA.md
- STEP-05V-FOOTER-ASTRA.md
- STEP-07A-CATALOG-ASTRA.md
- STEP-07B-CATALOG-MATERIALS-ASTRA.md
- STEP-09-1C-ASTRA.md
- navigation-menu.tsx
- collections/[slug]/page.tsx
- Этап 5В: источники для документов Grace
- Этап 5В — аудит сведений Grace для подвала
- utils.ts
- Q: Давай приступаем к следующему этапу, пять Б
- step05v-owner-data.md
- dropdown-menu.tsx
- empty.tsx
- Этап 5В — подвал Grace
- Этап 3 — карточки товаров и общий стандарт
- hero.tsx
- Q: footer shell navigation reference requirements
- cn
- input-otp.tsx
- resizable.tsx
- Этап 6Б — подготовка фотографий

## God Nodes (most connected - your core abstractions)
1. `cn()` - 327 edges
2. `react` - 68 edges
3. `lucide-react` - 44 edges
4. `Замечания` - 43 edges
5. `radix-ui` - 38 edges
6. `Grace Cosmetics — все промпты для GPT-6 Astra` - 37 edges
7. `Grace — этапы и готовые задания` - 19 edges
8. `VariantProductCard()` - 18 edges
9. `Product` - 17 edges
10. `class-variance-authority` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Проверка подготовленных текстов` --references--> `Bag()`  [INFERRED]
  docs/step05v-legal-research.md → components/personal-pages.tsx
- `Сохранённый контекст предварительного аудита этапа 0` --references--> `StoreShell()`  [INFERRED]
  docs/MOVE-TO-D.md → components/store-shell.tsx
- `Сделано` --references--> `VariantProductCard()`  [INFERRED]
  docs/HOME-CARDS-REVIEW.md → components/variant-product-card.tsx
- `Сделано` --references--> `productMedia()`  [INFERRED]
  docs/STAGE-06V-REVIEW.md → lib/product-media.ts
- `Страницы и компоненты` --references--> `BrandsView()`  [INFERRED]
  docs/ARCHITECTURE.md → components/brands-view.tsx

## Import Cycles
- None detected.

## Communities (110 total, 17 thin omitted)

### Community 0 - "catalog.ts"
Cohesion: 0.08
Nodes (38): GET(), metadata, Brand(), Props, Catalog(), metadata, Category(), Props (+30 more)

### Community 1 - "combobox.tsx"
Cohesion: 0.08
Nodes (24): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+16 more)

### Community 2 - "breadcrumb.tsx"
Cohesion: 0.25
Nodes (6): BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 3 - "avatar.tsx"
Cohesion: 0.29
Nodes (6): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

### Community 4 - "Замечания"
Cohesion: 0.05
Nodes (43): 10. Убрать подпись об иллюстрациях под «Брендами в фокусе», 11. Сохранить блок «Наши подборки», применить только общие изменения карточек, 12. Полностью убрать блок «Вам может понравиться», 13. Переработать нижний BRAND FOCUS: крупный баннер и карусель товаров, 14. Сохранить блок «Парфюмерия», 15. Добавить блог перед блоком «Вы недавно смотрели», 16. Добавить компактный выбор брендов после блога, 17. Полностью удалить блок «Нужна помощь с выбором» (+35 more)

### Community 5 - "journal.tsx"
Cohesion: 0.05
Nodes (43): metadata, metadata, Props, Home(), generateMetadata(), components_autumn_editorial_module, AutumnEditorialPromo(), components_autumn_promo_module (+35 more)

### Community 6 - "alert-dialog.tsx"
Cohesion: 0.09
Nodes (19): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia(), AlertDialogOverlay() (+11 more)

### Community 7 - "storefront.tsx"
Cohesion: 0.18
Nodes (12): CollectionPhoto, GraceCollections(), components_brand_focus_module, CategoryIcon(), icons, HomeProps, labels, Tabs() (+4 more)

### Community 8 - "product-detail.tsx"
Cohesion: 0.16
Nodes (22): ProductImage(), components_product_detail_module, Props, MouseDrag, RadioGroup(), RadioGroupItem(), VariantProductCard(), data_product_content (+14 more)

### Community 9 - "shop-state.ts"
Cohesion: 0.14
Nodes (27): brandUrl(), StoreShell(), addBagLine(), favoriteMatches(), isBagLine(), isProduct(), isRecord(), isStringList() (+19 more)

### Community 10 - "package.json"
Cohesion: 0.07
Nodes (26): engines, node, name, private, type, version, @cloudflare/vite-plugin, @cloudflare/workers-types (+18 more)

### Community 11 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+17 more)

### Community 12 - "catalog-view.tsx"
Cohesion: 0.13
Nodes (18): components_catalog_view_module, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink(), PaginationLinkProps, PaginationNext() (+10 more)

### Community 13 - "popover.tsx"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 14 - "alert.tsx"
Cohesion: 0.50
Nodes (4): Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 15 - "Grace Cosmetics — все промпты для GPT-6 Astra"
Cohesion: 0.06
Nodes (33): 10А. Форма и правила заказа, 10Б. Надёжно сохранить заказ, 10В. Автоматически отправить менеджеру, 10Г. Проверить полный путь покупателя, 11А. Запоминание гостя и доступ по телефону, 11Б. История заказов и адреса, 11В. Подписка на конкретный вариант, 11Г. Уведомление о поступлении (+25 more)

### Community 16 - "command.tsx"
Cohesion: 0.11
Nodes (16): Command(), CommandDialog(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut() (+8 more)

### Community 17 - "sheet.tsx"
Cohesion: 0.29
Nodes (4): Sheet(), SheetClose(), SheetFooter(), SheetOverlay()

### Community 18 - "Grace — этапы и готовые задания"
Cohesion: 0.10
Nodes (19): 10. Заказ и отправка менеджеру, 11. Кабинет и уведомления о поступлении, 12. Финальная проверка, 13. Полная техническая ревизия и передача разработчику, 1. Изучить образец и текущий сайт, 2. Фирменное оформление, 3. Карточки товаров на главной, 4. Верх главной и баннеры (+11 more)

### Community 19 - "radix-ui"
Cohesion: 0.08
Nodes (30): Badge(), badgeVariants, ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Item(), ItemActions() (+22 more)

### Community 20 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 21 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, react-server-dom-webpack, tailwindcss (+11 more)

### Community 22 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, registries, rsc (+9 more)

### Community 23 - "Страницы и компоненты"
Cohesion: 0.23
Nodes (17): Bag(), ProductDetail(), Страницы и компоненты, Товары, варианты и цены, formatPrice(), hasPrice(), productPrice(), rubles (+9 more)

### Community 24 - "bubble.tsx"
Cohesion: 0.38
Nodes (6): Bubble(), BubbleContent(), BubbleGroup(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants

### Community 25 - "catalog-variants.test.mjs"
Cohesion: 0.06
Nodes (32): build_sites_vite_plugin, build_sites_vite_plugin_sites, Аудит архитектуры — этап 0, Границы и безопасность, Исходная проверка до исправлений, Итоговая проверка, Как устроено, Подтверждённые ошибки и локальный объём исправлений (+24 more)

### Community 26 - "context-menu.tsx"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 27 - "Исследование референсов и Grace — этап 1"
Cohesion: 0.12
Nodes (17): HeyBabies: мобильные наблюдения, HeyBabies: непосредственные настольные наблюдения, Акцент на губы, Волосы: от мытья до укладки, Границы проверки и следующий этап, Дополнительные ориентиры баннеров, Исследование референсов и Grace — этап 1, Контрольная сверка с исходным заданием (+9 more)

### Community 28 - "chart.tsx"
Cohesion: 0.19
Nodes (12): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+4 more)

### Community 29 - "ProductRail"
Cohesion: 0.25
Nodes (9): ProductRail(), pointerEnd(), positions(), scrollTo(), step(), Единая карточка Grace, Один компонент и правила отображения, Проверка (+1 more)

### Community 30 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 31 - "carousel.tsx"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 32 - "form.tsx"
Cohesion: 0.21
Nodes (11): FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue, FormLabel() (+3 more)

### Community 33 - "attachment.tsx"
Cohesion: 0.20
Nodes (11): Attachment(), AttachmentAction(), AttachmentActions(), AttachmentContent(), AttachmentDescription(), AttachmentGroup(), AttachmentMedia(), attachmentMediaVariants (+3 more)

### Community 34 - "drawer.tsx"
Cohesion: 0.17
Nodes (7): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle(), vaul

### Community 35 - "notes/route.ts"
Cohesion: 0.33
Nodes (7): getDb(), GET(), POST(), toRouteErrorMessage(), notes, ref_cloudflare_workers, drizzle-orm

### Community 36 - "field.tsx"
Cohesion: 0.16
Nodes (12): Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup(), FieldLabel(), FieldLegend(), FieldSeparator() (+4 more)

### Community 37 - "Grace Cosmetics — initial catalog website"
Cohesion: 0.13
Nodes (14): Assets, Data and commercial behavior, Follow-up inputs, Grace Cosmetics — initial catalog website, Header and curated storefront update — 2026-09-10, Initial implementation record (superseded visual design), Navigation repair, Pages and flows (+6 more)

### Community 38 - "Grace Cosmetics — локальный проект"
Cohesion: 0.11
Nodes (23): chatGPTSignInPath(), chatGPTSignOutPath(), ChatGPTUser, getChatGPTUser(), isReservedAuthPath(), requireChatGPTUser(), safeDecodeURIComponent(), safeRelativeReturnPath() (+15 more)

### Community 39 - "store-shell.tsx"
Cohesion: 0.15
Nodes (14): app_globals, metadata, roots, Shop, ShopContext, Accordion(), AccordionContent(), AccordionItem() (+6 more)

### Community 40 - "import-catalog.py"
Cohesion: 0.22
Nodes (7): hashlib, json, openpyxl, pathlib, re, Read-only import: latest uploaded catalog is authoritative; match variant…, sys

### Community 41 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, db:generate, dev, install:ci, lint, start, test:api (+1 more)

### Community 42 - "menubar.tsx"
Cohesion: 0.12
Nodes (11): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator(), MenubarShortcut() (+3 more)

### Community 43 - "variant-cards.test.mjs"
Cohesion: 0.11
Nodes (17): Product(), Props, demoInventory, defaultCardVariant(), homeVariant, homeVariantIds, getProductContent(), ref_node_assert (+9 more)

### Community 44 - "Прогресс Grace"
Cohesion: 0.12
Nodes (16): 22 сентября 2026 — повторная проверка управления этапа 4, 22 сентября 2026 — этап 4 полностью завершён, 22 сентября 2026 — этап 4 сохранён по поручению пользователя, Архив подготовки заданий до реализации, Прогресс Grace, Продолжение 22 сентября 2026 — проверка сенсорных лент, Рабочая папка и перенос — 17 сентября 2026, Текущий результат — 6В завершён 23 сентября 2026 (+8 more)

### Community 45 - "Grace Cosmetics — свод требований для подтверждения"
Cohesion: 0.20
Nodes (9): Grace Cosmetics — свод требований для подтверждения, Блоки главной и карточки, Верхняя часть главной, Внутренняя страница товара, Дальнейший порядок согласования, Каталог и мобильная навигация, Общий дизайн, Решения, которые нужно обсудить до финального подтверждения (+1 more)

### Community 47 - "personal-pages.tsx"
Cohesion: 0.21
Nodes (12): metadata, metadata, Favorites(), SavedProductCard(), useSavedProducts(), useShop(), RecentViewed(), components_variant_product_card_module (+4 more)

### Community 48 - "7А — макет до внедрения, 24 сентября 2026"
Cohesion: 0.29
Nodes (7): 7А — макет до внедрения, 24 сентября 2026, Использованные навыки, Основание согласования, Проверено, Точка продолжения, Что предлагается, Экраны

### Community 49 - "Этап 6А — оригиналы фотографий и реестр"
Cohesion: 0.33
Nodes (5): Ограничения для следующего этапа, Охват и проверка, Пропуски, Результат, Этап 6А — оригиналы фотографий и реестр

### Community 50 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 51 - "6В — фотографии и проверенные тексты"
Cohesion: 0.33
Nodes (5): 6В — фотографии и проверенные тексты, Осталось, Проверено, Результат на экранах, Сделано

### Community 52 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 54 - "Архитектура Grace Cosmetics"
Cohesion: 0.25
Nodes (7): Архитектура Grace Cosmetics, Браузерное состояние, Где вносить будущие изменения, Источники данных и поток, Конфигурация и границы безопасности, Проверки и ограничения, Стек и запуск

### Community 55 - "Этап 5Б — редакционные источники и выбор товаров"
Cohesion: 0.17
Nodes (10): Осталось вне этапа, Проверено, Сделано, Этап 5Б — завершён, Два новых гайда, Изображения и недостающие материалы, Осенний материал: сохранение и проверка, Проверка редакционного листа (+2 more)

### Community 56 - "Дневник изменений Grace Cosmetics"
Cohesion: 0.17
Nodes (12): 22 сентября 2026 — повторная проверка управления этапа 4, 22 сентября 2026 — фиксация перед этапом 4, 22 сентября 2026 — этап 4 полностью завершён, 22 сентября 2026 — этап 4 сохранён по поручению пользователя, 23 сентября 2026 — этап 5А, 23 сентября 2026 — этап 5Б, 23 сентября 2026 — этап 5В, Действующие ограничения (+4 more)

### Community 59 - "Приложение — утверждённые требования"
Cohesion: 0.25
Nodes (8): Главная страница, Дизайн и материалы, Заказ, кабинет и данные, Карточки и страницы товаров, Мобильная навигация, Приложение — утверждённые требования, Уточнения после проверки свода и текущего кода, Что выясняется на соответствующих этапах, не задерживая подтверждение этого свода

### Community 60 - "Grace Cosmetics — итоговый свод на подтверждение"
Cohesion: 0.25
Nodes (8): Grace Cosmetics — итоговый свод на подтверждение, Главная страница, Дизайн и материалы, Заказ, кабинет и данные, Карточки и страницы товаров, Мобильная навигация, Уточнения после проверки свода и текущего кода, Что выясняется на соответствующих этапах, не задерживая подтверждение этого свода

### Community 61 - "Задание 13 для GPT-6 Astra — полная техническая ревизия и передача разработчику"
Cohesion: 0.25
Nodes (7): 1. Определить объём и исходное состояние, 2. Проверить архитектуру и качество кода, 3. Проверить данные, надёжность и безопасность, 4. Проверить производительность и сопровождение, 5. Исправить проблемы и перепроверить, 6. Передать понятный проект, Задание 13 для GPT-6 Astra — полная техническая ревизия и передача разработчику

### Community 63 - "13. Техническая ревизия и передача разработчику"
Cohesion: 0.29
Nodes (7): 13. Техническая ревизия и передача разработчику, 1. Определить объём и исходное состояние, 2. Проверить архитектуру и качество кода, 3. Проверить данные, надёжность и безопасность, 4. Проверить производительность и сопровождение, 5. Исправить проблемы и перепроверить, 6. Передать понятный проект

### Community 64 - "Перенос рабочей папки на диск D"
Cohesion: 0.29
Nodes (6): Изменения только в новой копии, Перенос рабочей папки на диск D, Полнота копии, Проверка новой папки, Продолжение в Codex, Сохранённый контекст предварительного аудита этапа 0

### Community 65 - "Контекст исходной работы Grace Cosmetics"
Cohesion: 0.18
Nodes (8): Grace hero campaigns, Доступные материалы и что из них следует, Источник и полнота, Контекст исходной работы Grace Cosmetics, Незавершённое и неподтверждённое по исходной истории, Решения, которые нужно сохранить при продолжении, Хронология требований и заявленных результатов, Что считается полным переносом по текущему поручению

### Community 66 - "Задание 8 для GPT-6 Astra — полноценная мобильная версия"
Cohesion: 0.29
Nodes (6): 1. Проверить и составить список проблем, 2. Сделать удобную навигацию, 3. Привести в порядок всю мобильную вёрстку, 4. Устранить задержки и ошибки взаимодействия, 5. Проверить исправления и показать результат, Задание 8 для GPT-6 Astra — полноценная мобильная версия

### Community 67 - "Перенос Grace Cosmetics в grace test"
Cohesion: 0.29
Nodes (7): Где хранятся данные, Итог проверки локального запуска — 13 сентября 2026, Как продолжать, Перенос Grace Cosmetics в grace test, Полнота исходных материалов и ограничения, Происхождение, Что перенесено

### Community 68 - "Этап 2 — цвета и логотип Grace"
Cohesion: 0.33
Nodes (6): Ограничения и дальнейшая работа, Палитра, Проверено, Сделано, Снимки, Этап 2 — цвета и логотип Grace

### Community 69 - "8. Полноценная мобильная версия"
Cohesion: 0.33
Nodes (6): 1. Проверить и составить список проблем, 2. Сделать удобную навигацию, 3. Привести в порядок всю мобильную вёрстку, 4. Устранить задержки и ошибки взаимодействия, 5. Проверить исправления и показать результат, 8. Полноценная мобильная версия

### Community 70 - "site-footer.tsx"
Cohesion: 0.21
Nodes (6): metadata, components_site_footer_module, SiteFooter(), data_navigation, legalDocuments, storeDetails

### Community 71 - "Q: Stage 5A: storefront collections and Anua dependencies"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Stage 5A: storefront collections and Anua dependencies, Source Nodes

### Community 72 - "Этап 4 — сверка источников"
Cohesion: 0.17
Nodes (9): Источник и инструменты, Сделано / проверено, Сохранение, Этап 4 завершён — 22 сентября 2026, Какие документы задают требования, Последовательность и более поздние решения, Проверка сопоставления, Семь пунктов и точные места в источниках (+1 more)

### Community 73 - "Задание 0 для GPT-6 Astra — привести проект в порядок перед доработками"
Cohesion: 0.33
Nodes (5): 1. Проверить архитектуру, 2. Выполнить необходимую очистку, 3. Проверить сохранность поведения, 4. Подготовить передачу разработчику, Задание 0 для GPT-6 Astra — привести проект в порядок перед доработками

### Community 74 - "Этап 9 — четыре отдельных задания для GPT-6 Astra"
Cohesion: 0.33
Nodes (5): 9А. Определить правила обмена, 9Б. Сопоставить товары и варианты, 9В. Реализовать и проверить получение данных, 9Г. Подключить данные к сайту, Этап 9 — четыре отдельных задания для GPT-6 Astra

### Community 75 - "Этап 10 — четыре отдельных задания для GPT-6 Astra"
Cohesion: 0.33
Nodes (5): 10А. Форма и правила заказа, 10Б. Надёжно сохранить заказ, 10В. Автоматически отправить менеджеру, 10Г. Проверить полный путь покупателя, Этап 10 — четыре отдельных задания для GPT-6 Astra

### Community 76 - "Этап 11 — кабинет и уведомления для GPT-6 Astra"
Cohesion: 0.33
Nodes (5): 11А. Запоминание гостя и доступ по телефону, 11Б. История заказов и адреса, 11В. Подписка на конкретный вариант, 11Г. Уведомление о поступлении, Этап 11 — кабинет и уведомления для GPT-6 Astra

### Community 78 - "0. Техническая подготовка существующего проекта"
Cohesion: 0.40
Nodes (5): 0. Техническая подготовка существующего проекта, 1. Проверить архитектуру, 2. Выполнить необходимую очистку, 3. Проверить сохранность поведения, 4. Подготовить передачу разработчику

### Community 79 - "Возвращающийся покупатель без обязательной регистрации"
Cohesion: 0.40
Nodes (4): Возвращающийся покупатель без обязательной регистрации, Граница исследования, Проверенный пример, Решение Grace, подтверждённое пользователем

### Community 80 - "Этап 6 для GPT-6 Astra — материалы товаров главной"
Cohesion: 0.40
Nodes (4): Задание 6А — собрать оригиналы и реестр, Задание 6Б — привести фотографии к единому виду, Задание 6В — подключить партиями и заполнить тексты, Этап 6 для GPT-6 Astra — материалы товаров главной

### Community 81 - "Этап 12 для GPT-6 Astra — финальная проверка"
Cohesion: 0.40
Nodes (4): 12А. Проверить весь результат, 12Б. Исправить найденные ошибки, 12В. Приёмка функций и внешнего вида, Этап 12 для GPT-6 Astra — финальная проверка

### Community 86 - "STAGE-05A-REVIEW.md"
Cohesion: 0.29
Nodes (5): Материалы и границы, Проверено, Сделано, Этап 5А — подборки и блоки главной, Задание 5А для GPT-6 Astra — подборки и блоки главной

### Community 92 - "navigation-menu.tsx"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 94 - "collections/[slug]/page.tsx"
Cohesion: 0.16
Nodes (11): Grace Cosmetics, graphify, Локальная работа, Сохранять при продолжении, CollectionPage(), generateMetadata(), Props, ProductCard() (+3 more)

### Community 95 - "Этап 5В: источники для документов Grace"
Cohesion: 0.29
Nodes (6): Возврат дистанционной покупки, Заявка, менеджер и заключение договора, Персональные данные, Проверка подготовленных текстов, Фактические границы текущего проекта, Этап 5В: источники для документов Grace

### Community 96 - "Этап 5В — аудит сведений Grace для подвала"
Cohesion: 0.33
Nodes (5): Контакты: существующий код не равен доказательству владельца, Один вопрос владельцу, Подтверждённое содержание и его происхождение, Реальные полезные назначения ссылок, Этап 5В — аудит сведений Grace для подвала

### Community 97 - "utils.ts"
Cohesion: 0.09
Nodes (10): HoverCardContent(), Kbd(), KbdGroup(), Progress(), ScrollArea(), ScrollBar(), Skeleton(), Slider() (+2 more)

### Community 98 - "Q: Давай приступаем к следующему этапу, пять Б"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Давай приступаем к следующему этапу, пять Б, Source Nodes

### Community 100 - "dropdown-menu.tsx"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 103 - "empty.tsx"
Cohesion: 0.24
Nodes (9): BrandsView(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle() (+1 more)

### Community 106 - "Этап 5В — подвал Grace"
Cohesion: 0.25
Nodes (7): Основания, Осталось вне этапа, Проверено, Сделано, Снимки, Уточнение по компактности подвала — 23 сентября 2026, Этап 5В — подвал Grace

### Community 107 - "Этап 3 — карточки товаров и общий стандарт"
Cohesion: 0.33
Nodes (6): Временный остаток по поручению пользователя, Осталось и границы, Проверено, Сделано, Снимки, Этап 3 — карточки товаров и общий стандарт

### Community 109 - "hero.tsx"
Cohesion: 0.33
Nodes (4): campaigns, Hero(), components_hero_module, embla-carousel-react

### Community 110 - "Q: footer shell navigation reference requirements"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: footer shell navigation reference requirements, Source Nodes

### Community 111 - "cn"
Cohesion: 0.06
Nodes (61): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), Message() (+53 more)

### Community 112 - "input-otp.tsx"
Cohesion: 0.33
Nodes (4): InputOTP(), InputOTPGroup(), InputOTPSlot(), input-otp

### Community 113 - "resizable.tsx"
Cohesion: 0.40
Nodes (3): ResizableHandle(), ResizablePanelGroup(), react-resizable-panels

### Community 114 - "Этап 6Б — подготовка фотографий"
Cohesion: 0.40
Nodes (4): Непрошедшие подготовку, Проверено / осталось, Сделано, Этап 6Б — подготовка фотографий

## Knowledge Gaps
- **546 isolated node(s):** `metadata`, `Props`, `metadata`, `metadata`, `Props` (+541 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 686 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `Storefront()` (2× useful, score=1.984036695) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `combobox.tsx`, `breadcrumb.tsx`, `avatar.tsx`, `alert-dialog.tsx`, `storefront.tsx`, `product-detail.tsx`, `catalog-view.tsx`, `popover.tsx`, `alert.tsx`, `command.tsx`, `sheet.tsx`, `radix-ui`, `bubble.tsx`, `context-menu.tsx`, `chart.tsx`, `carousel.tsx`, `form.tsx`, `attachment.tsx`, `drawer.tsx`, `field.tsx`, `store-shell.tsx`, `menubar.tsx`, `react`, `navigation-menu.tsx`, `utils.ts`, `dropdown-menu.tsx`, `empty.tsx`, `input-otp.tsx`, `resizable.tsx`?**
  _High betweenness centrality (0.225) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `combobox.tsx`, `breadcrumb.tsx`, `avatar.tsx`, `journal.tsx`, `alert-dialog.tsx`, `storefront.tsx`, `product-detail.tsx`, `package.json`, `catalog-view.tsx`, `popover.tsx`, `alert.tsx`, `command.tsx`, `sheet.tsx`, `radix-ui`, `bubble.tsx`, `context-menu.tsx`, `chart.tsx`, `carousel.tsx`, `form.tsx`, `attachment.tsx`, `drawer.tsx`, `field.tsx`, `store-shell.tsx`, `menubar.tsx`, `personal-pages.tsx`, `site-link.tsx`, `navigation-menu.tsx`, `utils.ts`, `dropdown-menu.tsx`, `empty.tsx`, `hero.tsx`, `cn`, `input-otp.tsx`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `store-shell.tsx` to `combobox.tsx`, `breadcrumb.tsx`, `journal.tsx`, `alert-dialog.tsx`, `storefront.tsx`, `product-detail.tsx`, `package.json`, `catalog-view.tsx`, `command.tsx`, `sheet.tsx`, `context-menu.tsx`, `carousel.tsx`, `menubar.tsx`, `personal-pages.tsx`, `react`, `site-footer.tsx`, `navigation-menu.tsx`, `collections/[slug]/page.tsx`, `utils.ts`, `dropdown-menu.tsx`, `empty.tsx`, `hero.tsx`, `cn`, `input-otp.tsx`, `resizable.tsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **What connects `metadata`, `Props`, `metadata` to the rest of the system?**
  _546 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `catalog.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0783673469387755 - nodes in this community are weakly interconnected._
- **Should `combobox.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08172043010752689 - nodes in this community are weakly interconnected._
- **Should `Замечания` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._