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
    const searchStr1 = '<label className="text-xs font-semibold text-slate-600">' + f.oldLabel + '</label>';
    const idx1 = code.indexOf(searchStr1);
    if (idx1 === -1) return;
    
    const searchStr2 = 'fieldKey="' + f.oldFieldKey + '" className="w-full border rounded p-2 text-sm" />';
    const idx2 = code.indexOf(searchStr2, idx1);
    if (idx2 === -1) return;
    
    const fullMatch = code.substring(idx1, idx2 + searchStr2.length);
    
    const replacement = '<input type="text" value={formData.fieldLabels?.' + f.key + ' || "' + f.fallback + '"} onChange={e => updateLabel("' + f.key + '", e.target.value)} className="text-[11px] font-bold text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />\\n                  <DropdownInput value={formData.' + f.key + '} onChange={v => updateField("' + f.key + '", v)} fieldKey={formData.fieldLabels?.' + f.key + ' || "' + f.fallback + '"} className="w-full border rounded p-2 text-sm" />'.replace(/\\n/g, '\n');
    
    code = code.replace(fullMatch, replacement);
});

const itemFields = [
    { key: 'testName', stateKey: 'test', fallback: 'Test Name' },
    { key: 'testMethod', stateKey: 'method', fallback: 'Test Method' },
];

itemFields.forEach(f => {
    const searchStr1 = '<DropdownInput fieldKey="' + f.key + '" value={item.' + f.stateKey + '} onChange={val => updateItem(item.id, \'' + f.stateKey + '\', val)} className="w-full border rounded p-1 text-sm';
    const idx1 = code.indexOf(searchStr1);
    if (idx1 === -1) return;
    
    const searchStr2 = '" />';
    const idx2 = code.indexOf(searchStr2, idx1 + searchStr1.length);
    if (idx2 === -1) return;
    
    const fullMatch = code.substring(idx1, idx2 + searchStr2.length);
    const classNameExt = fullMatch.substring(searchStr1.length, fullMatch.indexOf('" placeholder="'));
    
    const replacement = '<div>\\n                        <input type="text" value={formData.fieldLabels?.' + f.stateKey + ' || "' + f.fallback + '"} onChange={e => updateLabel("' + f.stateKey + '", e.target.value)} className="text-[10px] font-bold text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />\\n                        <DropdownInput fieldKey={formData.fieldLabels?.' + f.stateKey + ' || "' + f.fallback + '"} value={item.' + f.stateKey + '} onChange={val => updateItem(item.id, \'' + f.stateKey + '\', val)} className="w-full border rounded p-1 text-sm' + classNameExt + '" placeholder=" " />\\n                      </div>'.replace(/\\n/g, '\n');
    
    code = code.replace(fullMatch, replacement);
});

fs.writeFileSync(path, code);
console.log('Fixed invoice ui string matching');
