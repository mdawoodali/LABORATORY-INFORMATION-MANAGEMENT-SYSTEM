import React from 'react';
import { Printer, Plus, Trash2, Image as ImageIcon, X, ArrowLeft, Save, Settings, ChevronDown } from 'lucide-react';
import { ReportFormData, TestRow, migrateToDynamicFields, ExtraPage } from '@/types';
import DropdownInput from './DropdownInput';

interface ReportFormProps {
  formData: ReportFormData;
  updateField: (field: keyof ReportFormData, value: string) => void;
  tests: TestRow[];
  addTest: () => void;
  updateTest: (id: string, field: keyof TestRow, value: string) => void;
  removeTest: (id: string) => void;
  sampleImage: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  handlePrint: (password?: string) => void;
  onSaveTemplate?: () => void;
  onGoHome?: () => void;
  onOpenSettings?: () => void;
  brandSettings?: { logoBase64: string; companyName: string; };
  updateDynamicField?: (id: string, value: string) => void;
  renameDynamicField?: (id: string, newLabel: string) => void;
  addDynamicField?: (label: string, value: string, bold: boolean) => void;
  removeDynamicField?: (id: string) => void;
  extraPages?: ExtraPage[];
  setExtraPages?: (pages: ExtraPage[]) => void;
  isGenerating?: boolean;
  isSuccess?: boolean;
}

export default function ReportForm({
  formData,
  updateField,
  tests,
  addTest,
  updateTest,
  removeTest,
  sampleImage,
  handleImageUpload,
  removeImage,
  handlePrint,
  onSaveTemplate,
  onGoHome,
  onOpenSettings,
  brandSettings,
  updateDynamicField,
  renameDynamicField,
  addDynamicField,
  removeDynamicField,
  extraPages,
  setExtraPages,
  isGenerating,
  isSuccess
}: ReportFormProps) {
  const [password, setPassword] = React.useState('');
  const [isPage1FieldsOpen, setIsPage1FieldsOpen] = React.useState(false);
  const [isPage2TestsOpen, setIsPage2TestsOpen] = React.useState(false);
  const [isPage3AppendixOpen, setIsPage3AppendixOpen] = React.useState(false);
  return (
    <div className="w-full md:w-[450px] bg-white border-r shadow-lg flex flex-col z-10 no-print h-full md:h-screen">
      <div className="p-4 border-b bg-slate-900 text-white flex flex-col gap-3 shrink-0">
        
        {/* Top row: Back + Title */}
        <div className="flex items-center gap-3">
          {onGoHome && (
            <button onClick={onGoHome} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all">
              <ArrowLeft size={16} />
            </button>
          )}
          {brandSettings?.logoBase64 && (
             <img src={brandSettings.logoBase64} alt="Logo" className="w-8 h-8 object-contain rounded-md bg-white p-0.5" />
          )}
          <h2 className="font-bold text-lg tracking-wider flex-1 truncate">L.I.M.S</h2>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">PDF Password Lock</label>
          <input
            type="text"
            className="border border-slate-600 bg-slate-800 rounded p-2 text-sm w-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPaste={(e) => {
              e.preventDefault();
              import('react-hot-toast').then(mod => mod.default.error("Pasting disabled for security reasons."));
            }}
            placeholder="Enter password to lock PDF"
          />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => handlePrint(password)}
            disabled={isGenerating}
            className={`flex-1 ${isGenerating ? 'bg-slate-500 cursor-not-allowed' : isSuccess ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'} text-white font-bold py-2 px-3 md:px-4 rounded shadow transition-all active:scale-95 flex items-center justify-center gap-2 text-sm`}
          >
            <Printer size={16} /> 
            <span className="hidden sm:inline">{isGenerating ? 'Generating PDF...' : isSuccess ? 'Successful' : 'Generate PDF'}</span>
            <span className="sm:hidden">{isGenerating ? 'Wait...' : isSuccess ? 'Done' : 'Print'}</span>
          </button>
          {onSaveTemplate && (
            <button 
              onClick={onSaveTemplate}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded shadow transition-all active:scale-95 flex items-center justify-center gap-1 text-xs"
              title="Save as Template"
            >
              <Save size={14} /> <span className="hidden sm:inline">Make Template</span><span className="sm:hidden">Save</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1 pb-20 space-y-6">
        
        {/* General Info */}
        <section>
          <h3 className="font-bold text-xs text-slate-400 mb-2 uppercase tracking-widest">General Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Report # <span className="text-slate-400 font-normal">(Auto-generated)</span></label>
              <input type="text" value={formData.reportNo} readOnly disabled className="w-full border border-slate-200 rounded p-2 text-sm font-mono bg-gray-100 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Report Date</label>
              <input 
                type="date" 
                value={formData.reportDate ? (formData.reportDate.split('-').length === 3 ? `${formData.reportDate.split('-')[2]}-${formData.reportDate.split('-')[1]}-${formData.reportDate.split('-')[0]}` : formData.reportDate) : ''} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const parts = val.split('-');
                    if (parts.length === 3) updateField('reportDate', `${parts[2]}-${parts[1]}-${parts[0]}`);
                    else updateField('reportDate', val);
                  } else {
                    updateField('reportDate', '');
                  }
                }} 
                className="w-full border border-slate-200 rounded p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Sample Details */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <button onClick={() => setIsPage1FieldsOpen(!isPage1FieldsOpen)} className="flex items-center gap-1 font-bold text-xs text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
              <ChevronDown size={14} className={`transform transition-transform ${isPage1FieldsOpen ? 'rotate-180' : ''}`} />
              Page 1 Fields
            </button>
            <button onClick={() => {
              const label = prompt("Enter field name:");
              if (label) addDynamicField?.(label, '', false);
            }} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
              <Plus size={12} /> Add Field
            </button>
          </div>
          {isPage1FieldsOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3">
              {migrateToDynamicFields(formData).map((f) => (
                <div key={f.id} className={f.label === 'SAMPLE DESCRIPTION' || f.value.length > 30 ? 'col-span-2 group relative' : 'col-span-1 group relative'}>
                  <div className="flex justify-between items-center mb-1">
                    <input 
                      type="text"
                      value={f.label}
                      onChange={(e) => renameDynamicField?.(f.id, e.target.value)}
                      className="text-[11px] font-bold text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full uppercase"
                    />
                    {removeDynamicField && (
                      <button onClick={() => removeDynamicField(f.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" title="Remove Field">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <DropdownInput 
                    fieldKey={f.label} 
                    value={f.value} 
                    onChange={val => {
                      if (updateDynamicField) updateDynamicField(f.id, val);
                      else updateField(f.id as keyof ReportFormData, val); // fallback
                    }} 
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <hr className="border-slate-200" />

        {/* Test Details */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <button onClick={() => setIsPage2TestsOpen(!isPage2TestsOpen)} className="flex items-center gap-1 font-bold text-xs text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
              <ChevronDown size={14} className={`transform transition-transform ${isPage2TestsOpen ? 'rotate-180' : ''}`} />
              Page 2 Tests
            </button>
          </div>
          {isPage2TestsOpen && (
            <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Testing Sentence</label>
                <textarea value={formData.sampleDetails} onChange={e => updateField('sampleDetails', e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm resize-y focus:ring-2 focus:ring-blue-500 outline-none transition-all" rows={2} />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Col 1 Header</label>
              <DropdownInput fieldKey="tableHeader1" placeholder="Test" value={formData.tableHeader1} onChange={val => updateField('tableHeader1', val)} className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Col 2 Header</label>
              <DropdownInput fieldKey="tableHeader2" placeholder="Test Method" value={formData.tableHeader2} onChange={val => updateField('tableHeader2', val)} className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Col 3 Header</label>
              <DropdownInput fieldKey="tableHeader3" placeholder="Value" value={formData.tableHeader3} onChange={val => updateField('tableHeader3', val)} className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Col 4 Header</label>
              <DropdownInput fieldKey="tableHeader4" placeholder="Unit" value={formData.tableHeader4} onChange={val => updateField('tableHeader4', val)} className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Col 5 Header</label>
              <DropdownInput fieldKey="tableHeader5" placeholder="Result" value={formData.tableHeader5} onChange={val => updateField('tableHeader5', val)} className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-2 mb-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Table Footer Text</label>
                <DropdownInput fieldKey="footerText" placeholder="Average readings are reported." value={formData.footerText} onChange={val => updateField('footerText', val)} className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>
          
          <div className="space-y-3">
            {tests.map((test) => (
              <div key={test.id} className="border border-slate-200 bg-slate-50 p-3 rounded-lg relative shadow-sm hover:shadow transition-all">
                <div className="absolute -top-2 -right-2">
                   <button onClick={() => removeTest(test.id)} className="bg-slate-800 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow"><Trash2 size={12} /></button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Test Name</label>
                    <DropdownInput fieldKey="testName" placeholder="Test Name" value={test.test} onChange={val => updateTest(test.id, 'test', val)} className="w-full border-b border-slate-300 bg-transparent text-sm font-semibold py-1 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Test Method</label>
                    <DropdownInput fieldKey="testMethod" placeholder="Test Method" value={test.method} onChange={val => updateTest(test.id, 'method', val)} className="w-full border-b border-slate-300 bg-transparent text-xs py-1 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Value</label>
                    <DropdownInput fieldKey="testValue" placeholder="Value" value={test.value} onChange={val => updateTest(test.id, 'value', val)} className="w-full border-b border-slate-300 bg-transparent text-xs py-1 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Unit</label>
                    <DropdownInput fieldKey="testUnit" placeholder="Unit" value={test.unit} onChange={val => updateTest(test.id, 'unit', val)} className="w-full border-b border-slate-300 bg-transparent text-xs py-1 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Result</label>
                    <DropdownInput fieldKey="testResult" placeholder="Result" value={test.result} onChange={val => updateTest(test.id, 'result', val)} defaultOptions={['Pass', 'Fail']} className="w-full bg-white border border-slate-300 rounded text-sm p-1.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addTest} className="mt-4 w-full border-2 border-dashed border-slate-300 text-slate-600 rounded-lg py-3 text-sm font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-center items-center gap-2"><Plus size={16}/> ADD TEST ROW</button>
            </>
          )}
        </section>

        <hr className="border-slate-200" />

        {/* Image Upload */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <button onClick={() => setIsPage3AppendixOpen(!isPage3AppendixOpen)} className="flex items-center gap-1 font-bold text-xs text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
              <ChevronDown size={14} className={`transform transition-transform ${isPage3AppendixOpen ? 'rotate-180' : ''}`} />
              Page 3 Appendix
            </button>
          </div>
          {isPage3AppendixOpen && (
            <>
          <label className="w-full flex flex-col items-center px-4 py-8 bg-slate-50 rounded-lg shadow-sm tracking-wide border-dashed border-2 border-slate-300 cursor-pointer hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all">
              <ImageIcon size={28} className="text-slate-400 mb-3" />
              <span className="text-sm font-bold text-slate-600">Select Image Proof</span>
              <span className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG</span>
              <input type='file' className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
          {sampleImage && (
            <div className="mt-4 relative group">
              <img src={sampleImage} alt="Sample" className="w-full h-40 object-cover rounded-lg border shadow-sm" />
              <button onClick={removeImage} className="absolute top-2 right-2 bg-slate-900 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><X size={14}/></button>
            </div>
          )}
            </>
          )}
        </section>

        {/* Extra Pages */}
        {extraPages?.map((page, index) => {
          const pageName = `Page ${sampleImage ? 4 + index : 3 + index} Appendix`;
          return (
            <section key={page.id} className="pt-4 border-t mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xs text-slate-400 uppercase tracking-widest">{pageName}</span>
                <button onClick={() => setExtraPages?.(extraPages.filter(p => p.id !== page.id))} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded transition-colors" title="Delete Page"><Trash2 size={14}/></button>
              </div>
              <div className="flex flex-col gap-3">
                <label className="w-full flex flex-col items-center px-4 py-4 bg-slate-50 rounded-lg shadow-sm tracking-wide border-dashed border-2 border-slate-300 cursor-pointer hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all">
                    <ImageIcon size={20} className="text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-600">Upload Image Proof</span>
                    <input type='file' className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setExtraPages?.(extraPages.map(p => p.id === page.id ? { ...p, image: reader.result as string } : p));
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                </label>
                {page.image && (
                  <div className="relative group">
                    <img src={page.image} alt="Appendix" className="w-full h-32 object-cover rounded-lg border shadow-sm" />
                    <button onClick={() => setExtraPages?.(extraPages.map(p => p.id === page.id ? { ...p, image: null } : p))} className="absolute top-2 right-2 bg-slate-900 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><X size={12}/></button>
                  </div>
                )}
                
                <textarea 
                  placeholder="Or type appendix text here..."
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-colors"
                  value={page.text}
                  onChange={(e) => setExtraPages?.(extraPages.map(p => p.id === page.id ? { ...p, text: e.target.value } : p))}
                />
              </div>
            </section>
          );
        })}

        <button 
          onClick={() => setExtraPages?.([...(extraPages || []), { id: Date.now().toString(), image: null, text: '' }])}
          className="w-full mt-6 py-3 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg font-bold text-sm hover:bg-blue-100 transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> ADD PAGE
        </button>

      </div>
    </div>
  );
}
