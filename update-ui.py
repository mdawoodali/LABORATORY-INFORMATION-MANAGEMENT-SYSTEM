import re
import sys

path = 'src/app/invoice/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

fields = [
    {'oldLabel': 'Company Name', 'key': 'customerName', 'fallback': 'Applicant Name', 'oldFieldKey': 'inv_customerName'},
    {'oldLabel': 'Company Address', 'key': 'companyAddress', 'fallback': 'Company Address', 'oldFieldKey': 'inv_companyAddress'},
    {'oldLabel': 'Contact Person', 'key': 'responsiblePerson', 'fallback': 'Contact Person', 'oldFieldKey': 'inv_responsiblePerson'},
    {'oldLabel': 'Contact detail', 'key': 'contactDetail', 'fallback': 'Contact detail', 'oldFieldKey': 'inv_contactDetail'},
    {'oldLabel': 'Email', 'key': 'email', 'fallback': 'Email', 'oldFieldKey': 'inv_email'},
    {'oldLabel': 'NTN #', 'key': 'ntn', 'fallback': 'NTN #', 'oldFieldKey': 'inv_ntn'},
    {'oldLabel': 'Other Information', 'key': 'otherInformation', 'fallback': 'Other Information', 'oldFieldKey': 'inv_otherInformation'},
]

for f in fields:
    pattern = r'<label className="text-xs font-semibold text-slate-600">' + f['oldLabel'] + r'</label>\s*<DropdownInput value=\{formData\.' + f['key'] + r'\} onChange=\{v => updateField\(\'' + f['key'] + r'\', v\)\} fieldKey="' + f['oldFieldKey'] + r'" className="w-full border rounded p-2 text-sm" />'
    
    replacement = f"""<input type="text" value={{formData.fieldLabels?.{f['key']} || '{f['fallback']}'}} onChange={{e => updateLabel('{f['key']}', e.target.value)}} className="text-[11px] font-bold text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />
                  <DropdownInput value={{formData.{f['key']}}} onChange={{v => updateField('{f['key']}', v)}} fieldKey={{formData.fieldLabels?.{f['key']} || '{f['fallback']}'}} className="w-full border rounded p-2 text-sm" />"""
    
    code = re.sub(pattern, replacement, code)


itemFields = [
    {'key': 'testName', 'stateKey': 'test', 'fallback': 'Test Name'},
    {'key': 'testMethod', 'stateKey': 'method', 'fallback': 'Test Method'},
]

for f in itemFields:
    pattern = r'<DropdownInput fieldKey="' + f['key'] + r'" value=\{item\.' + f['stateKey'] + r'\} onChange=\{val => updateItem\(item\.id, \'' + f['stateKey'] + r'\', val\)\} className="w-full border rounded p-1 text-sm([\s\S]*?)" placeholder="[\s\S]*?" />'
    replacement = f"""<div>
                        <input type="text" value={{formData.fieldLabels?.{f['stateKey']} || '{f['fallback']}'}} onChange={{e => updateLabel('{f['stateKey']}', e.target.value)}} className="text-[10px] font-bold text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />
                        <DropdownInput fieldKey={{formData.fieldLabels?.{f['stateKey']} || '{f['fallback']}'}} value={{item.{f['stateKey']}}} onChange={{val => updateItem(item.id, '{f['stateKey']}', val)}} className="w-full border rounded p-1 text-sm\\1" placeholder=" " />
                      </div>"""
    code = re.sub(pattern, replacement, code)

priceRegex = r'<label className="text-\[10px\] text-slate-500">PRICE \(PKR\)</label>\s*<DropdownInput fieldKey="inv_item_price" placeholder="0" value=\{item\.price\?\.toString\(\) \|\| \'\'\} onChange=\{val => updateItem\(item\.id, \'price\', val\)\} className="w-full border rounded p-1 text-sm text-right" />'
priceReplacement = """<input type="text" value={formData.fieldLabels?.price || 'PRICE (PKR)'} onChange={e => updateLabel('price', e.target.value)} className="text-[10px] font-bold text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />
                          <DropdownInput fieldKey={formData.fieldLabels?.price || 'PRICE (PKR)'} placeholder="0" value={item.price?.toString() || ''} onChange={val => updateItem(item.id, 'price', val)} className="w-full border rounded p-1 text-sm text-right" />"""
code = re.sub(priceRegex, priceReplacement, code)

samplesRegex = r'<label className="text-\[10px\] text-slate-500">No of sample</label>\s*<DropdownInput fieldKey="inv_item_samples" placeholder="1" value=\{item\.samples\?\.toString\(\) \|\| \'\'\} onChange=\{val => updateItem\(item\.id, \'samples\', val\)\} className="w-full border rounded p-1 text-sm text-right" />'
samplesReplacement = """<input type="text" value={formData.fieldLabels?.samples || 'No of sample'} onChange={e => updateLabel('samples', e.target.value)} className="text-[10px] font-bold text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase mb-1" />
                          <DropdownInput fieldKey={formData.fieldLabels?.samples || 'No of sample'} placeholder="1" value={item.samples?.toString() || ''} onChange={val => updateItem(item.id, 'samples', val)} className="w-full border rounded p-1 text-sm text-right" />"""
code = re.sub(samplesRegex, samplesReplacement, code)


with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed invoice ui")
