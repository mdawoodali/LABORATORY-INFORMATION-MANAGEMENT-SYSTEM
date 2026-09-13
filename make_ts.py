import os
b64 = open('stamp_b64.txt', 'r').read().strip()
out = f"export const PQSStampBase64 = 'data:image/png;base64,{b64}';\n"
with open(r'src\components\report\PQSStampBase64.ts', 'w') as f:
    f.write(out)
