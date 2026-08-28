const fs = require('fs');

const path = 'src/app/invoice/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const fields = [
    { oldLabel: 'Company Name', key: 'customerName', fallback: 'Applicant Name', oldFieldKey: 'inv_customerName' },
    { oldLabel: 'Company Address', key: 'companyAddress', fallback: 'Company Address', oldFieldKey: 'inv_companyAddress' },
    { oldLabel: 'Contact Person', key: 'responsiblePerson', fallback: 'Contact Person', oldFieldKey: 'inv_responsiblePerson' },
    { oldLabel: 'Contact detail', key: 'contactDetail', fallback: 'Contact detail', oldFieldKey: 'inv_contactDetail' },
    { oldLabel: 'Email', key: 'email', fallback: 'Email', oldFieldKey: 'inv_email' },
    { oldLabel: 'NTN #', key: 'ntn', fallback: 'NTN #', oldFieldKey: 'inv_ntn' },
    { oldLabel: 'Other Information', key: 'otherInformation', fallback: 'Other Information', oldFieldKey: 'inv_otherInformation' },
];

fields.forEach(f => {
    // We will do string replacement using split/join to avoid regex syntax errors completely.
    const searchString1 = \`<label className="text-xs font-semibold text-slate-600">\${f.oldLabel}</label>\`;
    const searchString2 = \`fieldKey="\${f.oldFieldKey}"\`;
    
    // First, let's locate the label and the fieldKey.
    // Actually, I can just use a simpler regex that matches anything in between.
    const regex = new RegExp(\`<label className="text-xs font-semibold text-slate-600">\${f.oldLabel}</label>[\\\\s\\\\S]*?fieldKey="\${f.oldFieldKey}" className="w-full border rounded p-2 text-sm" />\`);
    
    const replacement = \`<input type="text" value={formData.fieldLabels?.\${f.key} || '\${f.fallback}'} onChange={e => updateLabel('\${f.key}', e.target.value)} className="text-[11px] font-bold text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />
                  <DropdownInput value={formData.\${f.key}} onChange={v => updateField('\${f.key}', v)} fieldKey={formData.fieldLabels?.\${f.key} || '\${f.fallback}'} className="w-full border rounded p-2 text-sm" />\`;
                  
    code = code.replace(regex, replacement);
});

// Now for item fields
const itemFields = [
    { key: 'testName', stateKey: 'test', fallback: 'Test Name' },
    { key: 'testMethod', stateKey: 'method', fallback: 'Test Method' },
];

itemFields.forEach(f => {
    const regex = new RegExp(\`<DropdownInput fieldKey="\${f.key}" value=\\{item\\.\${f.stateKey}\\} onChange=\\{val => updateItem\\(item\\.id, '\${f.stateKey}', val\\)\\} className="w-full border rounded p-1 text-sm([\\\\s\\\\S]*?)" placeholder="[\\\\s\\\\S]*?" />\`);
    const replacement = \`<div>
                        <input type="text" value={formData.fieldLabels?.\${f.stateKey} || '\${f.fallback}'} onChange={e => updateLabel('\${f.stateKey}', e.target.value)} className="text-[10px] font-bold text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />
                        <DropdownInput fieldKey={formData.fieldLabels?.\${f.stateKey} || '\${f.fallback}'} value={item.\${f.stateKey}} onChange={val => updateItem(item.id, '\${f.stateKey}', val)} className="w-full border rounded p-1 text-sm$1" placeholder=" " />
                      </div>\`;
    code = code.replace(regex, replacement);
});

// Price and samples
const priceRegex = /<label className="text-\[10px\] text-slate-500">PRICE \(PKR\)<\/label>\s*<DropdownInput fieldKey="inv_item_price" placeholder="0" value=\{item\.price\?\.toString\(\) \|\| ''\} onChange=\{val => updateItem\(item\.id, 'price', val\)\} className="w-full border rounded p-1 text-sm text-right" \/>/;
const priceReplacement = \`<input type="text" value={formData.fieldLabels?.price || 'PRICE (PKR)'} onChange={e => updateLabel('price', e.target.value)} className="text-[10px] font-bold text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />
                          <DropdownInput fieldKey={formData.fieldLabels?.price || 'PRICE (PKR)'} placeholder="0" value={item.price?.toString() || ''} onChange={val => updateItem(item.id, 'price', val)} className="w-full border rounded p-1 text-sm text-right" />\`;
code = code.replace(priceRegex, priceReplacement);

const samplesRegex = /<label className="text-\[10px\] text-slate-500">No of sample<\/label>\s*<DropdownInput fieldKey="inv_item_samples" placeholder="1" value=\{item\.samples\?\.toString\(\) \|\| ''\} onChange=\{val => updateItem\(item\.id, 'samples', val\)\} className="w-full border rounded p-1 text-sm text-right" \/>/;
const samplesReplacement = \`<input type="text" value={formData.fieldLabels?.samples || 'No of sample'} onChange={e => updateLabel('samples', e.target.value)} className="text-[10px] font-bold text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />
                          <DropdownInput fieldKey={formData.fieldLabels?.samples || 'No of sample'} placeholder="1" value={item.samples?.toString() || ''} onChange={val => updateItem(item.id, 'samples', val)} className="w-full border rounded p-1 text-sm text-right" />\`;
code = code.replace(samplesRegex, samplesReplacement);


fs.writeFileSync(path, code);
console.log('Fixed invoice ui');
