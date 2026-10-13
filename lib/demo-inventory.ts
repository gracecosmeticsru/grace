// Temporary local stock requested by the owner on 17 September 2026.
// Disable this single flag before using verified inventory; never write it to the catalog.
export const demoInventory={enabled:true,quantity:1} as const;
export const purchaseQuantityLimit=demoInventory.enabled?demoInventory.quantity:99;
export const stockNotice=demoInventory.enabled?'Тестовый остаток: 1 шт.':'Наличие уточняется';
