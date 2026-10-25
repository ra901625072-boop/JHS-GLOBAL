with open('server/src/seeds/product.seed.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re
terms = ['port', 'inspection', 'lab', 'coa', 'mundra', 'hazira', 'surat', 'pre-shipment', 'third-party', 'fumigation', 'phytosanitary']
for t in terms:
    matches = list(re.finditer(r'\b' + t + r'\b', content, re.IGNORECASE))
    print(f"Term '{t}': {len(matches)} occurrences in product.seed.js")
    for m in matches[:2]:
        start = max(0, m.start() - 40)
        end = min(len(content), m.end() + 40)
        print("   ...", content[start:end].replace('\n', ' '), "...")
