import type {Product,Variant} from './catalog-types';
import {formatPrice,hasPrice,productPrice} from './pricing';

const clean=(value:string)=>value.replace(/\s+/g,' ').trim();
const unique=(values:string[])=>Array.from(new Set(values.map(clean).filter(Boolean)));
const isSpecific=(label:string)=>Boolean(label)&&!['стандарт','стандартный','один вариант'].includes(label.toLowerCase());
function countLabel(count:number,forms:[string,string,string]) {
  const last=count%10, lastTwo=count%100;
  return `${count} ${lastTwo>=11&&lastTwo<=14?forms[2]:last===1?forms[0]:last>=2&&last<=4?forms[1]:forms[2]}`;
}
function measure(label:string) {
  const match=label.replace(/^флакон\s+/i,'').match(/^(\d+(?:[.,]\d+)?)\s*(мл|ml|кг|kg|гр|г|g|л|l)$/i);
  if(!match)return null;
  const unit=({ml:'мл',g:'г',гр:'г',kg:'кг',l:'л'} as Record<string,string>)[match[2].toLowerCase()]||match[2].toLowerCase();
  return {value:Number(match[1].replace(',','.')),text:match[1].replace('.',','),unit};
}
export function showcaseName(product:Product) {
  const name=clean(product.name),brand=clean(product.brand);
  if(!brand)return name;
  const index=name.toLocaleLowerCase('ru').indexOf(brand.toLocaleLowerCase('ru'));
  const isLetter=(char:string)=>/[a-zа-яё0-9]/i.test(char);
  if(index<0||(index>0&&isLetter(name[index-1]))||isLetter(name[index+brand.length]||''))return name;
  return clean(name.slice(0,index)+' '+name.slice(index+brand.length)).replace(/^[\s,–—-]+|[\s,–—-]+$/g,'')||name;
}
export function showcaseParameters(product:Product) {
  const variants=product.variants.filter(v=>isSpecific(clean(v.label)));
  const labels=unique(variants.map(v=>v.label));
  if(!labels.length){
    const inName=product.name.match(/(?:^|\s|\()(\d+(?:[.,]\d+)?\s*(?:мл|ml|кг|kg|гр|г|g|л|l))(?=\s|[),.]|$)/i);
    const size=inName&&measure(inName[1]);
    return {text:size?`${size.text} ${size.unit}`:'',full:''};
  }
  const full=labels.join(' · ');
  if(variants.every(v=>v.type==='Оттенок'))return {text:labels.length===1?`Оттенок: ${labels[0]}`:countLabel(labels.length,['оттенок','оттенка','оттенков']),full};
  const measures=labels.map(measure);
  if(measures.every((value):value is NonNullable<typeof value>=>Boolean(value))&&measures.every(value=>value.unit===measures[0].unit)){
    const unit=measures[0].unit;
    const values=unique(measures.map(value=>value.text));
    if(values.length<=3)return {text:`${values.join(' / ')} ${unit}`,full};
    const sorted=[...measures].sort((a,b)=>a.value-b.value);
    const forms:[string,string,string]=unit==='г'||unit==='кг'?['вес','веса','весов']:['объём','объёма','объёмов'];
    return {text:`${countLabel(values.length,forms)} · ${sorted[0].text}–${sorted[sorted.length-1].text} ${unit}`,full};
  }
  return {text:labels.length===1?labels[0]:countLabel(labels.length,['вариант','варианта','вариантов']),full};
}
export function showcaseAvailability(variants:Variant[]) {
  if(!variants.length)return null;
  const values=variants.map(v=>clean(v.availability||'').toLowerCase().replace(/[\s-]+/g,'_'));
  const available=(value:string)=>['in_stock','available','в_наличии'].includes(value);
  const unavailable=(value:string)=>['out_of_stock','unavailable','нет_в_наличии'].includes(value);
  const preorder=(value:string)=>['preorder','pre_order','под_заказ'].includes(value);
  if(values.some(available))return values.every(available)?'В наличии':'Есть варианты в наличии';
  if(values.every(unavailable))return 'Нет в наличии';
  if(values.some(preorder))return values.every(preorder)?'Под заказ':'Есть варианты под заказ';
  return null;
}
export function showcasePrice(variants:Variant[]) {
  const priced=variants.filter(v=>hasPrice(v.price));
  // A priced full-size bottle must not appear to be the price of an unpriced decant.
  if(priced.length===1&&variants.length>1){
    const variant=priced[0],label=clean(variant.label);
    const note=isSpecific(label)?(variant.type==='Оттенок'?`Оттенок ${label}`:label):'';
    return {text:formatPrice(variant.price),note};
  }
  return {text:productPrice(variants),note:''};
}
