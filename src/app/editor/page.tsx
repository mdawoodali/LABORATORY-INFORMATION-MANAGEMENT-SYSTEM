"use client";
/* eslint-disable */
import MobileDocumentViewport from '@/components/MobileDocumentViewport';

const EndOfReportMarker = () => (
  <div className="w-full flex items-center mt-6 px-10 mb-4">
    <div className="flex-1 border-b-[1.5px] border-black mr-4"></div>
    <div className="font-bold whitespace-nowrap text-[#002f6c]" style={{ fontSize: '14px', fontFamily: 'sans-serif' }}>End of Report</div>
  </div>
);


import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SettingsModal from '@/components/SettingsModal';
import ReportForm from '@/components/form/ReportForm';
import Header from '@/components/report/Header';
import SubHeader from '@/components/report/SubHeader';
import PageOneData from '@/components/report/PageOneData';
import TestTable from '@/components/report/TestTable';
import Signature from '@/components/report/Signature';
import CanvaImage from '@/components/report/CanvaImage';
import { ReportFormData, TestRow, Template, DEFAULT_FORM_DATA, DEFAULT_TESTS, AppSettings, DEFAULT_SETTINGS, migrateToDynamicFields, ExtraPage, is7ColumnReport } from '@/types';
import { supabase } from '@/lib/supabase';
import { extractAndSaveOptions } from '@/lib/sync';
import { toast } from 'react-hot-toast';
import { Undo2, Redo2, ZoomIn, ZoomOut } from 'lucide-react';
import UnsavedModal, { UnsavedAction } from '@/components/UnsavedModal';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const reportId = searchParams.get('report') || searchParams.get('id');

  const [formData, setFormData] = useState<ReportFormData>(() => ({
    ...DEFAULT_FORM_DATA,
    reportNo: String(Math.floor(100000 + Math.random() * 900000)),
  }));

  const [tests, setTests] = useState<TestRow[]>([...DEFAULT_TESTS]);
  const [sampleImages, setSampleImages] = useState<{id: string, src: string, name?: string}[]>([]);
  const [extraPages, setExtraPages] = useState<ExtraPage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [password, setPassword] = useState('');
  const initialStateRef = useRef<string>('');
  const allowNavigationRef = useRef(false);
  
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false);
  const [unsavedAction, setUnsavedAction] = useState<UnsavedAction>(null);

  const isDirty = () => {
    if (allowNavigationRef.current) return false;
    if (!isLoaded) return false;

    if (initialStateRef.current) {
      const currentStr = JSON.stringify({ formData, tests, sampleImages, extraPages });
      if (currentStr === initialStateRef.current) return false;
    }

    if (!reportId && !templateId) {
      const isFormModified = Boolean((formData as any).customerName?.trim() || (formData as any).sampleName?.trim());
      const hasTests = tests.some(t => Boolean((t as any).parameter?.trim() || t.result?.trim()));
      const hasImages = sampleImages.length > 0;
      const hasExtraPages = extraPages.length > 0;
      if (!isFormModified && !hasTests && !hasImages && !hasExtraPages) return false;
    }

    return true;
  };

  const isPageEmpty = () => !isDirty();

  useEffect(() => {
    let unlisten: () => void;
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      import('@tauri-apps/api/window').then((module) => {
        const appWindow = module.getCurrentWindow ? module.getCurrentWindow() : (module as any).appWindow;
        if (appWindow && appWindow.onCloseRequested) {
            appWindow.onCloseRequested((event: any) => {
              if (allowNavigationRef.current) return;
              if (isDirty()) {
                event.preventDefault();
                setUnsavedAction('CLOSE');
                setUnsavedModalOpen(true);
              }
            }).then((unl: any) => { unlisten = unl; });
        }
      });
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allowNavigationRef.current) return;
      if (isDirty()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (unlisten) unlisten();
    };
  }, [formData, tests, sampleImages, extraPages, reportId, templateId, isLoaded]);

  const handleSilentSave = async (filename: string) => {
    setIsGenerating(true);
    try {
      const targetId = formData.reportNo || filename;
      const isDefaultPassword = reportId && password === reportId.slice(-4);
      const reportPassword = (!password || isDefaultPassword) ? (targetId?.slice(-4) || '1234') : password;
      
      extractAndSaveOptions(formData, 'report');
      try {
        const { error: sbErr } = await supabase.from('receipts').upsert({
          id: targetId,
          password: reportPassword,
          data: { formData, tests, sampleImages, extraPages }
        });
        if (sbErr) console.warn("Supabase upsert warning:", sbErr);
      } catch (cloudErr) {
        console.warn("Cloud connection unavailable, saving locally:", cloudErr);
      }

      try {
        const pageElements = document.querySelectorAll('.report-a4-page');
        const { createDocumentPdf } = await import('@/utils/pdfGenerator');
        const { blob: pdfBlob } = await createDocumentPdf({
          pages: pageElements,
          filename: targetId,
          password: reportPassword,
          type: 'report'
        });

        if (typeof window !== 'undefined' && (window as any).__TAURI__) {
          const { saveSilentBackup } = await import('@/utils/exportManager');
          await saveSilentBackup(targetId, pdfBlob, true, 'report');
        }
      } catch (pdfErr) {
        console.warn("Silent PDF backup error:", pdfErr);
      }

      toast.success("Progress saved successfully!");
      
      allowNavigationRef.current = true;
      setUnsavedModalOpen(false);
      
      if (unsavedAction === 'BACK' || !unsavedAction) {
        router.push('/');
      } else if (unsavedAction === 'CLOSE') {
        if ((window as any).__TAURI__) {
          import('@tauri-apps/api/window').then((m) => {
            const w = m.getCurrentWindow ? m.getCurrentWindow() : (m as any).appWindow;
            if (w && w.destroy) w.destroy();
            else import('@tauri-apps/plugin-process').then(p => p.exit(0)).catch(() => {});
          }).catch(() => {
            import('@tauri-apps/plugin-process').then(p => p.exit(0)).catch(() => {});
          });
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save progress. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUnsavedDontSave = async () => {
      allowNavigationRef.current = true;
      setUnsavedModalOpen(false);
      if (unsavedAction === 'BACK') {
        router.push('/');
      } else if (unsavedAction === 'CLOSE') {
        if (typeof window !== 'undefined' && (window as any).__TAURI__) {
          import('@tauri-apps/api/window').then((m) => {
            const w = m.getCurrentWindow ? m.getCurrentWindow() : (m as any).appWindow;
            if (w && w.destroy) w.destroy();
            else import('@tauri-apps/plugin-process').then(p => p.exit(0)).catch(() => {});
          }).catch(() => {
            import('@tauri-apps/plugin-process').then(p => p.exit(0)).catch(() => {});
          });
        }
      }
  };

  useEffect(() => {
    const handleGlobalHotkeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSilentSave(formData.reportNo || 'Untitled');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint(password);
        return;
      }
    };
    window.addEventListener('keydown', handleGlobalHotkeys);
    return () => window.removeEventListener('keydown', handleGlobalHotkeys);
  }, [formData, password]);
  
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

  const loadReport = async (id: string) => {
    try {
      const { data } = await supabase
        .from('receipts')
        .select('data')
        .eq('id', id)
        .single();

      if (data?.data) {
        const reportData = data.data as Record<string, unknown>;
        const loadedForm = (reportData.formData || {}) as any;
        const loadedTests = (reportData.tests || []) as any[];
        let loadedImages: any[] = [];
        if (reportData.sampleImages) {
          loadedImages = reportData.sampleImages as any[];
        } else if (reportData.sampleImage) {
          loadedImages = [{ id: '1', src: reportData.sampleImage as string }];
        }
        const loadedExtra = (reportData.extraPages || []) as any[];
        setFormData(loadedForm);  
        setTests(loadedTests);  
        setSampleImages(loadedImages);
        setExtraPages(loadedExtra);
        initialStateRef.current = JSON.stringify({
          formData: loadedForm,
          tests: loadedTests,
          sampleImages: loadedImages,
          extraPages: loadedExtra
        });
      }
    } catch (e) {
      console.error('Failed to load report:', e);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('sr_brand_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
         
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

  
  // Chunk tests for pagination
  const testChunks = [];
  const testsCopy = [...tests];
  if (testsCopy.length > 7) {
    testChunks.push(testsCopy.splice(0, 7)); // First page: 7 rows
    while (testsCopy.length > 0) {
      testChunks.push(testsCopy.splice(0, 10)); // Subsequent pages: 10 rows
    }
  } else {
    testChunks.push(testsCopy);
  }

  const totalPages = 1 + testChunks.length + (sampleImages.length > 0 ? 1 : 0) + extraPages.length;


  // Load template or existing report
  useEffect(() => {
    if (templateId) {
      const templateData = sessionStorage.getItem('sr_template_data');
      if (templateData) {
        try {
          const template: Template = JSON.parse(templateData);
          const newFormData = {
            ...template.formData,
            reportNo: String(Math.floor(100000 + Math.random() * 900000)),
          };
          setFormData(newFormData);
          setTests(template.tests);
          sessionStorage.removeItem('sr_template_data');
          initialStateRef.current = JSON.stringify({
            formData: newFormData,
            tests: template.tests,
            sampleImages: [],
            extraPages: []
          });
        } catch (e: unknown) {
          console.error('Failed to load template:', e);
        }
      }
    } else if (reportId) {
      loadReport(reportId);
    } else {
      initialStateRef.current = JSON.stringify({
        formData,
        tests: [...DEFAULT_TESTS],
        sampleImages: [],
        extraPages: []
      });
    }
     
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
      setFormData(parsed.formData as any);  
      setTests(parsed.tests as any[]);  
      setExtraPages(parsed.extraPages as any[]);  
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const parsed = JSON.parse(history[newIndex]);
      setFormData(parsed.formData as any);  
      setTests(parsed.tests as any[]);  
      setExtraPages(parsed.extraPages as any[]);  
    }
  };

  const handlePrint = async (password?: string, isSilent: boolean = false) => {
    const isDefaultPassword = reportId && password === reportId.slice(-4);
    const effectivePassword = (!password || isDefaultPassword) ? (formData.reportNo?.slice(-4) || '1234') : password;
    
    if (!effectivePassword && !isSilent) {
      toast.error("Please enter a password to lock the PDF.");
      return;
    }
    
    if (!isSilent) setIsGenerating(true);

    try {
      // 1. Try to save to DB (Handle RLS gracefully based on settings)
      // Force auto backup to always be enabled
      const autoBackup = true;
      if (autoBackup) {
        extractAndSaveOptions(formData, 'report');
          supabase.from('receipts').upsert({
            id: formData.reportNo,
            password: effectivePassword,
            data: { formData, tests, sampleImages, extraPages }
          }).then(({error}) => { if (error) console.error("Supabase Error:", error); });
          
        
      }

      // Wait a tick for isGenerating state to apply CSS class hiding handles
      await new Promise(r => setTimeout(r, 300));

      const pages = document.querySelectorAll('.report-a4-page');
      const { createDocumentPdf } = await import('@/utils/pdfGenerator');
      const { pdf, blob } = await createDocumentPdf({
        pages,
        filename: formData.reportNo,
        password: effectivePassword,
        type: 'report'
      });

      // Save using Tauri natively, or fallback to browser download
      const { saveSilentBackup } = await import('@/utils/exportManager');
      await saveSilentBackup(formData.reportNo, blob, isSilent, 'report');
      
      if (!isSilent) {
        setIsGenerating(false);
      }
    } catch (err: unknown) {
      console.error(err);
      if (!isSilent) toast.error(`PDF generation failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      if (!isSilent) setIsGenerating(false);
    }
  };

  const lastBackedUpDataRef = React.useRef<string>('');

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    
    const currentData = JSON.stringify({ formData, tests, extraPages });
    
    // Set initial baseline so we don't save immediately on load
    if (lastBackedUpDataRef.current === '') {
      lastBackedUpDataRef.current = currentData;
      return;
    }

    if (currentData === lastBackedUpDataRef.current) return;

    // Debounce auto-save by 3 seconds of inactivity
    const timer = setTimeout(async () => {
      try {
        const isDefaultPassword = reportId && password === reportId.slice(-4);
        const reportPassword = (!password || isDefaultPassword) ? (formData.reportNo?.slice(-4) || '1234') : password;
          
        supabase.from('receipts').upsert({
            id: formData.reportNo,
            password: reportPassword,
            data: { formData, tests, sampleImages, extraPages }
          }).then(({error}) => { if (error) console.error("Supabase Error:", error); });
          
        lastBackedUpDataRef.current = currentData;
      } catch (e) {
        // silent fail for auto-save
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoaded, formData, tests, extraPages, sampleImages]);

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
    const is7Col = is7ColumnReport(formData, tests);
    setTests([
      ...tests,
      {
        id: Date.now().toString(),
        test: '',
        method: '',
        value: '',
        unit: '',
        ...(is7Col ? { criteria: '', criteriaUnit: '' } : {}),
        result: ''
      }
    ]);
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
        setSampleImages(prev => [...prev, { id: Date.now().toString() + Math.random(), src: reader.result as string, name: file.name }]);
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
      <UnsavedModal 
        isOpen={unsavedModalOpen}
        action={unsavedAction}
        defaultFilename="Untitled Report"
        onCancel={() => setUnsavedModalOpen(false)}
        onDontSave={handleUnsavedDontSave}
        onSave={handleSilentSave}
      />
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
        sampleImages={sampleImages}
        handleImageUpload={handleImageUpload}
        removeImage={(id) => setSampleImages(prev => prev.filter(img => img.id !== id))}
        handlePrint={handlePrint}
        onSaveTemplate={handleSaveTemplate}
        onGoHome={() => {
            if (isDirty()) {
              setUnsavedAction('BACK');
              setUnsavedModalOpen(true);
            } else {
              allowNavigationRef.current = true;
              router.push('/');
            }
          }}
        onOpenSettings={() => setShowSettings(true)}
        brandSettings={brandSettings}
        extraPages={extraPages}
        setExtraPages={setExtraPages}
        password={password}
        setPassword={setPassword}
      />

      <div className={`flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-4 md:gap-8 print:p-0 print:gap-0 print:overflow-visible items-center bg-gray-50 relative ${isGenerating ? 'is-generating-pdf' : ''}`}>
        
        {/* Floating Toolbar */}
        <div className="hidden md:flex fixed top-4 right-4 md:top-6 md:right-6 z-50 flex-col gap-2 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200 no-print items-center">
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

        <MobileDocumentViewport pageCount={totalPages} onScaleChange={setZoom}>
        
        {/* PAGE 1 */}
        <div className="report-a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0">
          
          <div className="relative z-10 w-full h-full flex flex-col">
            <SubHeader reportNo={formData.reportNo} pageNum={1} totalPages={totalPages} />
            <div className="pt-[175px]">
              <PageOneData data={formData} />
            </div>
            <div className="flex-1"></div>
            <div className="pb-[55px] relative">
              <Signature companyName={brandSettings.companyName} />
              <div className="absolute bottom-2 left-0 w-full text-center text-[8px] text-gray-400 font-sans tracking-wide">
                This document was generated digitally and doesn&apos;t require a signature
              </div>
            </div>
          </div>
        </div>

        {/* TEST PAGES (dynamically paginated) */}
        {testChunks.map((chunk, chunkIdx) => (
          <div key={`test-page-${chunkIdx}`} className="report-a4-page relative overflow-hidden flex flex-col bg-white">
            
            <div className="relative z-10 w-full h-full flex flex-col">
              <SubHeader reportNo={formData.reportNo} pageNum={2 + chunkIdx} totalPages={totalPages} />
              <div className="pt-[175px] flex-1 flex flex-col">
                <TestTable 
                  tests={chunk} 
                  data={formData} 
                  isFirstPage={chunkIdx === 0}
                  isLastPage={chunkIdx === testChunks.length - 1}
                />
                  
                  <div className="flex-1"></div>
                <div className="pb-[55px] relative">
                  {chunkIdx === testChunks.length - 1 && (
                    <Signature companyName={brandSettings.companyName} />
                  )}
                  <div className="absolute bottom-2 left-0 w-full text-center text-[8px] text-gray-400 font-sans tracking-wide">
                    This document was generated digitally and doesn&apos;t require a signature
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* PAGE 3 - Sample Image */}
        {sampleImages.length > 0 && (
          <div className="report-a4-page relative overflow-hidden flex flex-col bg-white">
            
            <div className="relative z-10 w-full h-full flex flex-col">
            <SubHeader reportNo={formData.reportNo} pageNum={1 + testChunks.length + 1} totalPages={totalPages} />
              <div className="pt-[175px] flex-1 flex flex-col px-10 relative">
                  <div className="flex-1 w-full relative">
                        {sampleImages.map(img => (
                          <CanvaImage 
                            key={img.id}
                            src={img.src}
                            caption={sampleImages.length > 1 ? `Product Picture #${sampleImages.indexOf(img) + 1}` : 'Product Picture'} 
                            defaultWidth={400} 
                            defaultHeight={400} 
                            className="border border-gray-200 shadow-sm bg-white p-2 absolute" 
                          />
                        ))}
                      </div>
                  
                </div>
                <div className="pb-[55px] relative">
                <Signature companyName={brandSettings.companyName} />
                <div className="absolute bottom-2 left-0 w-full text-center text-[8px] text-gray-400 font-sans tracking-wide">
                  This document was generated digitally and doesn&apos;t require a signature
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extra Pages */}
        {extraPages.map((page, index) => {
          const pageNum = 1 + testChunks.length + (sampleImages.length > 0 ? 1 : 0) + 1 + index;
          return (
            <div key={page.id} className="report-a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 mt-8" style={{ width: '794px', height: '1123px' }}>
              
              <div className="relative z-10 w-full h-full flex flex-col">
                <SubHeader reportNo={formData.reportNo} pageNum={pageNum} totalPages={totalPages} />
                <div className="pt-[175px] flex-1 flex flex-col px-10 relative">
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
                <div className="pb-[55px] relative">
                  <Signature companyName={brandSettings.companyName} />
                  <div className="absolute bottom-2 left-0 w-full text-center text-[8px] text-gray-400 font-sans tracking-wide">
                    This document was generated digitally and doesn&apos;t require a signature
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </MobileDocumentViewport>
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
