import json
from pathlib import Path
from graphify.cache import save_semantic_cache
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
from graphify.diagnostics import diagnose_extraction, format_diagnostic_report

ROOT = Path('D:/grace')
OUT = ROOT / 'graphify-out'
SPEC = 'C:/Users/pc/.codex/skills/graphify/references/extraction-spec.md'
def load(name): return json.loads((OUT / name).read_text(encoding='utf-8'))
def save(name, value): (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')

def honest_report(report):
    lines = report.splitlines()
    lines = [('- Token cost: unavailable — Codex subagent usage was not exposed. Semantic extraction used this session; placeholder zero counters are not a measured free run.' if x.startswith('- Token cost:') else x) for x in lines]
    return '\n'.join(lines) + '\n'

def main():
    ast = load('.graphify_ast.json')
    detection = load('.graphify_detect.json')
    chunks = [load('semantic-1-result.json'), load('semantic-2-result.json')]
    semantic = {'nodes': [], 'edges': [], 'hyperedges': [], 'input_tokens': 0, 'output_tokens': 0, 'token_usage_measured': False}
    for i, chunk in enumerate(chunks, 1):
        assert isinstance(chunk.get('nodes'), list) and isinstance(chunk.get('edges'), list), f'Invalid chunk {i}'
        expected = set(load(f'chunk-{i}-files.json'))
        covered = {n.get('source_file') for n in chunk['nodes']}
        assert expected <= covered, f'Omitted documents: {expected - covered}'
        for n in chunk['nodes']:
            assert n['file_type'] in {'code','document','paper','image','rationale','concept'}
        for e in chunk['edges']:
            assert 'confidence_score' in e
            assert e['confidence'] in {'EXTRACTED','INFERRED','AMBIGUOUS'}
            if e['confidence'] == 'EXTRACTED': assert e['confidence_score'] == 1.0
        for key in ('nodes','edges','hyperedges'): semantic[key].extend(chunk.get(key, []))
    uncached = (OUT / '.graphify_uncached.txt').read_text(encoding='utf-8').splitlines()
    saved = save_semantic_cache(semantic['nodes'],semantic['edges'],semantic['hyperedges'],root=str(ROOT),allowed_source_files=uncached,prompt_file=SPEC)
    cached = load('.graphify_cached.json') if (OUT / '.graphify_cached.json').exists() else {'nodes':[],'edges':[],'hyperedges':[]}
    for key in ('nodes','edges','hyperedges'): semantic[key] = cached.get(key, []) + semantic[key]
    semantic['nodes'] = list({n['id']: n for n in semantic['nodes']}.values())
    save('.graphify_semantic.json',semantic)
    merged_nodes = {n['id']: n for n in ast['nodes']}
    for n in semantic['nodes']: merged_nodes.setdefault(n['id'],n)
    merged = {'nodes':list(merged_nodes.values()),'edges':ast['edges']+semantic['edges'],'hyperedges':semantic['hyperedges'],'input_tokens':0,'output_tokens':0,'token_usage_measured':False}
    save('.graphify_extract.json',merged)
    graph = build_from_json(merged,root=str(ROOT),directed=False)
    if not graph.number_of_nodes(): raise RuntimeError('Empty extraction; preserve existing output')
    communities = cluster(graph)
    cohesion = score_all(graph,communities)
    gods = god_nodes(graph)
    surprises = surprising_connections(graph,communities)
    labels = {i:f'Community {i}' for i in communities}
    questions = suggest_questions(graph,communities,labels)
    if not to_json(graph,communities,str(OUT/'graph.json')): raise RuntimeError('Graph shrink refused')
    report = generate(graph,communities,cohesion,labels,gods,surprises,detection,{'input':0,'output':0},str(ROOT),suggested_questions=questions)
    (OUT/'GRAPH_REPORT.md').write_text(honest_report(report),encoding='utf-8')
    save('.graphify_analysis.json',{'communities':communities,'cohesion':cohesion,'gods':gods,'surprises':surprises,'questions':questions})
    health = diagnose_extraction(merged,directed=False,root=str(ROOT))
    save('graph-health.json',health)
    (OUT/'GRAPH_HEALTH.md').write_text(format_diagnostic_report(health),encoding='utf-8')
    save('community-review.json',[{'id':i,'size':len(ids),'cohesion':cohesion[i],'examples':[{'id':n,'label':graph.nodes[n].get('label'),'file':graph.nodes[n].get('source_file')} for n in sorted(ids,key=lambda n:graph.degree(n),reverse=True)[:5]]} for i,ids in communities.items()])
    print(json.dumps({'nodes':graph.number_of_nodes(),'edges':graph.number_of_edges(),'communities':len(communities),'cached_documents':saved,'health':{k:health.get(k) for k in ('dangling_endpoint_edges','missing_endpoint_edges','self_loop_edges','undirected_same_endpoint_collapsed_edges')}},ensure_ascii=False))

if __name__ == '__main__': main()
