"""Read-only import: latest uploaded catalog is authoritative; match variant metadata by MIG_ID.
No cost, supplier, financial totals, or raw workbook is copied to the public site.
"""
import json, re, sys, collections, pathlib, hashlib
import openpyxl

root=pathlib.Path(__file__).resolve().parent.parent
base=pathlib.Path(sys.argv[1])
primary=base/'Grace_1C_КАТЕГОРИИ_БРЕНДЫ_FINAL_v2(1).xlsx'
supplement=base/'Grace_1C_FINAL_IMPORT_5051.xlsx'
def read(path):
    w=openpyxl.load_workbook(path,read_only=True,data_only=True)
    it=w.worksheets[0].values; headers=next(it)
    return [dict(zip(headers,r)) for r in it if r and r[0]]
rows=read(primary); meta={r['MIG_ID']:r for r in read(supplement)}
tree=json.loads((root/'data/taxonomy.json').read_text())
paths={}; roots={}; nodes=[]
for t in tree:
    roots[t['name']]=t['slug'];paths[t['name']]=t['slug']
    nodes.append({'path':t['slug'],'name':t['name'],'label':t['name'],'parent':None})
    for g in t.get('groups',[]):
        full=t['name']+' / '+g['name'];gp=t['slug']+'/'+g['slug'];paths[full]=gp
        nodes.append({'path':gp,'name':g['name'],'label':full,'parent':t['slug']})
        for i,n in enumerate(g['items']):
            path=gp+'/'+str(i+1);label=full+' / '+n;paths[label]=path
            nodes.append({'path':path,'name':n,'label':label,'parent':gp})
    for i,n in enumerate(t.get('items',[])):
        path=t['slug']+'/'+str(i+1);label=t['name']+' / '+n;paths[label]=path
        nodes.append({'path':path,'name':n,'label':label,'parent':t['slug']})

groups={};excluded=[];unmapped=[];matched=0;conflicts=[]
for r in rows:
    cat=str(r.get('Категория 1С / Bitrix') or '')
    if cat.startswith('НЕ ЗАГРУЖАТЬ') or cat.startswith('ТРЕБУЕТ РЕШЕНИЯ'):
        excluded.append({'id':r['MIG_ID'],'name':r['Наименование'],'reason':cat});continue
    m=meta.get(r['MIG_ID'],{})
    if m:matched+=1
    parent=str(m.get('ID родительской карточки') or r['MIG_ID'])
    brand=str(r.get('Бренд') or '').strip()
    if re.search(r'не определ|требует|неизвест|не примен|без бренда',brand,re.I):brand=''
    root_name=cat.split(' / ')[0]
    path=paths.get(cat,roots.get(root_name,''))
    if cat not in paths:unmapped.append({'id':r['MIG_ID'],'category':cat,'site_path':path})
    name=str(m.get('Родительская карточка') or r['Наименование'])
    key=parent
    if key in groups and groups[key]['brand']!=brand:
        conflicts.append({'id':r['MIG_ID'],'parent':parent,'reason':'different brand'})
        key=r['MIG_ID'];name=str(r['Наименование'])
    p=groups.setdefault(key,{'id':key.lower(),'name':name,'brand':brand,'paths':[], 'variants':[], 'image':None,'sourceSkus':[]})
    p['sourceSkus'].append(r['MIG_ID'])
    if path and path not in p['paths']:p['paths'].append(path)
    variant_type=str(m.get('Тип характеристики') or '')
    option=str(m.get('Характеристика') or '')
    site_options=str(m.get('Варианты для сайта') or '')
    options=[x.strip() for x in site_options.split(';') if x.strip()]
    if not options and re.search(r'отливант',str(r['Наименование']),re.I) and re.search(r'\b1\s*мл\b',str(r['Наименование']),re.I):
        # Existing approved decant policy: 5/10/20/30 ml. Bottle sizes remain unknown.
        options=['5 мл','10 мл','20 мл','30 мл']
    # Never expose the technical 1 ml stock base or imply bottle stock from a standard size.
    if options:
        p['decant']=True
        for i,label in enumerate(options):
            if re.match(r'^1\s*мл',label):continue
            is_bottle=label.lower().startswith('флакон')
            v=next((x for x in p['variants'] if x['label']==label),None)
            if v is None:
                v={'id':key.lower()+'-'+hashlib.sha1(label.encode()).hexdigest()[:8],'sku':None,'label':label,'type':'Объём','price':None,'availability':'unknown','format':'Флакон' if is_bottle else 'Отливант'}
                p['variants'].append(v)
            is_technical='техническ' in option.lower() or bool(re.search(r'отливант',str(r['Наименование']),re.I) and re.search(r'\b1\s*мл\b',str(r['Наименование']),re.I))
            if is_bottle and option==label:
                v['sku']=r['MIG_ID']
                v['price']=r.get('Розничная цена') if isinstance(r.get('Розничная цена'),(int,float)) and r.get('Розничная цена')>0 else None
            elif not is_bottle and is_technical:
                v['sku']=r['MIG_ID']
    else:
        if 'техническ' in option.lower():option=''
        if not option:
            sizes=re.findall(r'(\d+(?:[.,]\d+)?\s*(?:мл|ml|г|gr)\b)',str(r['Наименование']),re.I)
            option=sizes[-1].replace('ml','мл') if sizes else 'Стандарт'
        p['variants'].append({'id':r['MIG_ID'].lower(),'sku':r['MIG_ID'],'label':option,'type':variant_type or ('Объём' if re.search(r'мл|ml',option) else 'Вариант'),'price':r.get('Розничная цена') if isinstance(r.get('Розничная цена'),(int,float)) and r.get('Розничная цена')>0 else None,'availability':'unknown'})

products=list(groups.values())
for p in products:
    p['slug']=p['id']
    if p.get('decant'):
        p['name']=re.sub(r'\s*1\s*мл\b','',p['name'],flags=re.I).strip()
    # Keep distinct SKUs even when the human option labels coincide; append a disambiguator.
    counts=collections.Counter(v['label'] for v in p['variants'])
    for v in p['variants']:
        if counts[v['label']]>1:v['label']+=' · '+v['sku']

brand_names=sorted({p['brand'] for p in products if p['brand']},key=str.casefold)
brands=[{'name':b,'slug':re.sub('[^a-z0-9]+','-',b.lower()).strip('-') or 'brand-'+hashlib.sha1(b.encode()).hexdigest()[:8], 'count':sum(p['brand']==b for p in products)} for b in brand_names]
seen=set()
for b in brands:
    if b['slug'] in seen:b['slug']+='-'+hashlib.sha1(b['name'].encode()).hexdigest()[:6]
    seen.add(b['slug'])
for n in nodes:n['count']=sum(any(x==n['path'] or x.startswith(n['path']+'/') for x in p['paths']) for p in products)

summary={'source':primary.name,'variant_source':supplement.name,'source_rows':len(rows),'excluded_rows':len(excluded),'included_rows':len(rows)-len(excluded),'matched_variant_rows':matched,'cards':len(products),'variant_cards':sum(len(p['variants'])>1 for p in products),'brand_count':len(brands),'leaf_categories':sum(not any(q['parent']==n['path'] for q in nodes) for n in nodes),'broader_or_unassigned_rows':len(unmapped),'currency':None,'stock_is_live':False}
(root/'data/products.json').write_text(json.dumps(products,ensure_ascii=False,separators=(',',':')))
(root/'data/navigation.json').write_text(json.dumps(nodes,ensure_ascii=False,separators=(',',':')))
(root/'data/brands.json').write_text(json.dumps(brands,ensure_ascii=False,separators=(',',':')))
(root/'data/summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
(root/'docs/import-audit.json').write_text(json.dumps({'summary':summary,'excluded':excluded,'unmapped':unmapped,'group_conflicts':conflicts},ensure_ascii=False,indent=2))
print(json.dumps(summary,ensure_ascii=False))
