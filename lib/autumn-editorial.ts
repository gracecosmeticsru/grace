export const autumnEditorial = {
  href: '/blog/autumn-skincare',
  title: 'Готовимся к осени: подборка ухода',
  subtitle: 'Сохрани удобную базу и добавь коже комфорта: мягкое очищение, увлажнение и SPF.',
  cover: '/images/autumn-editorial/cover.png',
};

export const editorialSources = {
  winter: { label: 'Cleveland Clinic · уход в холодную погоду', href: 'https://health.clevelandclinic.org/tips-to-combat-dry-skin-in-winter' },
  cleansing: { label: 'AAD · мягкое очищение', href: 'https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101' },
  dry: { label: 'AAD · уход за сухой кожей', href: 'https://www.aad.org/public/everyday-care/skin-care-basics/dry/dermatologists-tips-relieve-dry-skin' },
  barrier: { label: 'Cleveland Clinic · кожный барьер', href: 'https://health.clevelandclinic.org/skin-barrier' },
  spf: { label: 'AAD · солнцезащита', href: 'https://www.aad.org/media/stats-sunscreen' },
} as const;

export const autumnChapters = [
  {
    id: 'cleansing', eyebrow: '01 / ОЧИЩЕНИЕ', title: 'Мягкое очищение', accent: 'Без ощущения «до скрипа».',
    image: 'cleansing.png', alt: 'Мягкое умывание: вода, нежная пена и прикосновение рук',
    text: 'Смена сезона не требует заново собирать всю полку. Начни с ощущений после умывания: коже должно быть комфортно. Выбирай мягкое неабразивное средство, тёплую воду и подушечки пальцев вместо щёток и интенсивного трения.',
    tip: 'После умывания аккуратно промокни лицо мягким полотенцем. Сухой коже добавь увлажнение.',
    source: 'cleansing',
  },
  {
    id: 'hydration', eyebrow: '02 / УВЛАЖНЕНИЕ', title: 'Более насыщенное увлажнение', accent: 'Текстура, в которой комфортно.',
    image: 'hydration.png', alt: 'Макросъёмка капли сыворотки и насыщенной кремовой текстуры',
    text: 'Если лёгкого лосьона стало недостаточно, присмотрись к крему. Для сухой кожи AAD рекомендует кремовые или мазевые текстуры без отдушки. Ориентируйся на комфорт кожи между нанесениями.',
    tip: 'Наноси увлажняющий крем на слегка влажную кожу после очищения, чтобы помочь удержать влагу.',
    source: 'dry',
  },
  {
    id: 'barrier', eyebrow: '03 / БАРЬЕР', title: 'Поддержка кожного барьера', accent: 'Меньше нагрузки. Больше заботы.',
    image: 'barrier.png', alt: 'Спокойный домашний ритуал ухода в мягком свете у окна',
    text: 'Кожный барьер помогает удерживать влагу. Излишне агрессивное очищение и частое отшелушивание могут ему мешать. Для поддержки барьера важны бережный уход и увлажнение; среди компонентов таких формул встречаются церамиды и жирные кислоты — липиды, присутствующие и в коже.',
    tip: 'Сухость и жжение — повод пересмотреть раздражающие средства. Если симптомы сохраняются, обратись к дерматологу.',
    source: 'barrier',
  },
  {
    id: 'renewal', eyebrow: '04 / ОБНОВЛЕНИЕ', title: 'Мягкое обновление кожи', accent: 'Осень — не повод усиливать пилинг.',
    image: 'renewal.png', alt: 'Минималистичная композиция с уходовым флаконом, гелем и ватным диском',
    text: 'С отоплением воздух дома становится суше, и кожа может начать шелушиться. Это не повод сразу усиливать пилинг: чрезмерное отшелушивание способно усугубить сухость. Если привычный уход стал раздражать, сократи лишние этапы и вернись к мягкому очищению и увлажнению.',
    tip: 'Не увеличивай частоту только из-за смены сезона. Ориентируйся на инструкцию средства и переносимость кожи.',
    source: 'winter',
  },
  {
    id: 'spf', eyebrow: '05 / ЗАЩИТА', title: 'SPF осенью тоже нужен', accent: 'Прохладно — не значит без ультрафиолета.',
    image: 'spf.png', alt: 'Утренний ритуал солнцезащиты перед прогулкой в прохладную погоду',
    text: 'УФ-лучи действуют и в прохладные облачные дни. На открытых участках кожи используй защиту от UVA и UVB с SPF от 30. AAD также рекомендует водостойкую формулу; особенно внимательно проверяй эту маркировку перед спортом или плаванием. Высокий SPF сам по себе не означает водостойкость.',
    tip: 'На улице обновляй защиту примерно каждые два часа и после купания или потоотделения по инструкции. SPF из подборки не заявлены здесь как водостойкие. Одежда и тень дополняют защиту.',
    source: 'spf',
  },
] as const;

// Real catalogue records selected for cleansing, hydration, barrier care and SPF.
// These are options to compare, not a prescribed regimen or a verified-INCI claim.
export const autumnProductIds = ['gc002705', 'gc002670', 'gc003540', 'gc003653', 'gc005061', 'gc002405', 'gc002583', 'gc003282', 'gc004686'];

export const autumnProductVariants = [
  {productId: 'gc002705', variantId: 'gc002705'},
  {productId: 'gc002670', variantId: 'gc002670'},
  {productId: 'gc003540', variantId: 'gc003540'},
  {productId: 'gc003653', variantId: 'gc003653'},
  {productId: 'gc005061', variantId: 'gc005061'},
  {productId: 'gc002405', variantId: 'gc002405'},
  {productId: 'gc002583', variantId: 'gc002583'},
  {productId: 'gc003282', variantId: 'gc003282'},
  {productId: 'gc004686', variantId: 'gc004686'},
] as const;
