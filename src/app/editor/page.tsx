"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SettingsModal from '@/components/SettingsModal';
import ReportForm from '@/components/form/ReportForm';
import SubHeader from '@/components/report/SubHeader';
import PageOneData from '@/components/report/PageOneData';
import TestTable from '@/components/report/TestTable';
import Signature from '@/components/report/Signature';
import CanvaImage from '@/components/report/CanvaImage';
import { ReportFormData, TestRow, Template, DEFAULT_FORM_DATA, DEFAULT_TESTS, AppSettings, DEFAULT_SETTINGS } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [brandSettings, setBrandSettings] = useState({
    logoBase64: '',
    companyName: 'S.R. LABORATORIES'
  });

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

  const totalPages = sampleImage ? 3 : 2;

  // Load template or existing report
  useEffect(() => {
    if (templateId) {
      const templateData = sessionStorage.getItem('sr_template_data');
      if (templateData) {
        try {
          const template: Template = JSON.parse(templateData);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setFormData({
            ...template.formData,
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
      const savedSettings = localStorage.getItem('sr_settings');
      let autoBackup = true;
      if (savedSettings) {
        try {
          autoBackup = JSON.parse(savedSettings).autoBackup;
        } catch(e){}
      }

      if (autoBackup) {
        const { error } = await supabase
          .from('receipts')
          .upsert({
            id: formData.reportNo,
            password: password || '1234',
            data: { formData, tests, sampleImage }
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
        await saveSilentBackup(formData.reportNo, blob);
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
          const currentData = JSON.stringify({ formData, tests });
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
  }, [isLoaded, formData, tests]);

  const updateField = (field: keyof ReportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateDynamicField = (id: string, value: string) => {
    setFormData(prev => {
      const dynamicFields = prev.dynamicFields ? [...prev.dynamicFields] : [];
      const index = dynamicFields.findIndex(f => f.id === id);
      if (index !== -1) {
        dynamicFields[index] = { ...dynamicFields[index], value };
      }
      return { ...prev, dynamicFields };
    });
  };

  const addDynamicField = (label: string, value: string, bold: boolean = false) => {
    setFormData(prev => {
      const dynamicFields = prev.dynamicFields ? [...prev.dynamicFields] : [];
      dynamicFields.push({ id: `f_${Date.now()}`, label, value, bold });
      return { ...prev, dynamicFields };
    });
  };

  const removeDynamicField = (id: string) => {
    setFormData(prev => {
      if (!prev.dynamicFields) return prev;
      return { ...prev, dynamicFields: prev.dynamicFields.filter(f => f.id !== id) };
    });
  };

  const addTest = () => {
    setTests([...tests, { id: Date.now().toString(), test: 'New Test', unit: '-', standard: '-', result: '-' }]);
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
      />

      <div className={`flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-4 md:gap-8 print:p-0 print:gap-0 print:overflow-visible items-center ${isGenerating ? 'is-generating-pdf' : ''}`}>
        
        <div className="w-full max-w-[794px] origin-top md:transform-none scale-[0.6] sm:scale-[0.8] md:scale-100 mb-[-300px] md:mb-0 print:scale-100 print:mb-0 flex flex-col gap-4 md:gap-8 items-center">
        
        {/* PAGE 1 */}
        <div className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0">
          <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" style={{ imageRendering: '-webkit-optimize-contrast', filter: 'contrast(1.02)' }} />
          <div className="relative z-10 w-full h-full flex flex-col">
            <SubHeader reportNo={formData.reportNo} pageNum={1} totalPages={totalPages} />
            <div className="pt-[175px]">
              <PageOneData data={formData} />
            </div>
            <div className="flex-1"></div>
            <div className="pb-[55px] relative">
              <Signature />
              <div className="absolute bottom-2 left-0 w-full text-center text-[8px] text-gray-400 font-sans tracking-wide">
                This document was generated digitally and doesn't require a signature
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2 */}
        <div className="a4-page relative overflow-hidden flex flex-col bg-white">
          <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" style={{ imageRendering: '-webkit-optimize-contrast', filter: 'contrast(1.02)' }} />
          <div className="relative z-10 w-full h-full flex flex-col">
            <SubHeader reportNo={formData.reportNo} pageNum={2} totalPages={totalPages} />
            <div className="pt-[175px] flex-1 flex flex-col">
              <TestTable tests={tests} data={formData} />
              <div className="flex-1"></div>
              <div className="pb-[55px] relative">
                <Signature />
                <div className="absolute bottom-2 left-0 w-full text-center text-[8px] text-gray-400 font-sans tracking-wide">
                  This document was generated digitally and doesn&apos;t require a signature
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 3 - Sample Image */}
        {sampleImage && (
          <div className="a4-page relative overflow-hidden flex flex-col bg-white">
            <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" style={{ imageRendering: '-webkit-optimize-contrast', filter: 'contrast(1.02)' }} />
            <div className="relative z-10 w-full h-full flex flex-col">
              <SubHeader reportNo={formData.reportNo} pageNum={3} totalPages={totalPages} />
              <div className="pt-[175px] flex-1 flex justify-center items-start px-10 relative">
                <CanvaImage 
                  src={sampleImage} 
                  defaultWidth={400} 
                  defaultHeight={400} 
                  className="border border-gray-200 shadow-sm bg-white p-2"
                />
              </div>
              <div className="pb-[55px] relative">
                <Signature />
                <div className="absolute bottom-2 left-0 w-full text-center text-[8px] text-gray-400 font-sans tracking-wide">
                  This document was generated digitally and doesn&apos;t require a signature
                </div>
              </div>
            </div>
          </div>
        )}
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
