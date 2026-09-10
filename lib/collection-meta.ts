export const collectionMeta = [
  { slug: 'k-beauty', title: 'K-Beauty', line: 'Уход и макияж из Кореи', description: 'Мягкое очищение, увлажнение и лёгкие текстуры для ежедневного ритуала.', icon: 'flower' },
  { slug: 'luxury', title: 'Люкс', line: 'Особенные детали каждый день', description: 'Макияж, уход и ароматы премиальных брендов.', icon: 'diamond' },
  { slug: 'gifts', title: 'Подарки', line: 'Маленькие поводы для радости', description: 'Готовые наборы и бьюти-подарки для близких и для себя.', icon: 'gift' },
  { slug: 'miniatures', title: 'Миниатюры', line: 'Любимое — с собой', description: 'Мини-форматы, небольшие объёмы и ароматы для знакомства.', icon: 'bag' },
  { slug: 'reels', title: 'Из наших Reels', line: 'В фокусе Grace', description: 'Сияющий макияж, уход и бьюти-находки, которые хочется рассмотреть ближе.', icon: 'play' },
  { slug: 'sale', title: 'Sale', line: 'Промо-выбор Grace', description: 'Десять находок для твоей косметички. Текущие цены указаны в карточках.', icon: 'tag' },
] as const;
export type CollectionSlug = typeof collectionMeta[number]['slug'];
