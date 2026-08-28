const fs = require('fs');

const path = 'src/app/invoice/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const s1 = '<label className="text-[10px] text-slate-500">PRICE (PKR)</label>\\n                        <DropdownInput fieldKey="inv_item_price" placeholder="0" value={item.price?.toString() || \'\'} onChange={val => updateItem(item.id, \'price\', val)} className="w-full border rounded p-1 text-sm text-right" />'.replace(/\\n/g, '\n');
const r1 = '<input type="text" value={formData.fieldLabels?.price || "PRICE (PKR)"} onChange={e => updateLabel("price", e.target.value)} className="text-[10px] font-bold text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />\\n                        <DropdownInput fieldKey={formData.fieldLabels?.price || "PRICE (PKR)"} placeholder="0" value={item.price?.toString() || \'\'} onChange={val => updateItem(item.id, \'price\', val)} className="w-full border rounded p-1 text-sm text-right" />'.replace(/\\n/g, '\n');

code = code.replace(s1, r1);

const s2 = '<label className="text-[10px] text-slate-500">No of sample</label>\\n                        <DropdownInput fieldKey="inv_item_samples" placeholder="1" value={item.samples?.toString() || \'\'} onChange={val => updateItem(item.id, \'samples\', val)} className="w-full border rounded p-1 text-sm text-right" />'.replace(/\\n/g, '\n');
const r2 = '<input type="text" value={formData.fieldLabels?.samples || "No of sample"} onChange={e => updateLabel("samples", e.target.value)} className="text-[10px] font-bold text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />\\n                        <DropdownInput fieldKey={formData.fieldLabels?.samples || "No of sample"} placeholder="1" value={item.samples?.toString() || \'\'} onChange={val => updateItem(item.id, \'samples\', val)} className="w-full border rounded p-1 text-sm text-right" />'.replace(/\\n/g, '\n');

code = code.replace(s2, r2);

// Also fix the double if(item.price !== '') issue
code = code.replace(/if \(item\.price !== ''\) if \(item\.price !== ''\)/g, "if (item.price !== '')");
code = code.replace(/if \(item\.samples !== ''\) if \(item\.samples !== ''\)/g, "if (item.samples !== '')");


fs.writeFileSync(path, code);
