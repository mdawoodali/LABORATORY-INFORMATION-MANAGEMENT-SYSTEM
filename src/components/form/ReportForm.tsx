import React from 'react';
import { Printer, Plus, Trash2, Image as ImageIcon, X, ArrowLeft, Save, Settings } from 'lucide-react';
import { ReportFormData, TestRow, migrateToDynamicFields } from '@/types';
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
  onOpenSettings?: () => void;
  brandSettings?: { logoBase64: string; companyName: string; };
  updateDynamicField?: (id: string, value: string) => void;
  addDynamicField?: (label: string, value: string, bold: boolean) => void;
  removeDynamicField?: (id: string) => void;
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
  addDynamicField,
  removeDynamicField
}: ReportFormProps) {
  const [password, setPassword] = React.useState('');
  return (
    <div className="w-[450px] bg-white border-r shadow-lg flex flex-col z-10 no-print h-full">
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
          <h2 className="font-bold text-lg tracking-wider flex-1 truncate">{brandSettings?.companyName || "Report Generator"}</h2>
          {onOpenSettings && (
            <button onClick={onOpenSettings} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all text-slate-300 hover:text-white" title="Settings">
              <Settings size={16} />
            </button>
          )}
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
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded shadow transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            <Printer size={16} /> Generate PDF
          </button>
          {onSaveTemplate && (
            <button 
              onClick={onSaveTemplate}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded shadow transition-all active:scale-95 flex items-center justify-center gap-1 text-xs"
              title="Save as Template"
            >
              <Save size={14} /> Make Template
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1 pb-20 space-y-6">
        
        {/* General Info */}
        <section>
          <h3 className="font-bold text-xs text-slate-400 mb-2 uppercase tracking-widest">General Info</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Report # <span className="text-slate-400 font-normal">(Auto-generated)</span></label>
              <input type="text" value={formData.reportNo} readOnly disabled className="w-full border border-slate-200 rounded p-2 text-sm font-mono bg-gray-100 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Applicant</label>
              <DropdownInput fieldKey="applicant" value={formData.applicant} onChange={val => updateField('applicant', val)} className="w-full border border-slate-300 rounded p-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
              <DropdownInput fieldKey="address" value={formData.address} onChange={val => updateField('address', val)} className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone #</label>
              <DropdownInput fieldKey="phone" value={formData.phone} onChange={val => updateField('phone', val)} className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Sample Details */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Page 1 Fields</h3>
            <button onClick={() => {
              const label = prompt("Enter field name:");
              if (label) addDynamicField?.(label, '', false);
            }} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
              <Plus size={12} /> Add Field
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            {migrateToDynamicFields(formData).map((f) => (
              <div key={f.id} className={f.label === 'SAMPLE DESCRIPTION' ? 'col-span-2 group relative' : 'col-span-1 group relative'}>
                <label className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                  {f.label}
                  {f.id.startsWith('f_') && removeDynamicField && (
                    <button onClick={() => removeDynamicField(f.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove Custom Field">
                      <Trash2 size={12} />
                    </button>
                  )}
                </label>
                <DropdownInput 
                  fieldKey={f.label} 
                  value={f.value} 
                  onChange={val => {
                    if (updateDynamicField) updateDynamicField(f.id, val);
                    else updateField(f.id as any, val); // fallback
                  }} 
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
            ))}
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Test Details */}
        <section>
          <h3 className="font-bold text-xs text-slate-400 mb-2 uppercase tracking-widest">Page 2 Tests</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Testing Sentence</label>
                <textarea value={formData.sampleDetails} onChange={e => updateField('sampleDetails', e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm resize-y focus:ring-2 focus:ring-blue-500 outline-none transition-all" rows={2} />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Col 1 Header</label>
              <DropdownInput fieldKey="tableHeader1" value={formData.tableHeader1} onChange={val => updateField('tableHeader1', val)} className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Col 2 Header</label>
              <DropdownInput fieldKey="tableHeader2" value={formData.tableHeader2} onChange={val => updateField('tableHeader2', val)} className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Col 3 Header</label>
              <DropdownInput fieldKey="tableHeader3" value={formData.tableHeader3} onChange={val => updateField('tableHeader3', val)} className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Col 4 Header</label>
              <DropdownInput fieldKey="tableHeader4" value={formData.tableHeader4} onChange={val => updateField('tableHeader4', val)} className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="col-span-2 mb-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Table Footer Text</label>
                <DropdownInput fieldKey="footerText" value={formData.footerText} onChange={val => updateField('footerText', val)} className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
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
                    <label className="text-[10px] uppercase font-bold text-slate-400">Unit</label>
                    <DropdownInput fieldKey="testUnit" placeholder="Unit" value={test.unit} onChange={val => updateTest(test.id, 'unit', val)} className="w-full border-b border-slate-300 bg-transparent text-xs py-1 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">ASTM Standard</label>
                    <DropdownInput fieldKey="testStandard" placeholder="Standard" value={test.standard} onChange={val => updateTest(test.id, 'standard', val)} className="w-full border-b border-slate-300 bg-transparent text-xs py-1 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="col-span-2 mt-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Actual Result</label>
                    <DropdownInput fieldKey="testResult" placeholder="Actual Result" value={test.result} onChange={val => updateTest(test.id, 'result', val)} className="w-full bg-white border border-slate-300 rounded text-sm p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addTest} className="mt-4 w-full border-2 border-dashed border-slate-300 text-slate-600 rounded-lg py-3 text-sm font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-center items-center gap-2"><Plus size={16}/> ADD TEST ROW</button>
        </section>

        <hr className="border-slate-200" />

        {/* Image Upload */}
        <section>
          <h3 className="font-bold text-xs text-slate-400 mb-2 uppercase tracking-widest">Page 3 Appendix</h3>
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
        </section>

      </div>
    </div>
  );
}
