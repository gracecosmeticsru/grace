export const autumnEditorial = {
  href: '/blog/autumn-skincare',
  title: 'Готовимся к осени: подборка ухода',
  subtitle: 'Как мягко перестроить уход с приходом холодов: очищение, увлажнение, барьер и SPF',
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
    text: 'Выбирай мягкое неабразивное средство. Умывайся тёплой, не горячей водой и распределяй очищение подушечками пальцев — без щёток и интенсивного трения.',
    tip: 'После умывания аккуратно промокни лицо мягким полотенцем. Сухой коже добавь увлажнение.',
    source: 'cleansing',
  },
  {
    id: 'hydration', eyebrow: '02 / УВЛАЖНЕНИЕ', title: 'Более насыщенное увлажнение', accent: 'Текстура, в которой комфортно.',
    image: 'hydration.png', alt: 'Макросъёмка капли сыворотки и насыщенной кремовой текстуры',
    text: 'Если коже стало сухо, присмотрись к крему вместо лёгкого лосьона. Для сухой кожи это более насыщенный вариант ухода; среди увлажняющих компонентов — глицерин и гиалуроновая кислота.',
    tip: 'Наноси увлажняющий крем на слегка влажную кожу после очищения, чтобы помочь удержать влагу.',
    source: 'dry',
  },
  {
    id: 'barrier', eyebrow: '03 / БАРЬЕР', title: 'Поддержка кожного барьера', accent: 'Меньше нагрузки. Больше заботы.',
    image: 'barrier.png', alt: 'Спокойный домашний ритуал ухода в мягком свете у окна',
    text: 'Кожный барьер помогает удерживать воду и защищать кожу от внешних воздействий. В уходе для его поддержки можно искать церамиды и жирные кислоты — липиды, которые есть и в самой коже.',
    tip: 'Сухость и жжение — повод пересмотреть раздражающие средства. Если симптомы сохраняются, обратись к дерматологу.',
    source: 'barrier',
  },
  {
    id: 'renewal', eyebrow: '04 / ОБНОВЛЕНИЕ', title: 'Мягкое обновление кожи', accent: 'Осень — не повод усиливать пилинг.',
    image: 'renewal.png', alt: 'Минималистичная композиция с уходовым флаконом, гелем и ватным диском',
    text: 'Шелушение не означает, что кожу нужно сильнее отшелушивать. Частое обновление может усиливать сухость и раздражение. Если кожа уже чувствует дискомфорт, сначала верни ей комфортный базовый уход.',
    tip: 'Не увеличивай частоту только из-за смены сезона. Ориентируйся на инструкцию средства и переносимость кожи.',
    source: 'winter',
  },
  {
    id: 'spf', eyebrow: '05 / ЗАЩИТА', title: 'SPF осенью тоже нужен', accent: 'Прохладно — не значит без ультрафиолета.',
    image: 'spf.png', alt: 'Утренний ритуал солнцезащиты перед прогулкой в прохладную погоду',
    text: 'УФ-лучи действуют круглый год, в том числе в облачную погоду. Для открытых участков кожи перед выходом на улицу выбирай защиту от UVA и UVB, SPF 30 или выше и водостойкую формулу.',
    tip: 'На улице обновляй защиту примерно каждые два часа, а также после купания или потоотделения — по инструкции. Одежда и тень тоже важны.',
    source: 'spf',
  },
] as const;

// Real catalogue records selected for cleansing, hydration, barrier care and SPF.
// These are options to compare, not a prescribed regimen or a verified-INCI claim.
export const autumnProductIds = ['gc002705', 'gc002670', 'gc003540', 'gc003653', 'gc005061', 'gc002405', 'gc002583', 'gc003282', 'gc004686'];
