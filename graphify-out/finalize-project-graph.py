import json, re, hashlib
from pathlib import Path
from datetime import datetime, timezone
from graphify.build import build_from_json
from graphify.report import generate
from graphify.analyze import suggest_questions
from graphify.export import to_json
from graphify.detect import save_manifest
from graphify.cli import _stamped_manifest_files

ROOT = Path('D:/grace')
OUT = ROOT / 'graphify-out'
def load(name): return json.loads((OUT/name).read_text(encoding='utf-8'))
def save(name, value): (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')

def main():
    extraction, detection, analysis = [load(n) for n in ('.graphify_extract.json','.graphify_detect.json','.graphify_analysis.json')]
    labels = {int(k):v for k,v in load('.graphify_labels.json').items()}
    graph = build_from_json(extraction,root=str(ROOT),directed=False)
    communities = {int(k):v for k,v in analysis['communities'].items()}
    cohesion = {int(k):v for k,v in analysis['cohesion'].items()}
    assert labels.keys() == communities.keys(), 'Every community needs a human label'
    questions = suggest_questions(graph,communities,labels)
    report = generate(graph,communities,cohesion,labels,analysis['gods'],analysis['surprises'],detection,{'input':0,'output':0},str(ROOT),suggested_questions=questions)
    report = re.sub(r'^- Token cost:.*$', '- Token cost: unavailable. Semantic extraction used this Codex session; agent usage counters were not exposed. This is not a measured zero-token run.', report, flags=re.M)
    health = load('graph-health.json')
    report += '\n## Scope and integrity notes\n\n'
    report += 'Current code/configuration and project documents are indexed. .graphifyignore excludes historical artifacts, raw materials, public media, vendored files, the full conversation JSON and generated lockfile. No product photos were analyzed. The graph is an aid to navigation; explicit source requirements and current code remain authoritative.\n\n'
    report += f"Parser diagnostics: {health['dangling_endpoint_edges']} dangling-endpoint edges, {health['missing_endpoint_edges']} missing-endpoint edges, {health['self_loop_edges']} self-loop edges, {health['undirected_same_endpoint_collapsed_edges']} same-endpoint edges collapsed in the default undirected graph. Full diagnostics: GRAPH_HEALTH.md and graph-health.json. Unresolved CSS/data imports and external references must not be treated as verified symbol definitions. Raw extraction is retained in extraction-audit.json.\n"
    (OUT/'GRAPH_REPORT.md').write_text(report,encoding='utf-8')
    if not to_json(graph,communities,str(OUT/'graph.json'),community_labels=labels): raise RuntimeError('Graph shrink refused')
    corpus = detection.get('all_files') or detection['files']
    stamped = _stamped_manifest_files(corpus,extraction,ROOT)
    dispatched = {f for kind,files in detection['files'].items() if kind in ('document','paper','image') for f in files}
    stamped_names = {f for files in stamped.values() for f in files}
    save_manifest(stamped,root=str(ROOT),scan_corpus={f for files in corpus.values() for f in files},clear_semantic=(dispatched-stamped_names) or None)
    assert not (dispatched-stamped_names), 'Some semantic documents remain unindexed'
    cost = {'runs':[{'date':datetime.now(timezone.utc).isoformat(),'files':detection['total_files'],'input_tokens':None,'output_tokens':None,'measured':False,'reason':'Codex subagent usage counters unavailable; host-session semantic extraction, no external API key used'}], 'total_input_tokens':0,'total_output_tokens':0,'totals_include_only_measured_runs':True,'unmeasured_runs':1}
    save('cost.json',cost)
    save('extraction-audit.json',extraction)
    before = load('site-before.json')
    for name,digest in before.items(): assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest, name
    save('setup-validation.json',{'source_root':str(ROOT),'site_files_unchanged':len(before),'semantic_documents':len(dispatched),'corpus_files':detection['total_files'],'corpus_words':detection['total_words'],'nodes':graph.number_of_nodes(),'edges':graph.number_of_edges(),'communities':len(communities),'stage4_frozen':True,'warnings':{k:health[k] for k in ('dangling_endpoint_edges','missing_endpoint_edges','self_loop_edges','undirected_same_endpoint_collapsed_edges')},'token_usage':'unavailable'})
    vocab = set()
    for _,data in graph.nodes(data=True):
        for word in re.findall(r'[^\W\d_]+',data.get('label',''),re.UNICODE):
            for token in re.findall(r'[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+',word) or [word]:
                if 3 <= len(token) <= 30: vocab.add(token.lower())
    (OUT/'.vocab.txt').write_text('\n'.join(sorted(vocab)),encoding='utf-8')
    print(json.dumps(load('setup-validation.json'),ensure_ascii=False))

if __name__ == '__main__': main()
