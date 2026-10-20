import base64
from PIL import Image
import io

# Load mark
mark = Image.open(r'd:\hardik\JSH Global\client\public\images\logo\logo-mark.png')
# Resize to 128x128 for crisp svg embedding
mark_128 = mark.resize((128, 128), Image.Resampling.LANCZOS)
buf = io.BytesIO()
mark_128.save(buf, format='PNG', optimize=True)
b64_png = base64.b64encode(buf.getvalue()).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="JHS Global Logo Mark">
  <defs>
    <clipPath id="squircle">
      <rect width="64" height="64" rx="14" ry="14" />
    </clipPath>
  </defs>
  <rect width="64" height="64" rx="14" ry="14" fill="#ffffff" />
  <image href="data:image/png;base64,{b64_png}" x="2" y="2" width="60" height="60" clip-path="url(#squircle)" preserveAspectRatio="xMidYMid meet" />
</svg>'''

with open(r'd:\hardik\JSH Global\client\public\favicon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print('favicon.svg generated! Size:', len(svg_content), 'bytes')
