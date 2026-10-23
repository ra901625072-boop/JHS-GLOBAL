import os
import re

terms = [
    r'\bmundra\b', r'\bhazira\b', r'\bpipavav\b', r'\bjnpt\b',
    r'\bport\b', r'\bloading port\b', r'\bvessel\b', r'\bsailing\b',
    r'\bclean on board\b', r'\bicegate\b', r'\bconnectivity\b', r'\bnearby\b',
    r'\bsurat\b', r'\bgujarat\b', r'\binspection\b', r'\bthird-party\b',
    r'\bsgs\b', r'\bbureau veritas\b', r'\bintertek\b', r'\bpre-shipment\b',
    r'\bnabl\b', r'\blab\b', r'\bcoa\b', r'\bsortex\b', r'\bfumigation\b',
    r'\bphytosanitary\b'
]

compiled_terms = [re.compile(t, re.IGNORECASE) for t in terms]

search_dirs = ['client/src', 'server/src', 'docs', 'tests']
ignore_exts = ['.png', '.jpg', '.jpeg', '.webp', '.ico', '.pdf', '.xlsx', '.git']

hits = []

for s_dir in search_dirs:
    for root, dirs, files in os.walk(s_dir):
        if 'node_modules' in root or '.git' in root or 'dist' in root or 'build' in root:
            continue
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in ignore_exts:
                continue
            fpath = os.path.join(root, file)
            try:
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                for idx, line in enumerate(lines, 1):
                    for ct in compiled_terms:
                        m = ct.search(line)
                        if m:
                            hits.append({
                                'file': fpath,
                                'line': idx,
                                'matched_term': m.group(0),
                                'text': line.strip()
                            })
                            break
            except Exception as e:
                pass

print(f"Total matching lines found: {len(hits)}")

# Group by file
files_map = {}
for h in hits:
    f = h['file']
    files_map[f] = files_map.get(f, 0) + 1

for f, count in sorted(files_map.items()):
    print(f"{f}: {count} hits")
