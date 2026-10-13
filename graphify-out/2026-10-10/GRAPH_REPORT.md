# Graph Report - grace  (2026-10-10)

## Corpus Check
- 230 files · ~164,095 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .css 11, (none) 2, .zip 1)

## Summary
- 1489 nodes · 2698 edges · 115 communities (97 shown, 18 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0d439c31`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- brands/[slug]/page.tsx
- combobox.tsx
- Grace — действующий порядок работ с 10 октября 2026
- catalog.ts
- Замечания
- journal.tsx
- alert-dialog.tsx
- lucide-react
- product-detail.tsx
- shop-state.ts
- package.json
- dependencies
- catalog-view.tsx
- popover.tsx
- react
- Grace Cosmetics — все промпты для GPT-6 Astra
- command.tsx
- collection-selection.ts
- Grace — этапы и готовые задания
- item.tsx
- compilerOptions
- devDependencies
- components.json
- showcase-product.ts
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
- Продолжение Grace — 10 октября 2026
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
- Q: Existing catalog, account and inventory modules for Grace replanning
- 13. Техническая ревизия и передача разработчику
- Перенос рабочей папки на диск D
- Запуск и перепланирование Grace — 10 октября 2026
- Задание 8 для GPT-6 Astra — полноценная мобильная версия
- Этап 7А — внедрён, 24 сентября 2026
- Этап 2 — цвета и логотип Grace
- 8. Полноценная мобильная версия
- mobile-catalog-menu.tsx
- Q: Stage 5A: storefront collections and Anua dependencies
- Этап 4 — сверка источников
- Задание 0 для GPT-6 Astra — привести проект в порядок перед доработками
- Этап 9 — четыре отдельных задания для GPT-6 Astra
- Этап 10 — четыре отдельных задания для GPT-6 Astra
- Этап 11 — кабинет и уведомления для GPT-6 Astra
- next
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
- Этап 7Б — подключение по новому порядку
- collections/[slug]/page.tsx
- Этап 5В: источники для документов Grace
- Этап 5В — аудит сведений Grace для подвала
- STAGE-07B-FAST.md
- Q: Давай приступаем к следующему этапу, пять Б
- step05v-owner-data.md
- cn
- engines
- Аудит архитектуры — этап 0
- empty.tsx
- Этап 7Б — сбор материалов каталога
- Этап 5В — подвал Grace
- Этап 3 — карточки товаров и общий стандарт
- Q: footer shell navigation reference requirements
- sidebar.tsx
- input-otp.tsx
- resizable.tsx
- Этап 6Б — подготовка фотографий
- Grace Cosmetics
- drizzle-kit

## God Nodes (most connected - your core abstractions)
1. `cn()` - 327 edges
2. `react` - 69 edges
3. `lucide-react` - 45 edges
4. `Замечания` - 43 edges
5. `radix-ui` - 38 edges
6. `Grace Cosmetics — все промпты для GPT-6 Astra` - 37 edges
7. `Прогресс Grace` - 22 edges
8. `Grace — этапы и готовые задания` - 20 edges
9. `VariantProductCard()` - 19 edges
10. `Product` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Проверка подготовленных текстов` --references--> `Bag()`  [INFERRED]
  docs/step05v-legal-research.md → components/personal-pages.tsx
- `Сохранённый контекст предварительного аудита этапа 0` --references--> `StoreShell()`  [INFERRED]
  docs/MOVE-TO-D.md → components/store-shell.tsx
- `Сделано` --references--> `VariantProductCard()`  [INFERRED]
  docs/HOME-CARDS-REVIEW.md → components/variant-product-card.tsx
- `Сделано` --references--> `VariantProductCard()`  [INFERRED]
  docs/STAGE-07A-REVIEW.md → components/variant-product-card.tsx
- `Сделано` --references--> `productMedia()`  [INFERRED]
  docs/STAGE-06V-REVIEW.md → lib/product-media.ts

## Import Cycles
- None detected.

## Communities (115 total, 18 thin omitted)

### Community 0 - "brands/[slug]/page.tsx"
Cohesion: 0.23
Nodes (13): Brand(), Props, Catalog(), metadata, Category(), Props, metadata, Search() (+5 more)

### Community 1 - "combobox.tsx"
Cohesion: 0.08
Nodes (24): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+16 more)

### Community 2 - "Grace — действующий порядок работ с 10 октября 2026"
Cohesion: 0.25
Nodes (8): Grace — действующий порядок работ с 10 октября 2026, Зависимости и правила реализации, Исходное состояние, Полное соответствие 30 исходных заданий, Точная точка продолжения, Фаза 1 — сайт и пользовательские функции, Фаза 2 — фотографии и проверенные тексты, Фаза 3 — 1С, зависимые проверки и завершение

### Community 3 - "catalog.ts"
Cohesion: 0.14
Nodes (18): GET(), data_brands, data_product_images, data_products, data_summary, compareProducts(), featuredBrands, matchesType() (+10 more)

### Community 4 - "Замечания"
Cohesion: 0.05
Nodes (43): 10. Убрать подпись об иллюстрациях под «Брендами в фокусе», 11. Сохранить блок «Наши подборки», применить только общие изменения карточек, 12. Полностью убрать блок «Вам может понравиться», 13. Переработать нижний BRAND FOCUS: крупный баннер и карусель товаров, 14. Сохранить блок «Парфюмерия», 15. Добавить блог перед блоком «Вы недавно смотрели», 16. Добавить компактный выбор брендов после блога, 17. Полностью удалить блок «Нужна помощь с выбором» (+35 more)

### Community 5 - "journal.tsx"
Cohesion: 0.07
Nodes (31): metadata, metadata, Props, Home(), generateMetadata(), Product(), Props, components_autumn_editorial_module (+23 more)

### Community 6 - "alert-dialog.tsx"
Cohesion: 0.09
Nodes (19): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia(), AlertDialogOverlay() (+11 more)

### Community 7 - "lucide-react"
Cohesion: 0.13
Nodes (22): metadata, CollectionPhoto, GraceCollections(), components_brand_focus_module, Favorites(), MouseDrag, SavedProductCard(), useSavedProducts() (+14 more)

### Community 8 - "product-detail.tsx"
Cohesion: 0.19
Nodes (20): ProductImage(), components_product_detail_module, Props, components_variant_product_card_module, VariantProductCard(), data_product_content, data_variant_product_images, NavNode (+12 more)

### Community 9 - "shop-state.ts"
Cohesion: 0.15
Nodes (26): StoreShell(), addBagLine(), favoriteMatches(), isBagLine(), isProduct(), isRecord(), isStringList(), isVariant() (+18 more)

### Community 10 - "package.json"
Cohesion: 0.08
Nodes (24): name, private, type, version, @cloudflare/vite-plugin, @cloudflare/workers-types, clsx, date-fns (+16 more)

### Community 11 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+17 more)

### Community 12 - "catalog-view.tsx"
Cohesion: 0.12
Nodes (20): fmt(), components_catalog_view_module, Checkbox(), Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink() (+12 more)

### Community 13 - "popover.tsx"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 14 - "react"
Cohesion: 0.06
Nodes (30): AccordionContent(), AccordionItem(), AccordionTrigger(), Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge() (+22 more)

### Community 15 - "Grace Cosmetics — все промпты для GPT-6 Astra"
Cohesion: 0.06
Nodes (33): 10А. Форма и правила заказа, 10Б. Надёжно сохранить заказ, 10В. Автоматически отправить менеджеру, 10Г. Проверить полный путь покупателя, 11А. Запоминание гостя и доступ по телефону, 11Б. История заказов и адреса, 11В. Подписка на конкретный вариант, 11Г. Уведомление о поступлении (+25 more)

### Community 16 - "command.tsx"
Cohesion: 0.11
Nodes (16): Command(), CommandDialog(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut() (+8 more)

### Community 17 - "collection-selection.ts"
Cohesion: 0.18
Nodes (17): products, collectionMeta, CollectionSlug, featuredBrands, hasPromo(), inCategory(), isBeauty(), isMini() (+9 more)

### Community 18 - "Grace — этапы и готовые задания"
Cohesion: 0.10
Nodes (20): 10. Заказ и отправка менеджеру, 11. Кабинет и уведомления о поступлении, 12. Финальная проверка, 13. Полная техническая ревизия и передача разработчику, 1. Изучить образец и текущий сайт, 2. Фирменное оформление, 3. Карточки товаров на главной, 4. Верх главной и баннеры (+12 more)

### Community 19 - "item.tsx"
Cohesion: 0.13
Nodes (17): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Item(), ItemActions(), ItemContent(), ItemDescription() (+9 more)

### Community 20 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 21 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, react-server-dom-webpack, tailwindcss (+11 more)

### Community 22 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, registries, rsc (+9 more)

### Community 23 - "showcase-product.ts"
Cohesion: 0.20
Nodes (17): metadata, Bag(), Товары, варианты и цены, Variant, formatPrice(), hasPrice(), productPrice(), rubles (+9 more)

### Community 24 - "bubble.tsx"
Cohesion: 0.38
Nodes (6): Bubble(), BubbleContent(), BubbleGroup(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants

### Community 25 - "catalog-variants.test.mjs"
Cohesion: 0.07
Nodes (26): build_sites_vite_plugin, build_sites_vite_plugin_sites, openai_hosting, ref_node_child_process, ref_node_fs, ref_node_module, ref_node_path, ref_node_url (+18 more)

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
Cohesion: 0.12
Nodes (17): campaigns, Hero(), components_hero_module, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps (+9 more)

### Community 32 - "form.tsx"
Cohesion: 0.19
Nodes (12): FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue, FormLabel() (+4 more)

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
Cohesion: 0.17
Nodes (11): Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup(), FieldLabel(), FieldLegend(), FieldSeparator() (+3 more)

### Community 37 - "Grace Cosmetics — initial catalog website"
Cohesion: 0.06
Nodes (29): Grace hero campaigns, Assets, Data and commercial behavior, Follow-up inputs, Grace Cosmetics — initial catalog website, Header and curated storefront update — 2026-09-10, Initial implementation record (superseded visual design), Navigation repair (+21 more)

### Community 38 - "Grace Cosmetics — локальный проект"
Cohesion: 0.10
Nodes (24): chatGPTSignInPath(), chatGPTSignOutPath(), ChatGPTUser, getChatGPTUser(), isReservedAuthPath(), requireChatGPTUser(), safeDecodeURIComponent(), safeRelativeReturnPath() (+16 more)

### Community 39 - "store-shell.tsx"
Cohesion: 0.21
Nodes (9): CategoryIcon(), icons, roots, Shop, ShopContext, Toaster(), BagLine, SavedProduct (+1 more)

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
Cohesion: 0.14
Nodes (12): defaultCardVariant(), homeVariant, homeVariantIds, ref_node_assert, ref_node_test, media(), product(), products (+4 more)

### Community 44 - "Прогресс Grace"
Cohesion: 0.09
Nodes (22): 22 сентября 2026 — повторная проверка управления этапа 4, 22 сентября 2026 — этап 4 полностью завершён, 22 сентября 2026 — этап 4 сохранён по поручению пользователя, Архив подготовки заданий до реализации, Действующий порядок — 10 октября 2026, Изменение порядка 7Б владельцем — 24 сентября 2026, История до одобрения — макет 7А, 24 сентября 2026, История предыдущей очереди — не команда к продолжению (+14 more)

### Community 45 - "Grace Cosmetics — свод требований для подтверждения"
Cohesion: 0.20
Nodes (9): Grace Cosmetics — свод требований для подтверждения, Блоки главной и карточки, Верхняя часть главной, Внутренняя страница товара, Дальнейший порядок согласования, Каталог и мобильная навигация, Общий дизайн, Решения, которые нужно обсудить до финального подтверждения (+1 more)

### Community 47 - "Продолжение Grace — 10 октября 2026"
Cohesion: 0.33
Nodes (6): Действующий порядок — 10 октября 2026, Изменение порядка 7Б владельцем — 24 сентября 2026, История предыдущей очереди — не команда к продолжению, Продолжение Grace — 10 октября 2026, Результат запуска и перепланирования, Уточнение владельца к этапу 8 — 10 октября 2026

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
Cohesion: 0.20
Nodes (9): Grace Cosmetics — итоговый свод на подтверждение, Главная страница, Дизайн и материалы, Заказ, кабинет и данные, Изменение порядка 7Б владельцем — 24 сентября 2026, Карточки и страницы товаров, Мобильная навигация, Уточнения после проверки свода и текущего кода (+1 more)

### Community 61 - "Задание 13 для GPT-6 Astra — полная техническая ревизия и передача разработчику"
Cohesion: 0.25
Nodes (7): 1. Определить объём и исходное состояние, 2. Проверить архитектуру и качество кода, 3. Проверить данные, надёжность и безопасность, 4. Проверить производительность и сопровождение, 5. Исправить проблемы и перепроверить, 6. Передать понятный проект, Задание 13 для GPT-6 Astra — полная техническая ревизия и передача разработчику

### Community 62 - "Q: Existing catalog, account and inventory modules for Grace replanning"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Existing catalog, account and inventory modules for Grace replanning, Source Nodes

### Community 63 - "13. Техническая ревизия и передача разработчику"
Cohesion: 0.29
Nodes (7): 13. Техническая ревизия и передача разработчику, 1. Определить объём и исходное состояние, 2. Проверить архитектуру и качество кода, 3. Проверить данные, надёжность и безопасность, 4. Проверить производительность и сопровождение, 5. Исправить проблемы и перепроверить, 6. Передать понятный проект

### Community 64 - "Перенос рабочей папки на диск D"
Cohesion: 0.33
Nodes (6): Изменения только в новой копии, Перенос рабочей папки на диск D, Полнота копии, Проверка новой папки, Продолжение в Codex, Сохранённый контекст предварительного аудита этапа 0

### Community 65 - "Запуск и перепланирование Grace — 10 октября 2026"
Cohesion: 0.50
Nodes (4): Запуск и перепланирование Grace — 10 октября 2026, Запуск и проверка, Применённые скиллы и границы проверки, Что изменилось

### Community 66 - "Задание 8 для GPT-6 Astra — полноценная мобильная версия"
Cohesion: 0.29
Nodes (6): 1. Проверить и составить список проблем, 2. Сделать удобную навигацию, 3. Привести в порядок всю мобильную вёрстку, 4. Устранить задержки и ошибки взаимодействия, 5. Проверить исправления и показать результат, Задание 8 для GPT-6 Astra — полноценная мобильная версия

### Community 67 - "Этап 7А — внедрён, 24 сентября 2026"
Cohesion: 0.50
Nodes (4): Осталось за границами 7А, Проверено, Сделано, Этап 7А — внедрён, 24 сентября 2026

### Community 68 - "Этап 2 — цвета и логотип Grace"
Cohesion: 0.33
Nodes (6): Ограничения и дальнейшая работа, Палитра, Проверено, Сделано, Снимки, Этап 2 — цвета и логотип Grace

### Community 69 - "8. Полноценная мобильная версия"
Cohesion: 0.33
Nodes (6): 1. Проверить и составить список проблем, 2. Сделать удобную навигацию, 3. Привести в порядок всю мобильную вёрстку, 4. Устранить задержки и ошибки взаимодействия, 5. Проверить исправления и показать результат, 8. Полноценная мобильная версия

### Community 70 - "mobile-catalog-menu.tsx"
Cohesion: 0.13
Nodes (11): metadata, MobileCatalogMenu(), components_site_footer_module, SiteFooter(), data_navigation, legalDocuments, Category, mobileCatalogLevel() (+3 more)

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

### Community 77 - "next"
Cohesion: 0.29
Nodes (4): app_globals, metadata, nextConfig, next

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

### Community 93 - "Этап 7Б — подключение по новому порядку"
Cohesion: 0.67
Nodes (3): Подключено, Пропуски и доказательства, Этап 7Б — подключение по новому порядку

### Community 94 - "collections/[slug]/page.tsx"
Cohesion: 0.17
Nodes (12): Локальная работа, CollectionPage(), generateMetadata(), Props, ProductCard(), ProductDetail(), brandUrl(), Подтверждённые ошибки и локальный объём исправлений (+4 more)

### Community 95 - "Этап 5В: источники для документов Grace"
Cohesion: 0.29
Nodes (6): Возврат дистанционной покупки, Заявка, менеджер и заключение договора, Персональные данные, Проверка подготовленных текстов, Фактические границы текущего проекта, Этап 5В: источники для документов Grace

### Community 96 - "Этап 5В — аудит сведений Grace для подвала"
Cohesion: 0.33
Nodes (5): Контакты: существующий код не равен доказательству владельца, Один вопрос владельцу, Подтверждённое содержание и его происхождение, Реальные полезные назначения ссылок, Этап 5В — аудит сведений Grace для подвала

### Community 98 - "Q: Давай приступаем к следующему этапу, пять Б"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Давай приступаем к следующему этапу, пять Б, Source Nodes

### Community 100 - "cn"
Cohesion: 0.06
Nodes (48): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), BreadcrumbEllipsis(), BreadcrumbItem() (+40 more)

### Community 102 - "Аудит архитектуры — этап 0"
Cohesion: 0.29
Nodes (6): Аудит архитектуры — этап 0, Границы и безопасность, Исходная проверка до исправлений, Итоговая проверка, Как устроено, Что сохраняется и откладывается

### Community 103 - "empty.tsx"
Cohesion: 0.17
Nodes (11): metadata, BrandsView(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants (+3 more)

### Community 105 - "Этап 7Б — сбор материалов каталога"
Cohesion: 0.25
Nodes (8): Выбранные оригиналы партии 001, Изменение порядка 7Б владельцем — 24 сентября 2026, Объяснённые пропуски, Ограничения перед подготовкой, Последняя партия — 002, Проверки и продолжение, Сохранённые результаты партии 001, Этап 7Б — сбор материалов каталога

### Community 106 - "Этап 5В — подвал Grace"
Cohesion: 0.25
Nodes (7): Основания, Осталось вне этапа, Проверено, Сделано, Снимки, Уточнение по компактности подвала — 23 сентября 2026, Этап 5В — подвал Grace

### Community 107 - "Этап 3 — карточки товаров и общий стандарт"
Cohesion: 0.33
Nodes (6): Временный остаток по поручению пользователя, Осталось и границы, Проверено, Сделано, Снимки, Этап 3 — карточки товаров и общий стандарт

### Community 110 - "Q: footer shell navigation reference requirements"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: footer shell navigation reference requirements, Source Nodes

### Community 111 - "sidebar.tsx"
Cohesion: 0.05
Nodes (41): Sheet(), SheetClose(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+33 more)

### Community 112 - "input-otp.tsx"
Cohesion: 0.33
Nodes (4): InputOTP(), InputOTPGroup(), InputOTPSlot(), input-otp

### Community 113 - "resizable.tsx"
Cohesion: 0.40
Nodes (3): ResizableHandle(), ResizablePanelGroup(), react-resizable-panels

### Community 114 - "Этап 6Б — подготовка фотографий"
Cohesion: 0.40
Nodes (4): Непрошедшие подготовку, Проверено / осталось, Сделано, Этап 6Б — подготовка фотографий

### Community 117 - "Grace Cosmetics"
Cohesion: 0.40
Nodes (4): Grace Cosmetics, graphify, Действующий порядок — 10 октября 2026, Сохранять при продолжении

## Knowledge Gaps
- **586 isolated node(s):** `metadata`, `Props`, `metadata`, `metadata`, `Props` (+581 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 728 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `Storefront()` (2× useful, score=1.331391001)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `combobox.tsx`, `alert-dialog.tsx`, `lucide-react`, `catalog-view.tsx`, `popover.tsx`, `react`, `command.tsx`, `item.tsx`, `bubble.tsx`, `context-menu.tsx`, `chart.tsx`, `carousel.tsx`, `form.tsx`, `attachment.tsx`, `drawer.tsx`, `field.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `empty.tsx`, `sidebar.tsx`, `input-otp.tsx`, `resizable.tsx`?**
  _High betweenness centrality (0.202) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `combobox.tsx`, `journal.tsx`, `alert-dialog.tsx`, `lucide-react`, `product-detail.tsx`, `package.json`, `catalog-view.tsx`, `popover.tsx`, `command.tsx`, `item.tsx`, `bubble.tsx`, `context-menu.tsx`, `chart.tsx`, `carousel.tsx`, `form.tsx`, `attachment.tsx`, `drawer.tsx`, `field.tsx`, `store-shell.tsx`, `menubar.tsx`, `mobile-catalog-menu.tsx`, `navigation-menu.tsx`, `cn`, `empty.tsx`, `sidebar.tsx`, `input-otp.tsx`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `combobox.tsx`, `journal.tsx`, `alert-dialog.tsx`, `product-detail.tsx`, `package.json`, `catalog-view.tsx`, `react`, `command.tsx`, `context-menu.tsx`, `carousel.tsx`, `store-shell.tsx`, `menubar.tsx`, `mobile-catalog-menu.tsx`, `navigation-menu.tsx`, `collections/[slug]/page.tsx`, `cn`, `empty.tsx`, `sidebar.tsx`, `input-otp.tsx`, `resizable.tsx`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **What connects `metadata`, `Props`, `metadata` to the rest of the system?**
  _586 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `combobox.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08172043010752689 - nodes in this community are weakly interconnected._
- **Should `catalog.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1368421052631579 - nodes in this community are weakly interconnected._
- **Should `Замечания` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._