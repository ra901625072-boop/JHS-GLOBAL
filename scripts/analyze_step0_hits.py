import json

with open('step0_hits.json', 'r', encoding='utf-8') as f:
    hits = json.load(f)

print(f"Total raw hits: {len(hits)}")

categories = {
    'public_ui': [],
    'seo_metadata': [],
    'admin_desk': [],
    'seeds_fixtures': [],
    'ai_engine': [],
    'docs_readme': [],
    'statutory_legal': [],
    'technical_internal': []
}

for h in hits:
    f = h['file']
    text = h['text']
    matched = h['matched'].lower()
    
    # Check if statutory / legal
    is_legal = False
    if any(k in text.lower() for k in ['registered office', 'corporate address', 'surat, gujarat, india', 'fssai', 'apeda', 'iec', 'msme', 'gst']):
        if 'surat' in text.lower() or 'gujarat' in text.lower():
            if 'registered' in text.lower() or 'address' in text.lower() or 'pincode' in text.lower() or '3950' in text.lower():
                is_legal = True

    if is_legal:
        categories['statutory_legal'].append(h)
    elif 'client/src/admin' in f:
        categories['admin_desk'].append(h)
    elif 'client/src/components/seo' in f or 'index.html' in f:
        categories['seo_metadata'].append(h)
    elif 'server/src/seeds' in f:
        categories['seeds_fixtures'].append(h)
    elif 'server/src/modules/ai' in f:
        categories['ai_engine'].append(h)
    elif f.startswith('docs/') or f == 'README.md':
        categories['docs_readme'].append(h)
    elif f.startswith('client/src/'):
        categories['public_ui'].append(h)
    else:
        categories['technical_internal'].append(h)

print("\n--- Breakdown by Area ---")
for cat, items in categories.items():
    print(f"{cat}: {len(items)} hits")

# Let's inspect public_ui hits in detail
print("\n--- Sample Public UI hits ---")
for h in categories['public_ui'][:30]:
    print(f"{h['file']}:{h['line']} [{h['term']}] -> {h['text'][:100]}")

with open('step0_categorized.json', 'w', encoding='utf-8') as out:
    json.dump(categories, out, indent=2)
