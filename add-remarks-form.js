const fs = require('fs');

const formPath = 'src/components/form/ReportForm.tsx';
let formCode = fs.readFileSync(formPath, 'utf8');

const regex = /<textarea value=\{formData\.sampleDetails\}([\s\S]*?)rows=\{2\} \/>\s*<\/div>/;
const replacement = `<textarea value={formData.sampleDetails}$1rows={2} />
              </div>
              <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Remarks</label>
                  <textarea value={formData.remarks || ''} onChange={e => updateField('remarks', e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm resize-y focus:ring-2 focus:ring-blue-500 outline-none transition-all" rows={2} placeholder="Optional remarks to show below table" />
              </div>`;

formCode = formCode.replace(regex, replacement);

fs.writeFileSync(formPath, formCode);
console.log('Added remarks field to form');
