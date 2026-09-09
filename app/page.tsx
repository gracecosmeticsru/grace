import Storefront from "@/components/storefront";
import {featured,brands} from '@/lib/catalog';
export default function Home() { return <Storefront mode="home" selections={{skincare:featured('skincare'),makeup:featured('makeup'),fragrance:featured('fragrance'),body:featured('body')}} brands={brands}/>; }
