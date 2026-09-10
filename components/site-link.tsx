import type {AnchorHTMLAttributes} from 'react';
// Document navigation keeps every catalog/detail link usable without waiting on RSC.
export default function SiteLink(props:AnchorHTMLAttributes<HTMLAnchorElement> & {href:string}){return <a {...props}/>;}
