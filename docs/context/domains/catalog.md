# Каталог и карточка

`VERIFIED` по исходникам 14.10.2026: [catalog](../../../lib/catalog.ts), [типы](../../../lib/catalog-types.ts) загружают файловый каталог; ID товаров/вариантов — устойчивые ключи. Общая [VariantProductCard](../../../components/variant-product-card.tsx) используется через [ProductCard](../../../components/product-card.tsx), [CatalogView](../../../components/catalog-view.tsx). [Shop state](../../../lib/shop-state.ts) хранит браузерную корзину/избранное.

`USER_SPECIFIED`: [единый стандарт](../../PRODUCT-CARD-STANDARD.md), две карточки на мобильном, карусели с жестом; не урезать сохранённые количества. Реальные фото из интернета, неизвестные цены/наличие не выдумывать. [Демо-остаток](../../../lib/demo-inventory.ts) не источник 1С.

Минимальная проверка по задаче: `node --experimental-strip-types --test tests/catalog-variants.test.mjs tests/shop-state.test.mjs`. [API test](../../../tests/catalog-api.test.mjs) отдельно требует работающего сервера. Для медиа добавить [product-media test](../../../tests/product-media.test.mjs); без изменения медиа не читать журналы всех фото.

Не читать delivery/orders для локального оформления карточки; подключить order-contract только если меняются ID/цены/состав корзины. Данные и фото в этой установке не пересчитывались, старые количества фото не считать текущими.
