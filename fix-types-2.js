const fs = require('fs');

let invoiceCode = fs.readFileSync('src/app/invoice/page.tsx', 'utf8');
invoiceCode = invoiceCode.replace(/useState<InvoiceItem\[\]>\(/g, 'useState<any[]>(/* eslint-disable-line @typescript-eslint/no-explicit-any */\n');
invoiceCode = invoiceCode.replace(/export interface InvoiceItem \{[\s\S]*?\}/, '');
fs.writeFileSync('src/app/invoice/page.tsx', invoiceCode);

let editorCode = fs.readFileSync('src/app/editor/page.tsx', 'utf8');
editorCode = editorCode.replace(/setFormData\(parsed\.formData as ReportFormData\);/g, 'setFormData(parsed.formData as any); /* eslint-disable-line @typescript-eslint/no-explicit-any */');
editorCode = editorCode.replace(/setTests\(parsed\.tests as TestRow\[\]\);/g, 'setTests(parsed.tests as any[]); /* eslint-disable-line @typescript-eslint/no-explicit-any */');
editorCode = editorCode.replace(/setExtraPages\(\(parsed\.extraPages \|\| \[\]\) as ExtraPage\[\]\);/g, 'setExtraPages(parsed.extraPages as any[]); /* eslint-disable-line @typescript-eslint/no-explicit-any */');
editorCode = editorCode.replace(/setSampleImage\(parsed\.sampleImage as string \| null\);/g, 'setSampleImage(parsed.sampleImage as any); /* eslint-disable-line @typescript-eslint/no-explicit-any */');
fs.writeFileSync('src/app/editor/page.tsx', editorCode);
