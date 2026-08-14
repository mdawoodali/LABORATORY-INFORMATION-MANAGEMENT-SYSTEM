"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts';
import ReportForm from '@/components/form/ReportForm';
import SubHeader from '@/components/report/SubHeader';
import PageOneData from '@/components/report/PageOneData';
import TestTable from '@/components/report/TestTable';
import Signature from '@/components/report/Signature';
import { ReportFormData, TestRow, Template, DEFAULT_FORM_DATA, DEFAULT_TESTS } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

// Initialize PDF fonts
if (pdfMake.vfs === undefined) {
  pdfMake.vfs = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;
}

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

  const totalPages = sampleImage ? 3 : 2;

  // Load template or existing report
  useEffect(() => {
    if (templateId) {
      const templateData = sessionStorage.getItem('sr_template_data');
      if (templateData) {
        try {
          const template: Template = JSON.parse(templateData);
          setFormData({
            ...template.formData,
            reportNo: String(Math.floor(100000 + Math.random() * 900000)),
          });
          setTests(template.tests);
          sessionStorage.removeItem('sr_template_data');
        } catch (e) {
          console.error('Failed to load template:', e);
        }
      }
    } else if (reportId) {
      loadReport(reportId);
    }
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

  const handlePrint = async (password?: string) => {
    if (!password) {
      toast.error("Please enter a password to lock the PDF.");
      return;
    }
    
    setIsGenerating(true);

    try {
      const { error } = await supabase
        .from('receipts')
        .upsert({
          id: formData.reportNo,
          password: password,
          data: { formData, tests, sampleImage }
        });
        
      if (error) {
        console.error("Supabase Error:", error);
        toast.error("Database save failed: " + error.message);
        // Continue generation even if save fails, but user is warned
      } else {
        toast.success("Saved securely to cloud.");
      }

      const pages = document.querySelectorAll('.a4-page');
      const content = [];

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i] as HTMLElement, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        content.push({
          image: imgData,
          width: 595.28,
          height: 841.89,
          margin: [0, 0, 0, 0]
        });
      }

      const docDefinition = {
        pageSize: 'A4' as const,
        pageMargins: [0, 0, 0, 0] as [number, number, number, number],
        content: content,
        userPassword: password,
        ownerPassword: password,
        permissions: { printing: 'high', modifying: false, copying: false }
      };

      // @ts-ignore
      pdfMake.createPdf(docDefinition).download(`SR_Lab_Report_${formData.reportNo}.pdf`);
      toast.success("PDF generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during PDF generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateField = (field: keyof ReportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    <div className="flex h-screen bg-slate-200 overflow-hidden font-sans">
      
      <ReportForm 
        formData={formData}
        updateField={updateField}
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
      />

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 print:p-0 print:gap-0 print:overflow-visible items-center">
        
        {/* PAGE 1 */}
        <div className="a4-page relative overflow-hidden flex flex-col bg-white">
          <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" />
          <div className="relative z-10 w-full h-full flex flex-col">
            <SubHeader reportNo={formData.reportNo} pageNum={1} totalPages={totalPages} />
            <div className="pt-[175px]">
              <PageOneData data={formData} />
            </div>
            <div className="flex-1"></div>
            <div className="pb-[55px]">
              <Signature />
            </div>
          </div>
        </div>

        {/* PAGE 2 */}
        <div className="a4-page relative overflow-hidden flex flex-col bg-white">
          <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" />
          <div className="relative z-10 w-full h-full flex flex-col">
            <SubHeader reportNo={formData.reportNo} pageNum={2} totalPages={totalPages} />
            <div className="pt-[175px] flex-1 flex flex-col">
              <TestTable tests={tests} data={formData} />
              <div className="flex-1"></div>
              <div className="pb-[55px]">
                <Signature />
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 3 - Sample Image */}
        {sampleImage && (
          <div className="a4-page relative overflow-hidden flex flex-col bg-white">
            <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" />
            <div className="relative z-10 w-full h-full flex flex-col">
              <SubHeader reportNo={formData.reportNo} pageNum={3} totalPages={totalPages} />
              <div className="pt-[175px] flex-1 flex justify-center items-start px-10">
                <img src={sampleImage} alt="Sample" className="max-w-[85%] max-h-[550px] object-contain border border-gray-200 p-2 mt-4" />
              </div>
              <div className="pb-[55px]">
                <Signature />
              </div>
            </div>
          </div>
        )}

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
