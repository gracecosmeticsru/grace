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
