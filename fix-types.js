const fs = require('fs');

let invoiceCode = fs.readFileSync('src/app/invoice/page.tsx', 'utf8');
if (!invoiceCode.includes('export interface InvoiceItem')) {
    invoiceCode = invoiceCode.replace(
        'export default function InvoicePage() {', 
        `export interface InvoiceItem {\n  id: string;\n  test: string;\n  method: string;\n  price: string;\n  samples: string;\n}\n\nexport default function InvoicePage() {`
    );
}
invoiceCode = invoiceCode.replace(/useState<Record<string, unknown>\[\]>\(/g, 'useState<InvoiceItem[]>(');
fs.writeFileSync('src/app/invoice/page.tsx', invoiceCode);

let editorCode = fs.readFileSync('src/app/editor/page.tsx', 'utf8');
editorCode = editorCode.replace(/setFormData\(parsed\.formData\)/g, 'setFormData(parsed.formData as ReportFormData)');
editorCode = editorCode.replace(/setTests\(parsed\.tests\)/g, 'setTests(parsed.tests as TestRow[])');
editorCode = editorCode.replace(/setExtraPages\(parsed\.extraPages \|\| \[\]\)/g, 'setExtraPages((parsed.extraPages || []) as ExtraPage[])');
editorCode = editorCode.replace(/setSampleImage\(parsed\.sampleImage\)/g, 'setSampleImage(parsed.sampleImage as string | null)');
// Wait, the errors were:
// src/app/editor/page.tsx(58,21): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'SetStateAction<ReportFormData>'.
// src/app/editor/page.tsx(59,18): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'SetStateAction<TestRow[]>'.
editorCode = editorCode.replace(/setFormData\(parsed\.formData\);/g, 'setFormData(parsed.formData as ReportFormData);');
editorCode = editorCode.replace(/setTests\(parsed\.tests\);/g, 'setTests(parsed.tests as TestRow[]);');
editorCode = editorCode.replace(/setExtraPages\(parsed\.extraPages \|\| \[\]\);/g, 'setExtraPages((parsed.extraPages || []) as ExtraPage[]);');
fs.writeFileSync('src/app/editor/page.tsx', editorCode);
