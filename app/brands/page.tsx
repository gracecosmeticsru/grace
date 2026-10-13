import {redirect} from 'next/navigation';
import BrandsView from '@/components/brands-view';
import {variantBrands as brands} from '@/lib/catalog';
import type {PageQuery} from '@/lib/catalog-page';
export const metadata={title:'Бренды A–Я'};
export default async function Brands({searchParams}:{searchParams:Promise<PageQuery>}){const q=await searchParams;if(typeof q.name==='string'){const b=brands.find(b=>b.name===q.name);if(b)redirect('/brands/'+b.slug);}return <BrandsView brands={brands}/>;}
