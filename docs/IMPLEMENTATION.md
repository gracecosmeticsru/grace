## Header and curated storefront update — 2026-09-10

Scope: removed the top decant announcement; rebuilt the header with the GRACECOSMETICS wordmark, prominent search, and adjacent favourite/bag/help actions. Added a separate single-row promotional navigation with Lucide icons. On narrow screens all three actions remain available next to search, with horizontal scrolling for the six storefront links.

Shared theme tokens now use milk white, warm taupe, powder and graphite. New header and collection styling uses these tokens. Existing hero/brand/editorial components, homepage product selections, catalogue structure, source records and images are unchanged.

Six `/collections/[slug]` pages each receive 10 real catalogue products. Selection runs on the server, once per module instance, and sends only the selected records to the product grid. Rules live in `lib/collection-selection.ts`, labels in `lib/collection-meta.ts`. Ranking uses source names, categories, formats and curated brand lists, with brand/category diversity and stable ID tie-breaking. K-Beauty includes skincare and makeup. Gifts exclude empty packaging, individual items from sets and specialised depilation/blackhead kits. Miniatures require explicit mini/travel wording or small perfume formats/decants. Reels is an editorial featured selection, without claims of actual publication or social metrics. Sale uses named promotions if present, otherwise an editorial selection labelled “Промо-выбор”; no discount percentages or old prices are invented. The dataset currently has no explicit discount fields or confirmed Reels list.

The user has explicitly confirmed rubles. The 5,029 variants with source prices now display in ₽. Different/missing variant prices produce “от” on listing cards; detail and bag prices follow the selected variant. Missing/invalid/zero prices display a neutral “— ₽”. The basket only displays a numerical total when every line has a valid price. No source price is changed and no decant price is inferred.

Validation: TypeScript check and production build passed. Selection checks require exactly 10 distinct existing products in each collection; currency checks cover null/zero/invalid values, decimals, equal/different variant prices and partial variant pricing. Protected homepage, brand and catalogue source files have no diff. No browser QA was performed for this update; the earlier browser policy restriction was not retried.

Earlier entries below describe prior versions and are retained as implementation history.

# Redesign — 10 September 2026

The current version replaces the earlier editorial violet homepage. Reference pages were opened through web search and inspected in a cloud browser:
- https://global.oliveyoung.com/ — primary structure: header/search/category navigation, centred carousel with neighbouring slides, counter and pause, slim campaign strip, five-product rails, Featured Brands, Our Picks, Recommendations, brand focus, category rail, customer service and footer.
- https://www.heybabescosmetics.com/ — category shortcuts and Russian catalogue navigation.
- https://www.sephora.com/ redirected to https://www.sephora.de/ — product presentation and recently viewed products.

Grace uses those block types and proportions with its own catalogue. With no sales, promotion, or review records in the supplied data, the first merchandise rail is labelled “Выбор Grace”; no synthetic best-seller ranks, discounts, reviews, loyalty offers, stock status or dates were introduced. K-pop and app-coupon campaigns do not apply to Grace's provided catalogue.

## Navigation repair
Product cards now contain one ordinary anchor covering the image, brand, name, variant count and price label. The favourite control is a sibling button, so it does not intercept the product link. Other catalogue and detail links use document navigation; product opening does not depend on the client RSC navigation transition. URL filter changes retain the existing router. Loading UI is present for remaining router transitions.

The reported original click failure was not reproduced as a permanent failure: the original Anua product link eventually opened after waiting. Do not claim a confirmed root cause. The revised Tom Ford card was clicked from the homepage and its detail page and 5/10/20/30 ml plus bottle variants were observed.

## Reference and QA limits
Desktop reference screenshots were inspected. The browser has no supported viewport-resizing API; Chrome keyboard shortcuts did not resize it. Reference sites refused iframe embedding, so their exact mobile visual layouts could not be verified in this environment. Grace itself was inspected at a 390 px iframe viewport (375 px content width with the desktop scrollbar), including the header, campaign and category navigation. Additional browser QA after a user continuation encountered a URL-policy restriction; no bypass was attempted. Cart interactions and shade changes were not browser-verified in this revision. Do not describe the result as a pixel-perfect copy or claim complete end-to-end validation.

## Assets
Three verified, official product photographs were integrated: Anua Cleansing Oil 200 ml (gc002705), Rare Beauty Lip Oil Hope 3 ml (gc003374), Tom Ford Tobacco Vanille bottle 50 ml (perf-0139). Sources are recorded in product-image-sources.json. The toner candidate in that manifest was excluded because the current 77+ Hyaluron package could not be confirmed as the supplied version. All other items retain the user-authorized grey image fallback. For decants, the detail caption explains that the photograph shows the original bottle. The generated portrait from the initial design was removed.

## Data and commercial behavior
The six-level-one catalogue structure, product identities, source SKUs and variants are unchanged. Prices remain by enquiry because source currency is unconfirmed. Favourites, basket, search history and recently viewed items are device-local. Basket copying does not send a message or place an order. The owner-private Site keeps the same project identity and audience.

---

## Initial implementation record (superseded visual design)

# Grace Cosmetics — initial catalog website

## Scope and sources

- Primary product source: `Grace_1C_КАТЕГОРИИ_БРЕНДЫ_FINAL_v2(1).xlsx`, uploaded 2026-09-09, first sheet `MASTER_РАСПРЕДЕЛЕНО`.
- Existing prepared variant relationships: `Grace_1C_FINAL_IMPORT_5051.xlsx`, joined using exact `MIG_ID`. The currently uploaded sheet defines the included product universe, category and retail amount; the supplemental file supplies prepared parent names and option labels.
- The six sections and 101 leaf categories are the exact hierarchy supplied in the current user message. 128 source rows have paths outside that exact hierarchy: 79 remain under their known broader section, while 49 cards without one of the six section names remain accessible from the full catalog, search and their brand pages. The complete original category mapping is retained in `import-audit.json`.
- 5,317 source rows minus 48 excluded service/unresolved records = 5,269 included source records. Grouping produces 4,526 cards, 521 of which offer multiple options, and 350 distinct named brands. Every included `MIG_ID` is retained in `sourceSkus`. These are catalog counts, not an inventory claim.

## Reference sites inspected through their published pages

- [Hey! Babes Cosmetics](https://www.heybabescosmetics.com/) — detailed skincare navigation, brands, and product discovery by concern/ingredient. Implemented the detailed category-navigation approach. Ingredient/skin-type filters are deliberately pending verified product metadata.
- [Olive Young Global](https://global.oliveyoung.com/) — prominent product/brand search, category navigation and a brands directory. Implemented search plus a dedicated brand directory.
- [Sephora Makeup](https://www.sephora.com/shop/makeup-cosmetics) and [Sephora](https://www.sephora.com/) — category-led catalog navigation and distinct makeup/skincare/fragrance sections. Implemented product families, product listing and detail routes.

The visual design is original: an editorial serif wordmark and campaign title, violet accents, white product grids, restrained gray missing-photo panels, responsive navigation and filters. The hero portrait is generated campaign artwork, not a product photograph. No competitor sales figures, ratings, discounts, policies or claims are copied.

## Variant and price handling

- One product-family route, with option-level identities in the cart.
- Fragrance stock base of 1 ml is never exposed as a selectable retail size. Existing approved decant policy is 5/10/20/30 ml; prepared source options additionally define standard bottle sizes. A standard bottle size does not imply stock.
- Bottle options are bound to their exact physical source SKU when one exists. Decant options refer to their technical stock-base source SKU. Theoretical bottle sizes without a source row have a null SKU and use the parent reference in requests.
- Example independently checked: `PERF-0037`, bottle 30 ml → `GC004158`, bottle 50 ml → `GC004159`, decant 5 ml → `GC003846`; bottle 100 ml has no SKU. The bottle 50 ml source retail amount is 10,500. No decant selling price is inferred by multiplying the stock-base amount.
- The source has no explicit currency and does not provide live inventory. All customer prices are displayed as “Цена по запросу”; no current stock assertion, availability filter or online payment is implemented.
- Procurement cost, source inventory totals and raw workbooks are excluded from public app data.

## Pages and flows

Home; full catalog; section, subsection and leaf routes; brand directory and brand routes; product routes; search; favorites; cart; meaningful 404 page. Filters and pagination are URL-based. Favorites and cart are local to the current browser. A user can copy a cart as text and manually send it to the supplied Grace Cosmetics Instagram account; the site itself sends no messages and places no orders.

## Validation

- TypeScript type checking and complete production build.
- All 5,269 source-record identities reconcile against the imported cards; no extra source identities.
- Unique product, variant and brand-route identifiers; valid category paths and parent paths.
- Six root sections and 101 leaves; no technical 1 ml retail options.
- Independent bottle/decant mapping checks listed above.
- Browser testing was not requested and was not performed.

## Follow-up inputs

Confirm currency and current retail prices/inventory; agree categories for the 49 cards outside the six sections; add verified product photographs; connect the store's order/payment/delivery systems if requested. Product photos currently use the explicitly allowed gray missing-image fallback.
