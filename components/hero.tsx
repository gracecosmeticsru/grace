"use client";

import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Plus } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import styles from './hero.module.css';

const luxuryMakeup = '/catalog/makeup?brand=' + encodeURIComponent('Dior|Chanel|Charlotte Tilbury|Tom Ford|Hourglass|Yves Saint Laurent|Givenchy|Giorgio Armani|Westman Atelier|Prada|Guerlain|Bobbi Brown');
const campaigns = [
  {
    id: 'k-beauty', label: 'K-Beauty', eyebrow: 'K-BEAUTY · SKINCARE',
    title: ['Твоё время', 'сиять'], description: 'Корейский уход. Лёгкие текстуры. Твой glow.',
    cta: 'Выбрать уход', href: '/collections/k-beauty',
    image: '/images/hero-k-beauty.png',
    alt: 'Свежая бьюти-сцена: сияющая кожа, стекло и лёгкие уходовые текстуры',
  },
  {
    id: 'luxury', label: 'Люкс', eyebrow: 'ЛЮКС МАКИЯЖ',
    title: ['Красота', 'в деталях'], description: 'Выразительный цвет. Роскошные текстуры.',
    cta: 'Выбрать макияж', href: luxuryMakeup,
    image: '/images/hero-luxury-makeup.png',
    alt: 'Модель с выразительным макияжем и композиция декоративной косметики',
  },
  {
    id: 'autumn', label: 'Осенний уход', eyebrow: 'ОСЕННИЙ УХОД',
    title: ['Больше заботы.', 'Ближе к себе.'], description: 'Мягкие текстуры для нового сезона.',
    cta: 'Собрать уход', href: '/catalog/skincare/daily',
    image: '/images/hero-autumn-skincare.png',
    alt: 'Тёплый осенний ритуал ухода: крем, кашемир и мягкий солнечный свет',
  },
] as const;

export default function Hero() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  useEffect(() => {
    if (!api) return;
    const sync = () => setCurrent(api.selectedScrollSnap());
    sync(); api.on('select', sync);
    return () => { api.off('select', sync); };
  }, [api]);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { if (preference.matches) setPaused(true); };
    sync(); preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (!api || paused || hovered || allOpen) return;
    const timer = window.setInterval(() => api.scrollNext(), 7000);
    return () => window.clearInterval(timer);
  }, [api, paused, hovered, allOpen]);
  const select = (index: number) => { setPaused(true); api?.scrollTo(index); };
  return <section className={styles.hero} aria-label="Главные подборки Grace Cosmetics">
    <Carousel opts={{ align: 'center', loop: true }} setApi={setApi}
      className={styles.carousel} aria-label="Бьюти-истории Grace"
      onFocusCapture={() => setPaused(true)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <CarouselContent className={styles.track}>
        {campaigns.map((campaign, index) => <CarouselItem key={campaign.id} className={styles.slide}
          aria-label={`${index + 1} из ${campaigns.length}: ${campaign.label}`} aria-hidden={index !== current}>
          <a href={campaign.href} className={`${styles.banner} ${styles[campaign.id] || ''}`} tabIndex={index === current ? 0 : -1}>
            <div className={styles.photograph}>
              <img src={campaign.image} alt={campaign.alt} width={1536} height={1024}
                loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async"/>
            </div>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>{campaign.eyebrow}</span>
              <h2>{campaign.title[0]}<br/>{campaign.title[1]}</h2>
              <p>{campaign.description}</p>
              <span className={styles.cta}>{campaign.cta}<ArrowRight size={18} strokeWidth={1.5}/></span>
            </div>
          </a>
        </CarouselItem>)}
      </CarouselContent>
    </Carousel>
    <div className={styles.toolbar}>
      <div className={styles.choices} aria-label="Выбрать баннер">{campaigns.map((campaign, index) =>
        <button key={campaign.id} className={index === current ? styles.selected : ''} aria-pressed={index === current}
          aria-label={`Показать баннер: ${campaign.label}`} onClick={() => select(index)}>
          <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span><span className={styles.choiceLabel}>{campaign.label}</span>
        </button>)}
      </div>
      <div className={styles.controls}>
        <button aria-label="Предыдущий баннер" onClick={() => { setPaused(true); api?.scrollPrev(); }}><ChevronLeft size={19}/></button>
        <Dialog open={allOpen} onOpenChange={setAllOpen}>
          <DialogTrigger className={styles.counter} aria-label="Показать все три подборки"><span>{current + 1} / 3</span><Plus size={14}/></DialogTrigger>
          <DialogContent className={styles.dialog}><DialogHeader><DialogTitle>Бьюти-истории Grace</DialogTitle><DialogDescription>Выбери своё настроение</DialogDescription></DialogHeader>
            {campaigns.map(campaign => <a key={campaign.id} href={campaign.href} className={styles.mini}>
              <img src={campaign.image} alt="" width={120} height={90} loading="lazy"/>
              <span><small>{campaign.eyebrow}</small><strong>{campaign.cta}</strong></span><ArrowRight size={19}/>
            </a>)}
          </DialogContent>
        </Dialog>
        <button aria-label={paused ? 'Запустить смену баннеров' : 'Приостановить смену баннеров'} onClick={() => setPaused(value => !value)}>
          {paused ? <Play size={15}/> : <Pause size={15}/>}
        </button>
        <button aria-label="Следующий баннер" onClick={() => { setPaused(true); api?.scrollNext(); }}><ChevronRight size={19}/></button>
      </div>
    </div>
  </section>;
}
