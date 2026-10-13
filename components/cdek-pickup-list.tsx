"use client";

import {useEffect, useState} from 'react';
import type {CdekCity, CdekPickupPoint} from '@/lib/cdek-pickup';
import styles from './cdek-pickup-list.module.css';

type Result<T> = {items: T[]; hasMore: boolean; total?: number};
type Load<T> = {data?: Result<T>; loading: boolean; error: boolean; query?: string};

function useCdekList<T>(query: string, retry: number): Load<T> {
  const [state, setState] = useState<Load<T>>({loading: false, error: false});
  useEffect(() => {
    if (!query) {setState({loading: false, error: false});return;}
    const controller = new AbortController();
    setState({query, loading: true, error: false});
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/delivery/cdek/service?${query}`, {signal: controller.signal});
        if (!response.ok) throw Error('Unavailable');
        const raw = await response.json();
        if (!raw || typeof raw !== 'object') throw Error('Invalid response');
        const data = raw as Result<T>;
        if (!Array.isArray(data.items) || typeof data.hasMore !== 'boolean') throw Error('Invalid response');
        if (!controller.signal.aborted) setState({query, data, loading: false, error: false});
      } catch {if (!controller.signal.aborted) setState({query, loading: false, error: true});}
    }, 300);
    return () => {clearTimeout(timer);controller.abort();};
  }, [query, retry]);
  return state.query === query ? state : {loading: !!query, error: false};
}

export function CdekPickupList({city, selected, onCityChange, onSelect, cityError, error}: {
  city: string; selected: CdekPickupPoint | null; onCityChange: (value: string) => void;
  onSelect: (point: CdekPickupPoint) => void; cityError?: string; error?: string;
}) {
  const [search, setSearch] = useState('');
  const [cityPage, setCityPage] = useState(0);
  const [chosenCity, setChosenCity] = useState<CdekCity | null>(() => selected?.cityCode ? {code: selected.cityCode, city: selected.city, region: selected.region ?? ''} : null);
  const [addressSearch, setAddressSearch] = useState('');
  const [pointPage, setPointPage] = useState(0);
  const [retry, setRetry] = useState(0);
  const cities = useCdekList<CdekCity>(search && !chosenCity ? new URLSearchParams({action: 'cities', q: search, page: String(cityPage)}).toString() : '', retry);
  const points = useCdekList<CdekPickupPoint>(chosenCity ? new URLSearchParams({action: 'points', cityCode: String(chosenCity.code), q: addressSearch.trim(), page: String(pointPage)}).toString() : '', retry);
  function findCity() {if (city.trim().length < 2) return;setChosenCity(null);setSearch(city.trim());setCityPage(0);setRetry(value => value + 1);}
  function pagination(page: number, more: boolean, setPage: (page: number) => void, label: string) {
    return (page > 0 || more) && <nav className={styles.pages} aria-label={label}>
      <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label={`${label}: назад`}>Назад</button>
      <span>{page + 1}</span>
      <button type="button" disabled={!more} onClick={() => setPage(page + 1)} aria-label={`${label}: дальше`}>Дальше</button>
    </nav>;
  }
  const active = chosenCity ? points : cities;
  return <div className={styles.field}>
    <label htmlFor="checkout-city">Город или населённый пункт</label>
    <div className={styles.search}>
      <input id="checkout-city" name="city" autoComplete="address-level2" maxLength={120} value={city} required
        aria-invalid={!!cityError} aria-describedby={`cdek-city-hint${cityError ? ' cdek-city-error' : ''}`}
        onKeyDown={event => {if (event.key === 'Enter') {event.preventDefault();findCity();}}}
        onChange={event => {onCityChange(event.target.value);setChosenCity(null);setSearch('');setCityPage(0);setPointPage(0);setAddressSearch('');}}/>
      <button name="pickupPoint" type="button" className="button secondary" onClick={findCity} disabled={city.trim().length < 2 || active.loading}
        aria-invalid={!!error} aria-describedby={error ? 'pickup-error' : undefined}>Найти</button>
    </div>
    <p id="cdek-city-hint" className={styles.hint}>Введите полное название, затем выберите свой регион.</p>
    {cityError && <p id="cdek-city-error" className={styles.error}>{cityError}</p>}
    {!chosenCity && cities.data && !cities.loading && <>
      <ul className={styles.list} aria-label="Населённые пункты">{cities.data.items.map(item => <li key={item.code}>
        <button type="button" onClick={() => {onCityChange(item.city);setChosenCity(item);setAddressSearch('');setPointPage(0);}}>
          <strong>{item.city}</strong><span>{[item.region, item.subRegion].filter(Boolean).join(', ') || `Код населённого пункта ${item.code}`}</span>
        </button>
      </li>)}</ul>
      {!cities.data.items.length && <p role="status" className={styles.hint}>Населённый пункт не найден. Проверьте полное название.</p>}
      {pagination(cityPage, cities.data.hasMore, setCityPage, 'Страницы городов')}
    </>}
    {chosenCity && <>
      <p className={styles.chosen}>{[chosenCity.city, chosenCity.region, chosenCity.subRegion].filter(Boolean).join(', ')}</p>
      <label htmlFor="cdek-address-search">Поиск пункта по улице или коду</label>
      <input id="cdek-address-search" type="search" maxLength={120} value={addressSearch} onChange={event => {setAddressSearch(event.target.value);setPointPage(0);}}/>
      {selected && <p className={styles.selected} role="status">Выбран: {selected.address} · {selected.code}</p>}
      {points.data && !points.loading && <>
        <p className={styles.hint}>Найдено пунктов: {points.data.total}</p>
        <ul className={styles.list} aria-label="Пункты выдачи СДЭК">{points.data.items.map(point => <li key={point.code}>
          <button type="button" aria-pressed={selected?.code === point.code} onClick={() => onSelect(point)}>
            <strong>{point.address}</strong><span>ПВЗ {point.code}{selected?.code === point.code ? ' · выбран' : ''}</span>
            {point.workTime && <span>{point.workTime}</span>}
          </button>
        </li>)}</ul>
        {!points.data.items.length && <p role="status" className={styles.hint}>Пункты не найдены. Попробуйте другой запрос или населённый пункт.</p>}
        {pagination(pointPage, points.data.hasMore, setPointPage, 'Страницы пунктов')}
      </>}
    </>}
    <div role="status" aria-live="polite">{active.loading && <p className={styles.hint}>Загружаем {chosenCity ? 'пункты выдачи' : 'населённые пункты'}…</p>}</div>
    {active.error && <div className={styles.failure} role="alert"><p>Не удалось загрузить список СДЭК. Введённые данные сохранены.</p><button type="button" onClick={() => setRetry(value => value + 1)}>Повторить</button></div>}
    {error && <p id="pickup-error" className={styles.error}>{error}</p>}
  </div>;
}
