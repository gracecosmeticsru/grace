import {Paintbrush,FlaskConical,SprayCan,Scissors,Bath,Brush,Sun,Gift} from 'lucide-react';
const icons={makeup:Paintbrush,skincare:FlaskConical,fragrance:SprayCan,hair:Scissors,body:Bath,accessories:Brush,spf:Sun,sets:Gift};
export default function CategoryIcon({name,size=25}:{name:string;size?:number}){const Icon=icons[name as keyof typeof icons]||Gift;return <Icon size={size} strokeWidth={1.5} aria-hidden="true"/>;}
