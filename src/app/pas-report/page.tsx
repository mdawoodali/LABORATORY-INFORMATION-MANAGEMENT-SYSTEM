"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SettingsModal from '@/components/SettingsModal';
import PQSWordmark from '@/components/report/PQSWordmark';
import ReportForm from '@/components/form/ReportForm';
import Header from '@/components/report/Header';
import SubHeader from '@/components/report/SubHeader';
import PageOneData from '@/components/report/PageOneData';
import TestTable from '@/components/report/TestTable';
import Signature from '@/components/report/Signature';
import CanvaImage from '@/components/report/CanvaImage';
import { ReportFormData, TestRow, Template, DEFAULT_FORM_DATA, DEFAULT_TESTS, AppSettings, DEFAULT_SETTINGS, migrateToDynamicFields, ExtraPage } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Undo2, Redo2, ZoomIn, ZoomOut } from 'lucide-react';
import QRCode from 'react-qr-code';

const convertDate = (d: string) => {
  if (!d) return '';
  const p = d.split('-');
  if (p.length !== 3) return d;
  return `${p[2]}-${p[1]}-${p[0]}`;
};

const PASHeader = ({ reportNo, reportingDate, onReportingDateChange }: { reportNo: string, reportingDate: string, onReportingDateChange?: (date: string) => void }) => {
  const verifyUrl = `https://sr-laboratories-nine.vercel.app/verify/${reportNo}`;

  return (
    <div className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4 px-10 pt-6">
      <div className="flex items-center gap-3 shrink-0">
        <img src="/pqs-logo.svg" alt="PQS Logo" className="w-[90px] h-[90px] object-contain" />
        <div className="flex flex-col">
          <PQSWordmark className="mb-2" />
          <div className="text-xs text-gray-600 mt-0 flex flex-col">
            <span>R-332/9, Dastagir, F.B Area, Karachi, 75950.</span>
            <span>Contact: 03322673373 | precisionqualityserviceslabs@gmail.com</span>
          </div>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end relative">
        <div className="absolute top-0 right-full mr-4 flex flex-col items-center">
          <QRCode 
            value={verifyUrl} 
            size={50}
            level="M"
          />
          <span className="text-[8px] mt-1 text-gray-500 font-bold uppercase tracking-wider">Scan Me</span>
        </div>
        <div className="mb-4">
          <div className="text-2xl font-bold tracking-wider text-gray-800 border border-gray-800 px-4 py-1">
            REPORT
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="font-bold w-24 text-right whitespace-nowrap">Report #:</span>
          <span className="w-32 text-left border-b border-gray-400">{reportNo}</span>
        </div>
        <div className="flex gap-2 text-sm mt-1">
          <span className="font-bold w-24 text-right whitespace-nowrap">Report Date:</span>
          {onReportingDateChange ? (
            <label className="w-32 text-left border-b border-gray-400 relative cursor-pointer block">
              {reportingDate}
              <input 
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                value={convertDate(reportingDate)}
                onChange={(e) => onReportingDateChange(convertDate(e.target.value))}
              />
            </label>
          ) : (
            <span className="w-32 text-left border-b border-gray-400">{reportingDate}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const PASFooter = ({ pageNum, totalPages }: { pageNum: number, totalPages: number }) => (
  <div className="absolute bottom-10 left-0 w-full flex flex-col items-center">
    <div className="w-[80%] flex justify-between border-t border-gray-400 pt-3 text-xs text-gray-500">
      <span className="italic tracking-wide">This is a computer generated document and doesn&apos;t need a signature.</span>
      <span className="font-bold text-gray-700">Page {pageNum}/{totalPages}</span>
    </div>
  </div>
);

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const reportId = searchParams.get('report');

  const [formData, setFormData] = useState<ReportFormData>({
    ...DEFAULT_FORM_DATA,
    reportNo: String(Math.floor(100000 + Math.random() * 900000)),
  });

  const [tests, setTests] = useState<TestRow[]>([...DEFAULT_TESTS]);
  const [sampleImage, setSampleImage] = useState<string | null>(null);
  const [extraPages, setExtraPages] = useState<ExtraPage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Undo/Redo state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = React.useRef(false);

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [brandSettings, setBrandSettings] = useState({
    logoBase64: '',
    companyName: 'L.I.M.S'
  });

  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  useEffect(() => {
    // Hydrate report date on mount
    setFormData(prev => {
      const dynamicFields = prev.dynamicFields && prev.dynamicFields.length > 0 
        ? [...prev.dynamicFields] 
        : migrateToDynamicFields(prev);
      const index = dynamicFields.findIndex(f => f.id === 'f20');
      if (index !== -1 && !dynamicFields[index].value) {
        dynamicFields[index] = { ...dynamicFields[index], value: getTodayDate() };
      }
      return { ...prev, dynamicFields };
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('sr_brand_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBrandSettings(parsed);
        if (parsed.companyName) {
          document.title = parsed.companyName;
        }
      } catch {}
    }
  }, []);

  // Sync title when brand settings change
  useEffect(() => {
    if (brandSettings.companyName) {
      document.title = brandSettings.companyName;
    }
  }, [brandSettings.companyName]);

  const totalPages = (sampleImage ? 3 : 2) + extraPages.length;

  // Load template or existing report
  useEffect(() => {
    if (templateId) {
      const templateData = sessionStorage.getItem('sr_template_data');
      if (templateData) {
        try {
          const template: Template = JSON.parse(templateData);
          
          // Auto date logic
          const dynamicFields = template.formData.dynamicFields && template.formData.dynamicFields.length > 0 
            ? [...template.formData.dynamicFields] 
            : migrateToDynamicFields(template.formData);
          const index = dynamicFields.findIndex(f => f.id === 'f20');
          if (index !== -1 && !dynamicFields[index].value) {
            dynamicFields[index] = { ...dynamicFields[index], value: getTodayDate() };
          }

          // eslint-disable-next-line react-hooks/set-state-in-effect
          setFormData({
            ...template.formData,
            dynamicFields,
            reportNo: String(Math.floor(100000 + Math.random() * 900000)),
          });
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setTests(template.tests);
          sessionStorage.removeItem('sr_template_data');
        } catch (e: unknown) {
          console.error('Failed to load template:', e);
        }
      }
    } else if (reportId) {
      loadReport(reportId);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, [templateId, reportId]);

  // Capture history (debounced)
  useEffect(() => {
    if (!isLoaded) return;
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const stateStr = JSON.stringify({ formData, tests, extraPages });
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        if (newHistory.length > 0 && newHistory[newHistory.length - 1] === stateStr) return prev;
        newHistory.push(stateStr);
        if (newHistory.length > 50) newHistory.shift();
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [formData, tests, isLoaded, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const parsed = JSON.parse(history[newIndex]);
      setFormData(parsed.formData);
      setTests(parsed.tests);
      setExtraPages(parsed.extraPages || []);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const parsed = JSON.parse(history[newIndex]);
      setFormData(parsed.formData);
      setTests(parsed.tests);
      setExtraPages(parsed.extraPages || []);
    }
  };

  const loadReport = async (id: string) => {
    try {
      const { data } = await supabase
        .from('receipts')
        .select('data')
        .eq('id', id)
        .single();

      if (data?.data) {
        const reportData = data.data as any;
        setFormData(reportData.formData);
        setTests(reportData.tests);
        if (reportData.sampleImage) setSampleImage(reportData.sampleImage);
        if (reportData.extraPages) setExtraPages(reportData.extraPages);
      }
    } catch (e) {
      console.error('Failed to load report:', e);
    }
  };

  const handlePrint = async (password?: string, isSilent: boolean = false) => {
    if (!password && !isSilent) {
      toast.error("Please enter a password to lock the PDF.");
      return;
    }
    
    if (!isSilent) setIsGenerating(true);

    try {
      // 1. Try to save to DB (Handle RLS gracefully based on settings)
      // Force auto backup to always be enabled
      const autoBackup = true;
      if (autoBackup) {
        const { error } = await supabase
          .from('receipts')
          .upsert({
            id: formData.reportNo,
            password: password || '1234',
            data: { formData, tests, sampleImage, extraPages }
          });
          
        if (error) {
          console.error("Supabase Error:", error);
          if (!isSilent) {
            if (error.message.includes('row-level security')) {
              toast.error("Cloud Backup Failed: Row Level Security is enabled but no public policy exists. Please add a policy in Supabase or turn off Auto Backup in Settings.", { duration: 6000 });
            } else {
              toast.error("Database save failed: " + error.message);
            }
          }
        } else {
          if (!isSilent) toast.success("Saved securely to cloud.");
        }
      }

      // Wait a tick for isGenerating state to apply CSS class hiding handles
      await new Promise(r => setTimeout(r, 300));

      // 2. Generate Canvas screenshots
      const pages = document.querySelectorAll('.a4-page');
      const content = [];

      for (let i = 0; i < pages.length; i++) {
        // Dynamically import html2canvas to prevent blocking initial load
        const html2canvas = (await import('html2canvas-pro')).default;
        // Increased scale from 2 to 4 for ultra-high resolution PDF output
        const canvas = await html2canvas(pages[i] as HTMLElement, { scale: 4, useCORS: true });
        // Use PNG to prevent JPEG compression ringing artifacts around text and logos
        const imgData = canvas.toDataURL('image/png');
        content.push({
          image: imgData,
          width: 595.28,
          height: 841.89,
          margin: [0, 0, 0, 0]
        });
      }

      // 3. Build PDF
      const docDefinition = {
        pageSize: 'A4' as const,
        pageMargins: [0, 0, 0, 0] as [number, number, number, number],
        content: content,
        userPassword: password,
        ownerPassword: password,
        permissions: { printing: 'high', modifying: false, copying: false }
      };

      // Ensure pdfmake handles client side imports safely
      // @ts-ignore
      const pdfMakeModule = await import('pdfmake/build/pdfmake.js');
      // @ts-ignore
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts.js');
      
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;
      
      pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

      const pdfGenerator = pdfMake.createPdf(docDefinition);

      // Save using Tauri natively, or fallback to browser download
      const { saveSilentBackup } = await import('@/utils/exportManager');
      pdfGenerator.getBlob(async (blob: Blob) => {
        await saveSilentBackup(formData.reportNo, blob, isSilent);
        if (!isSilent) toast.success("PDF generated and secured successfully!");
      });
      
    } catch (err: any) {
      console.error(err);
      if (!isSilent) toast.error(`PDF generation failed: ${err.message || 'Unknown error'}`);
    } finally {
      if (!isSilent) setIsGenerating(false);
    }
  };

  const lastBackedUpDataRef = React.useRef<string>('');

  useEffect(() => {
    let syncInterval: any;
    if (isLoaded && typeof window !== 'undefined') {
       syncInterval = setInterval(() => {
          const currentData = JSON.stringify({ formData, tests, extraPages });
          if (currentData !== lastBackedUpDataRef.current && lastBackedUpDataRef.current !== '') {
             // Silent background auto-sync without UI interruption
             const password = localStorage.getItem('sr_settings') ? JSON.parse(localStorage.getItem('sr_settings')!).defaultPassword : '1234';
             handlePrint(password, true).then(() => {
               lastBackedUpDataRef.current = currentData;
             });
          } else if (lastBackedUpDataRef.current === '') {
             lastBackedUpDataRef.current = currentData;
          }
       }, 15000); // 15 seconds
    }
    return () => clearInterval(syncInterval);
  }, [isLoaded, formData, tests, extraPages]);

  const updateField = (field: keyof ReportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateDynamicField = (id: string, value: string) => {
    setFormData(prev => {
      const dynamicFields = prev.dynamicFields && prev.dynamicFields.length > 0 ? [...prev.dynamicFields] : migrateToDynamicFields(prev);
      const index = dynamicFields.findIndex(f => f.id === id);
      if (index !== -1) {
        dynamicFields[index] = { ...dynamicFields[index], value };
        return { ...prev, dynamicFields };
      }
      return prev;
    });
  };

  const renameDynamicField = (id: string, newLabel: string) => {
    setFormData(prev => {
      const dynamicFields = prev.dynamicFields && prev.dynamicFields.length > 0 ? [...prev.dynamicFields] : migrateToDynamicFields(prev);
      const index = dynamicFields.findIndex(f => f.id === id);
      if (index !== -1) {
        dynamicFields[index] = { ...dynamicFields[index], label: newLabel };
        return { ...prev, dynamicFields };
      }
      return prev;
    });
  };

  const addDynamicField = (label: string, value: string, bold: boolean = false) => {
    setFormData(prev => {
      const dynamicFields = prev.dynamicFields && prev.dynamicFields.length > 0 ? [...prev.dynamicFields] : migrateToDynamicFields(prev);
      dynamicFields.push({ id: `f_${Date.now()}`, label, value, bold });
      return { ...prev, dynamicFields };
    });
  };

  const removeDynamicField = (id: string) => {
    setFormData(prev => {
      const dynamicFields = prev.dynamicFields && prev.dynamicFields.length > 0 ? [...prev.dynamicFields] : migrateToDynamicFields(prev);
      return { ...prev, dynamicFields: dynamicFields.filter(f => f.id !== id) };
    });
  };

  const addTest = () => {
    setTests([...tests, { id: Date.now().toString(), test: '', method: '', value: '', unit: '', result: '' }]);
  };

  const updateTest = (id: string, field: keyof TestRow, value: string) => {
    setTests(tests.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTest = (id: string) => {
    setTests(tests.filter(t => t.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSampleImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTemplate = () => {
    const name = prompt('Enter a name for this template:');
    if (!name) return;

    const template: Template = {
      id: Date.now().toString(),
      name,
      formData: { ...formData, reportNo: '' },
      tests: [...tests],
      createdAt: new Date().toISOString(),
    };

    const existing = localStorage.getItem('sr_templates');
    const templates: Template[] = existing ? JSON.parse(existing) : [];
    templates.push(template);
    localStorage.setItem('sr_templates', JSON.stringify(templates));
    toast.success(`Template "${name}" saved!`);
  };

  const actualReportingDate = formData.dynamicFields?.find(f => f.id === 'f20')?.value || formData.sampleReportingDate || '';

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center bg-slate-200 text-gray-500">Initializing editor...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          brandSettings={brandSettings}
          setBrandSettings={setBrandSettings}
        />
      )}
      <ReportForm 
        formData={formData}
        updateField={updateField}
        updateDynamicField={updateDynamicField}
        renameDynamicField={renameDynamicField}
        addDynamicField={addDynamicField}
        removeDynamicField={removeDynamicField}
        tests={tests}
        addTest={addTest}
        updateTest={updateTest}
        removeTest={removeTest}
        sampleImage={sampleImage}
        handleImageUpload={handleImageUpload}
        removeImage={() => setSampleImage(null)}
        handlePrint={handlePrint}
        onSaveTemplate={handleSaveTemplate}
        onGoHome={() => router.push('/')}
        onOpenSettings={() => setShowSettings(true)}
        brandSettings={brandSettings}
        extraPages={extraPages}
        setExtraPages={setExtraPages}
      />

      <div className={`flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-4 md:gap-8 print:p-0 print:gap-0 print:overflow-visible items-center bg-gray-50 relative ${isGenerating ? 'is-generating-pdf' : ''}`}>
        
        {/* Floating Toolbar */}
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200 no-print items-center">
          <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-all text-slate-700" title="Undo">
            <Undo2 size={18} />
          </button>
          <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-all text-slate-700" title="Redo">
            <Redo2 size={18} />
          </button>
          <div className="w-6 h-px bg-slate-300 my-1 self-center" />
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-700" title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <span className="text-[10px] font-bold font-mono text-slate-500 self-center text-center leading-none">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-700" title="Zoom Out">
            <ZoomOut size={18} />
          </button>
        </div>

        <div 
        className="w-full max-w-[794px] origin-top md:transform-none print:scale-100 print:mb-0 flex flex-col gap-4 md:gap-8 items-center transition-transform"
          style={{ transform: `scale(${zoom})`, marginBottom: zoom < 1 ? `-${300 * (1 - zoom)}px` : '0' }}
        >
        
        {/* PAGE 1 */}
        <div className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300" style={{ width: '794px', height: '1123px' }}>
          <PASHeader reportNo={formData.reportNo} reportingDate={actualReportingDate} onReportingDateChange={(date) => updateDynamicField('f20', date)} />
          <div className="flex-1">
            <PageOneData data={formData} />
          </div>
          <PASFooter pageNum={1} totalPages={totalPages} />
        </div>

        {/* PAGE 2 */}
        <div className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300 mt-8" style={{ width: '794px', height: '1123px' }}>
          <PASHeader reportNo={formData.reportNo} reportingDate={actualReportingDate} onReportingDateChange={(date) => updateDynamicField('f20', date)} />
          <div className="flex-1 px-10">
            <TestTable tests={tests} data={formData} />
          </div>
          <PASFooter pageNum={2} totalPages={totalPages} />
        </div>

        {/* PAGE 3 - Sample Image */}
        {sampleImage && (
          <div className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300 mt-8" style={{ width: '794px', height: '1123px' }}>
            <PASHeader reportNo={formData.reportNo} reportingDate={actualReportingDate} onReportingDateChange={(date) => updateDynamicField('f20', date)} />
            <div className="flex-1 flex justify-center items-start px-10">
              <CanvaImage 
                src={sampleImage} 
                defaultWidth={400} 
                defaultHeight={400} 
                className="border border-gray-200 shadow-sm bg-white p-2"
              />
            </div>
            <PASFooter pageNum={3} totalPages={totalPages} />
          </div>
        )}

        {/* Extra Pages */}
        {extraPages.map((page, index) => {
          const pageNum = (sampleImage ? 4 : 3) + index;
          return (
            <div key={page.id} className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300 mt-8" style={{ width: '794px', height: '1123px' }}>
              <PASHeader reportNo={formData.reportNo} reportingDate={actualReportingDate} onReportingDateChange={(date) => updateDynamicField('f20', date)} />
              <div className="flex-1 flex flex-col px-10 relative">
                {page.image && (
                  <div className="flex-1 flex justify-center items-start mb-4">
                    <CanvaImage 
                      src={page.image}
                      className="max-w-full max-h-[850px] object-contain"
                    />
                  </div>
                )}
                {page.text && (
                  <div className="whitespace-pre-wrap font-sans text-sm pb-10">
                    {page.text}
                  </div>
                )}
              </div>
              <PASFooter pageNum={pageNum} totalPages={totalPages} />
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-200 text-gray-500">Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
