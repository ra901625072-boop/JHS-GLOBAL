import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('step0_hits.json', 'r', encoding='utf-8') as f:
    hits = json.load(f)

public_hits = []
for h in hits:
    f = h['file']
    if f.startswith('client/src/') and not f.startswith('client/src/admin/') and not f.startswith('client/src/tests/'):
        public_hits.append(h)

print(f"Total Public UI Hits: {len(public_hits)}")
for idx, h in enumerate(public_hits, 1):
    print(f"[{idx}] {h['file']}:{h['line']} [{h['term']}] -> {h['text']}")
