import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Link from '@/components/site-link';
import ShowcaseProductCard from '@/components/showcase-product-card';
import { getCollection } from '@/lib/collections';
import { collectionMeta } from '@/lib/collection-meta';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return collectionMeta.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props) {
  const collection = getCollection((await params).slug);
  return { title: collection?.title || 'Подборка', description: collection?.description };
}
export default async function CollectionPage({ params }: Props) {
  const collection = getCollection((await params).slug);
  if (!collection) notFound();
  return <main id="main" className="wrap curated-main">
    <nav className="breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><ChevronRight/><span>{collection.title}</span></nav>
    <div className="curated-intro">
      <div><span className="curated-kicker">{collection.line}</span><h1>{collection.title}</h1><p>{collection.description}</p></div>
      <span className="curated-count">{collection.products.length} находок Grace</span>
    </div>
    <div className="curated-grid">{collection.products.map(product => <ShowcaseProductCard key={product.id} product={product} promotion={collection.slug==='sale'?'Промо-выбор':undefined}/>)}</div>
  </main>;
}
