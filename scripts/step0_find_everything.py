import os
import re
import json

terms = [
    (r'\bmundra\b', 'Mundra'),
    (r'\bhazira\b', 'Hazira'),
    (r'\bpipavav\b', 'Pipavav'),
    (r'\bjnpt\b', 'JNPT'),
    (r'\bports?\b', 'Port / Ports'),
    (r'\bloading\s+ports?\b', 'Loading Port'),
    (r'\bport\s+clearance\b', 'Port Clearance'),
    (r'\bvessels?\b', 'Vessel'),
    (r'\bsailing\b', 'Sailing'),
    (r'\bclean\s+on\s+board\b', 'Clean on Board'),
    (r'\bb/l\b', 'B/L'),
    (r'\bicegate\b', 'ICEGATE'),
    (r'\bconnectivity\b', 'Connectivity'),
    (r'\bnearby\b', 'Nearby'),
    (r'\bsurat\b', 'Surat'),
    (r'\bgujarat\b', 'Gujarat'),
    (r'\binspection\b', 'Inspection'),
    (r'\bthird-party\b', 'Third-Party'),
    (r'\bindependent\s+inspection\b', 'Independent Inspection'),
    (r'\bsgs\b', 'SGS'),
    (r'\bbureau\s+veritas\b', 'Bureau Veritas'),
    (r'\bintertek\b', 'Intertek'),
    (r'\bpre-shipment\b', 'Pre-Shipment'),
    (r'\blabs?\b', 'Lab'),
    (r'\blaborator(y|ies)\b', 'Laboratory'),
    (r'\bnabl\b', 'NABL'),
    (r'\bcoa\b', 'COA'),
    (r'\bcertificates?\s+of\s+analysis\b', 'Certificate of Analysis'),
    (r'\bsortex\b', 'Sortex'),
    (r'\bdestoning\b', 'Destoning'),
    (r'\bmetal\s+detection\b', 'Metal Detection'),
    (r'\bfumigation\b', 'Fumigation'),
    (r'\bphytosanitary\b', 'Phytosanitary'),
    (r'\blogistics\b', 'Logistics'),
    (r'\bfreight\b', 'Freight')
]

compiled_terms = [(re.compile(pattern, re.IGNORECASE), name) for pattern, name in terms]

search_roots = ['client/src', 'server/src', 'docs', 'README.md']
ignore_dirs = {'node_modules', '.git', 'dist', 'build', 'artifacts', 'backups', 'jhs-ui-capture', 'video'}
ignore_exts = {'.png', '.jpg', '.jpeg', '.webp', '.ico', '.pdf', '.xlsx', '.zip', '.tar', '.gz'}

results = []

for root_dir in search_roots:
    if os.path.isfile(root_dir):
        files_to_check = [root_dir]
    else:
        files_to_check = []
        for r, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext not in ignore_exts:
                    files_to_check.append(os.path.join(r, f))

    for fpath in files_to_check:
        norm_path = fpath.replace('\\', '/')
        try:
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            for idx, line in enumerate(lines, 1):
                clean_line = line.strip()
                # Skip pure code comments or import statements if irrelevant, but check everything
                # Exclude purely technical terms like process.env.PORT or localhost:5000 or react router imports
                if re.search(r'process\.env\.PORT|localhost:\d+|PORT\s*=\s*\d+', line):
                    continue
                for regex, term_name in compiled_terms:
                    m = regex.search(line)
                    if m:
                        results.append({
                            'file': norm_path,
                            'line': idx,
                            'term': term_name,
                            'matched': m.group(0),
                            'text': clean_line
                        })
                        break # One hit per line is enough
        except Exception as e:
            pass

print(f"Total hits found: {len(results)}")

with open('step0_hits.json', 'w', encoding='utf-8') as out:
    json.dump(results, out, indent=2)

# Print summary by file
file_summary = {}
for r in results:
    f = r['file']
    file_summary[f] = file_summary.get(f, 0) + 1

for f, count in sorted(file_summary.items(), key=lambda x: -x[1]):
    print(f"{f}: {count} hits")
