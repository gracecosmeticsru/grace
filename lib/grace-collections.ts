// Exact product/variant pairs selected in docs/REFERENCE-REVIEW.md.
// Separate from collectionMeta so the accepted top navigation stays unchanged.
export const graceCollections = [
  {slug:'clean-start',title:'Чистый старт',line:'Очищение лица',tone:'clean',description:'Масло, бальзам, гель и пенка — разные форматы очищения на выбор.',items:[
    ['gc002705','gc002705'],['gc002718','gc002718'],['parent-0200','gc004234'],['gc003540','gc003540'],['gc002670','gc002670'],['gc003649','gc003649'],
  ]},
  {slug:'lip-focus',title:'Акцент на губы',line:'Цвет и текстура',tone:'lips',description:'Масла, бальзамы, блеск и карандаш. Выберите свой формат и оттенок.',items:[
    ['gc003374','gc003374'],['parent-0060','gc002390'],['gc002480','gc002480'],['parent-0163','gc003423'],['parent-0190','gc004799'],['parent-0173','gc002909'],
  ]},
  {slug:'body-ritual',title:'Уход за телом без спешки',line:'Время для себя',tone:'body',description:'Гели для душа, скрабы, кремы и лосьоны — средства для вашего ухода за телом.',items:[
    ['gc001029','gc001029'],['gc001222','gc001222'],['gc004603','gc004603'],['parent-0319','gc001046'],['gc001867','gc001867'],['gc001308','gc001308'],
  ]},
  {slug:'hair-routine',title:'Волосы: от мытья до укладки',line:'Ваша полка для волос',tone:'hair',description:'Шампунь, кондиционер, маски, масло и стайлинг — выберите нужный формат.',items:[
    ['parent-0275','gc005265'],['parent-0289','gc004388'],['gc000034','gc000034'],['gc003348','gc003348'],['gc003430','gc003430'],['parent-0234','gc004731'],
  ]},
] as const;
