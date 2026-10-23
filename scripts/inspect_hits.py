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

target_files = [
    'client/src/pages/ExportProcess/index.jsx',
    'client/src/pages/Home/index.jsx',
    'client/src/pages/Quality/index.jsx',
    'client/src/pages/ProductDetail/index.jsx',
    'client/src/pages/Contact/index.jsx',
    'client/src/pages/Faq/index.jsx',
    'client/src/data/aboutContent.js',
    'client/src/components/layout/Footer.jsx',
    'client/src/components/layout/Header.jsx',
    'client/src/components/home/GovCertificationsSection.jsx',
    'client/src/components/home/WorldTradeMap.jsx',
    'server/src/seeds/trust.seed.js',
    'server/src/seeds/companyFact.seed.js',
    'server/src/modules/ai/prompts/buyerAssistant.v3.prompt.js'
]

for tf in target_files:
    if not os.path.exists(tf):
        print(f"File not found: {tf}")
        continue
    print(f"\n==================== {tf} ====================")
    with open(tf, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    for idx, l in enumerate(lines, 1):
        for ct in compiled_terms:
            m = ct.search(l)
            if m:
                print(f"L{idx:4d} [{m.group(0)}]: {l.strip()}")
                break
