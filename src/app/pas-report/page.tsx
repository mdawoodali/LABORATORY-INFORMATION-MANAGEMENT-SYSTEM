/* eslint-disable */
"use client";

const EndOfReportMarker = () => (
  <div className="w-full flex items-center mt-6 px-10 mb-4">
    <div className="flex-1 border-b-[2px] border-black mr-4"></div>
    <div className="font-bold whitespace-nowrap text-[#002f6c]" style={{ fontSize: '14px', fontFamily: 'sans-serif' }}>End of Report</div>
  </div>
);


import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SettingsModal from '@/components/SettingsModal';
import ReportForm from '@/components/form/ReportForm';
import ReportDocumentView from '@/components/report/ReportDocumentView';
import { ReportFormData, TestRow, Template, DEFAULT_FORM_DATA, DEFAULT_TESTS, AppSettings, DEFAULT_SETTINGS, migrateToDynamicFields, ExtraPage, is7ColumnReport } from '@/types';
import { supabase } from '@/lib/supabase';
import { extractAndSaveOptions } from '@/lib/sync';
import UnsavedModal, { UnsavedAction } from '@/components/UnsavedModal';
import { toast } from 'react-hot-toast';
import { Undo2, Redo2, ZoomIn, ZoomOut, Printer } from 'lucide-react';
import { generateDocumentSeal } from '@/utils/cryptoSeal';
import MobileDocumentViewport from '@/components/MobileDocumentViewport';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const reportId = searchParams.get('report') || searchParams.get('id');

  const [formData, setFormData] = useState<ReportFormData>(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const todayDate = `${dd}-${mm}-${yyyy}`;

    const dynamicFields = DEFAULT_FORM_DATA.dynamicFields && DEFAULT_FORM_DATA.dynamicFields.length > 0 
      ? [...DEFAULT_FORM_DATA.dynamicFields] 
      : migrateToDynamicFields(DEFAULT_FORM_DATA);
      
    const index = dynamicFields.findIndex(f => f.id === 'f20');
    if (index !== -1 && !dynamicFields[index].value) {
      dynamicFields[index] = { ...dynamicFields[index], value: todayDate };
    }

    return {
      ...DEFAULT_FORM_DATA,
      reportNo: String(Math.floor(100000 + Math.random() * 900000)),
      dynamicFields
    };
  });

  const [tests, setTests] = useState<TestRow[]>([...DEFAULT_TESTS]);
  const [sampleImages, setSampleImages] = useState<{id: string, src: string, name?: string}[]>([]);
  const [extraPages, setExtraPages] = useState<ExtraPage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [password, setPassword] = useState('');
  const initialStateRef = useRef<string>('');
  const allowNavigationRef = useRef(false);
  
  // Undo/Redo state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = React.useRef(false);

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileStep, setMobileStep] = useState<1 | 2>(1);
  const [seal, setSeal] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    generateDocumentSeal(formData.reportNo || '', formData.reportDate || '', tests || []).then(code => {
      if (isMounted) setSeal(code);
    });
    return () => { isMounted = false; };
  }, [formData.reportNo, formData.reportDate, tests]);

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


  const loadReport = async (id: string) => {
    try {
      const { data } = await supabase
        .from('receipts')
        .select('data, password')
        .eq('id', id)
        .single();

      if (data?.data) {
        const reportData = data.data as Record<string, unknown>;
        const loadedForm = (reportData.formData || {}) as ReportFormData;
        const loadedTests = (reportData.tests || []) as TestRow[];
        let loadedImages: any[] = [];
        if (reportData.sampleImages) {
          loadedImages = reportData.sampleImages as any[];
        } else if (reportData.sampleImage) {
          loadedImages = [{ id: '1', src: reportData.sampleImage as string }];
        }
        const loadedExtra = (reportData.extraPages || []) as ExtraPage[];
        if (reportData.formData) setFormData(loadedForm);
        if (reportData.tests) setTests(loadedTests);
        setSampleImages(loadedImages);
        if (reportData.extraPages) setExtraPages(loadedExtra);
        initialStateRef.current = JSON.stringify({
          formData: loadedForm,
          tests: loadedTests,
          sampleImages: loadedImages,
          extraPages: loadedExtra
        });
      }
      if (data?.password) {
        setPassword(data.password);
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

  const ROWS_PER_PAGE = 8;
  const testPagesCount = Math.max(1, Math.ceil(tests.length / ROWS_PER_PAGE));
  const testChunks = [];
  for (let i = 0; i < tests.length; i += ROWS_PER_PAGE) {
    testChunks.push(tests.slice(i, i + ROWS_PER_PAGE));
  }
  if (testChunks.length === 0) testChunks.push([]);
  const totalPages = 1 + testPagesCount + (sampleImages.length > 0 ? 1 : 0) + extraPages.length;

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

           
          setFormData({
            ...template.formData,
            dynamicFields,
            reportNo: String(Math.floor(100000 + Math.random() * 900000)),
          });
           
          setTests(template.tests);
          sessionStorage.removeItem('sr_template_data');
          initialStateRef.current = JSON.stringify({ formData: { ...template.formData, dynamicFields, reportNo: String(Math.floor(100000 + Math.random() * 900000)) }, tests: template.tests, sampleImages: [], extraPages: [] });
        } catch (e: unknown) {
          console.error('Failed to load template:', e);
        }
      }
    } else if (reportId) {
      loadReport(reportId);
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

  const handlePrint = async (password?: string, isSilent: boolean = false) => {
    const isDefaultPassword = reportId && password === reportId.slice(-4);
    const effectivePassword = (!password || isDefaultPassword) ? (formData.reportNo?.slice(-4) || '1234') : password;
    
    if (!effectivePassword && !isSilent) {
      toast.error("Please enter a password to lock the PDF.");
      return;
    }

    if (!isSilent) {
      // Bulletproof Auto-Save of all Dropdown options!
      const forceSaveOption = (key: string, val: string | undefined) => {
        if (!val || !val.toString().trim()) return;
        const storageKey = `sr_options_${key.trim().toLowerCase()}`;
        let options: string[] = [];
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) options = JSON.parse(saved);
        } catch (e) {}
        const trimmed = val.toString().trim();
        if (!options.includes(trimmed)) {
          localStorage.setItem(storageKey, JSON.stringify([trimmed, ...options]));
        }
      };

      formData.dynamicFields?.forEach(f => {
        forceSaveOption(f.label, f.value);
      });
      forceSaveOption('tableHeader1', formData.tableHeader1);
      forceSaveOption('tableHeader2', formData.tableHeader2);
      forceSaveOption('tableHeader3', formData.tableHeader3);
      forceSaveOption('tableHeader4', formData.tableHeader4);
      forceSaveOption('tableHeader5', formData.tableHeader5);
      if (formData.tableHeader6) forceSaveOption('tableHeader6', formData.tableHeader6);
      if (formData.tableHeader7) forceSaveOption('tableHeader7', formData.tableHeader7);
      forceSaveOption('footerText', formData.footerText);

      tests.forEach(test => {
        forceSaveOption('testName', test.test);
        forceSaveOption('testMethod', test.method);
        forceSaveOption('testValue', test.value);
        forceSaveOption('testUnit', test.unit);
        if (test.criteria) forceSaveOption('testCriteria', test.criteria);
        if (test.criteriaUnit) forceSaveOption('testCriteriaUnit', test.criteriaUnit);
        forceSaveOption('testResult', test.result);
      });
    }
    
    if (!isSilent) setIsGenerating(true);

    try {
      // 1. Try to save to DB (Handle RLS gracefully based on settings)
      // Force auto backup to always be enabled
      const autoBackup = true;
      if (autoBackup && formData.reportNo) {
        extractAndSaveOptions(formData, 'report');
          if (formData.reportNo) supabase.from('receipts').upsert({
            id: formData.reportNo,
            password: effectivePassword,
            data: { formData, tests, sampleImages, extraPages }
          }).then(({error}) => { if (error) console.error("Supabase Error:", error); });
          
        
      }

      // Wait a tick for isGenerating state to apply CSS class hiding handles
      await new Promise(r => setTimeout(r, 300));

      // Force-hide react-rnd resize handles and ring borders before capture
      const hiddenElements: {el: HTMLElement, prev: string}[] = [];
      document.querySelectorAll('[class*="react-resizable-handle"], .react-draggable > div > div:first-child + div, .toolbar-hide').forEach(el => {
        const htmlEl = el as HTMLElement;
        hiddenElements.push({ el: htmlEl, prev: htmlEl.style.display });
        htmlEl.style.display = 'none';
      });
      // Hide the blue ring-2 border on hovered canva images
      const ringElements: {el: HTMLElement, prev: string}[] = [];
      document.querySelectorAll('.ring-2, .ring-blue-500').forEach(el => {
        const htmlEl = el as HTMLElement;
        ringElements.push({ el: htmlEl, prev: htmlEl.style.boxShadow });
        htmlEl.style.boxShadow = 'none';
      });
      // Hide ALL resize handle dots (they are small divs with inline width:12px, height:12px, border-radius:50%)
      const handleDots: {el: HTMLElement, prev: string}[] = [];
      document.querySelectorAll('.canva-wrapper div[style]').forEach(el => {
        const htmlEl = el as HTMLElement;
        const style = htmlEl.getAttribute('style') || '';
        if (style.includes('border-radius') && style.includes('12px')) {
          handleDots.push({ el: htmlEl, prev: htmlEl.style.display });
          htmlEl.style.display = 'none';
        }
      });

      try {
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
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 5000);
          setIsGenerating(false);
        }
      } finally {
        // Restore hidden elements AFTER capture completes
        hiddenElements.forEach(({ el, prev }) => { el.style.display = prev; });
        ringElements.forEach(({ el, prev }) => { el.style.boxShadow = prev; });
        handleDots.forEach(({ el, prev }) => { el.style.display = prev; });
      }
      } catch (err: unknown) {
        console.error(err);
        if (!isSilent) {
          const msg = err instanceof Error ? err.message : String(err);
          toast.error(`PDF generation failed: ${msg}`);
          setIsGenerating(false);
        }
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
        // Use explicitly set password, or default to last 4 digits of report number
        const isDefaultPassword = reportId && password === reportId.slice(-4);
        const reportPassword = (!password || isDefaultPassword) ? (formData.reportNo?.slice(-4) || '1234') : password;
          
        if (formData.reportNo) supabase.from('receipts').upsert({
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
  }, [isLoaded, formData, tests, extraPages, sampleImages, password]);

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
      const isFormModified = Boolean(formData.applicant?.trim());
      const hasTests = tests.some(t => Boolean(t.test?.trim() || t.method?.trim() || t.result?.trim()));
      if (!isFormModified && !hasTests) return false;
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
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (unlisten) unlisten();
    };
  }, [formData, tests, sampleImages, extraPages, isLoaded]);

  const handleSilentSave = async (filename: string) => {
    setIsGenerating(true);
    const targetId = formData.reportNo || filename;
    try {
      const isDefaultPassword = reportId && password === reportId.slice(-4);
      const reportPassword = (!password || isDefaultPassword) ? (targetId?.slice(-4) || '1234') : password;
      
      extractAndSaveOptions(formData, 'report');

      try {
        const { supabase } = await import('@/lib/supabase');
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
        const pages = document.querySelectorAll('.report-a4-page');
        const { createDocumentPdf } = await import('@/utils/pdfGenerator');
        const { blob: pdfBlob } = await createDocumentPdf({
          pages,
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

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center bg-slate-200 text-gray-500">Initializing editor...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <UnsavedModal 
        isOpen={unsavedModalOpen}
        action={unsavedAction}
        defaultFilename={formData.reportNo || "Untitled"}
        onCancel={() => setUnsavedModalOpen(false)}
        onDontSave={handleUnsavedDontSave}
        onSave={handleSilentSave}
      />
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex z-[100] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setMobileStep(1)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 ${mobileStep === 1 ? 'text-[#2b579a]' : 'text-gray-400'}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider">1. Edit Data</span>
        </button>
        <button 
          onClick={() => setMobileStep(2)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 ${mobileStep === 2 ? 'text-[#2b579a]' : 'text-gray-400'}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider">2. Preview & Generate</span>
        </button>
      </div>

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          brandSettings={brandSettings}
          setBrandSettings={setBrandSettings}
        />
      )}
      
      {/* Step 1: Form (Hidden on mobile if step 2) */}
      <div className={`${mobileStep === 1 ? 'flex' : 'hidden'} md:flex h-full w-full md:w-auto pb-14 md:pb-0 overflow-hidden`}>
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
          isGenerating={isGenerating}
          isSuccess={isSuccess}
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
      </div>

      {/* Step 2: Preview (Hidden on mobile if step 1) */}
      <div className={`${mobileStep === 2 ? 'flex' : 'hidden'} md:flex flex-1 overflow-y-auto pb-20 md:pb-8 p-4 md:p-8 flex-col gap-4 md:gap-8 print:p-0 print:gap-0 print:overflow-visible items-center bg-gray-50 relative ${isGenerating ? 'is-generating-pdf' : ''}`}>
        
        {/* Mobile floating generate button */}
        <div className="md:hidden w-full max-w-[794px] mb-4 sticky top-4 z-50">
           <button 
             onClick={() => handlePrint()}
             disabled={isGenerating}
             className={`w-full ${isGenerating ? 'bg-slate-500' : isSuccess ? 'bg-green-600' : 'bg-blue-600'} text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}
           >
             <Printer size={20} /> 
             <span>{isGenerating ? 'Generating PDF...' : isSuccess ? 'Successful!' : 'Generate PDF'}</span>
           </button>
        </div>
        
        {/* Floating Toolbar (Desktop) */}
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
          <ReportDocumentView
            formData={formData}
            tests={tests}
            sampleImages={sampleImages}
            extraPages={extraPages}
            seal={seal}
            password={(!password || (reportId && password === reportId.slice(-4))) ? (formData.reportNo?.slice(-4) || '1234') : password}
            onReportingDateChange={(date) => updateField('reportDate', date)}
            isReadOnly={isGenerating}
          />
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
