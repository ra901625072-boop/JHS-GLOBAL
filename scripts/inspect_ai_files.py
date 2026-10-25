import os
import re

ai_dir = 'server/src/modules/ai'
terms = ['port', 'inspection', 'lab', 'coa', 'mundra', 'hazira', 'surat', 'pre-shipment', 'third-party', 'fumigation', 'phytosanitary']

for root, dirs, files in os.walk(ai_dir):
    for file in files:
        if file.endswith('.js'):
            p = os.path.join(root, file).replace('\\', '/')
            with open(p, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            for idx, line in enumerate(lines, 1):
                for t in terms:
                    if re.search(r'\b' + t + r'\b', line, re.IGNORECASE):
                        print(f"{p}:{idx} [{t}] -> {line.strip()[:100]}")
                        break
