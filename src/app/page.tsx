"use client";

import React, { useState } from 'react';
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
import { ReportFormData, TestRow } from '@/types';
import { supabase } from '@/lib/supabase';

// Initialize PDF fonts
if (pdfMake.vfs === undefined) {
  pdfMake.vfs = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;
}

export default function Home() {
  const [formData, setFormData] = useState<ReportFormData>({
    reportNo: String(Math.floor(100000 + Math.random() * 900000)),
    applicant: '',
    address: '',
    phone: '',
    sampleDescription: '',
    sample: '',
    shape: '',
    sampleDate: '',
    orderNo: '',
    color: '',
    size: '',
    fabricConstruction: '',
    fabricWeight: '',
    fibreContent: '',
    endUse: '',
    buyerName: '',
    buyingHouse: '',
    manufacturer: '',
    previousReportNo: '',
    sampleReceivingDate: '',
    sampleReportingDate: '',
    careLabelSymbols: '',
    sampleDetails: '',
    tableHeader1: 'Test',
    tableHeader2: 'Unit',
    tableHeader3: 'ASTM Standard',
    tableHeader4: 'Actual Results',
    footerText: 'Average readings are reported.'
  });

  const [tests, setTests] = useState<TestRow[]>([
    { id: '1', test: 'Density', unit: 'g / cm³', standard: 'ASTM D792 - A', result: '0.90' },
    { id: '2', test: 'Melt Flow Index\n@190 °C & 2.16 kg', unit: 'g / 10min.', standard: 'ASTM D1238', result: '1.400' },
    { id: '3', test: 'Visual Inspection', unit: '-', standard: '-', result: 'Pellet/Beige' },
    { id: '4', test: 'Filteration level\nLDPE Content', unit: '%', standard: '-', result: '99.30' }
  ]);

  const [sampleImage, setSampleImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalPages = sampleImage ? 3 : 2;
  
  const handlePrint = async (password?: string) => {
    if (!password) {
      alert("Please enter a password to lock the PDF.");
      return;
    }
    
    setIsGenerating(true);

    try {
      // 1. Save receipt to Supabase database
      const { error } = await supabase
        .from('receipts')
        .upsert({
          id: formData.reportNo,
          password: password,
          data: { formData, tests, sampleImage }
        });
        
      if (error) {
        console.error("Supabase Error:", error);
        alert("Warning: Could not save to database. Check the console for details.");
      }

      // 2. Capture pages as high-res images
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
    } catch (err) {
      console.error(err);
      alert("An error occurred during generation.");
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
      />

        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 print:p-0 print:gap-0 print:overflow-visible items-center">
        
        {/* PAGE 1 */}
        <div className="a4-page relative overflow-hidden flex flex-col bg-white">
          {/* Background Frame */}
          <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" />

          {/* Content overlay */}
          <div className="relative z-10 w-full h-full flex flex-col">
            {/* Page/Report # bar positioned right below the header area */}
            <SubHeader reportNo={formData.reportNo} pageNum={1} totalPages={totalPages} />
            
            {/* Push content below the frame header (PNAC + S.R. LABS + ISO/IEC + TEST REPORT) */}
            <div className="pt-[175px]">
              <PageOneData data={formData} />
            </div>
            
            <div className="flex-1"></div>
            
            {/* Signature & disclaimer above the frame footer */}
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

        {/* PAGE 3 - Sample Image (only if uploaded) */}
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
