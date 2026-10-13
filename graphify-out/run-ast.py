import json
from pathlib import Path
from graphify.extract import collect_files, extract
def main():
    detected = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
    files = []
    for name in detected['files'].get('code', []):
        p = Path(name)
        files.extend(collect_files(p) if p.is_dir() else [p])
    result = extract(files, cache_root=Path('D:/grace')) if files else {'nodes': [], 'edges': []}
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print('AST:', len(result['nodes']), 'nodes,', len(result['edges']), 'edges')

if __name__ == '__main__':
    main()
