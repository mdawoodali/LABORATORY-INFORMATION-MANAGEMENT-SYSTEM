import base64

with open(r'C:\Users\Noman Traders\Downloads\ChatGPT Image Sep 11, 2026, 12_27_25 PM.png', 'rb') as img_file:
    b64 = base64.b64encode(img_file.read()).decode('utf-8')

out = f"export const PQSStampBase64 = 'data:image/png;base64,{b64}';\n"

with open(r'src\components\report\PQSStampBase64.ts', 'w', encoding='utf-8') as out_file:
    out_file.write(out)
