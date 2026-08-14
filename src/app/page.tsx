"use client";

import React, { useState } from 'react';
import html2canvas from 'html2canvas';
// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts';
import Barcode from 'react-barcode';
import ReportForm from '@/components/form/ReportForm';
import Header from '@/components/report/Header';
import SubHeader from '@/components/report/SubHeader';
import PageOneData from '@/components/report/PageOneData';
import TestTable from '@/components/report/TestTable';
import Signature from '@/components/report/Signature';
import Footer from '@/components/report/Footer';
import PnacLogo from '@/components/report/PnacLogo';
import { ReportFormData, TestRow } from '@/types';
import { supabase } from '@/lib/supabase';

// Initialize PDF fonts
if (pdfMake.vfs === undefined) {
  pdfMake.vfs = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;
}

export default function Home() {
  const [formData, setFormData] = useState<ReportFormData>({
    reportNo: '519438',
    applicant: 'M/s. COTTON ART PRINTING',
    address: '196 Ghona West Ghona Road, Faisalabad Pakistan.',
    phone: '-',
    sampleDescription: 'Raw Material',
    sample: 'LDPE',
    shape: '-',
    sampleDate: '-',
    orderNo: '-',
    color: '-',
    size: '-',
    fabricConstruction: '-',
    fabricWeight: '-',
    fibreContent: '-',
    endUse: '-',
    buyerName: '-',
    buyingHouse: '-',
    manufacturer: '-',
    previousReportNo: '-',
    sampleReceivingDate: '14/08/2026',
    sampleReportingDate: '19/08/2026',
    careLabelSymbols: '-',
    sampleDetails: 'A Sample of Recycled Material, tested for Density, Melt Flow Index, Shape and Filteration Level LDPE Content.'
  });

  const [tests, setTests] = useState<TestRow[]>([
    { id: '1', test: 'Density', unit: 'g / cm³', standard: 'ASTM D792 - A', result: '0.90' },
    { id: '2', test: 'Melt Flow Index\n@190 °C & 2.16 kg', unit: 'g / 10min.', standard: 'ASTM D1238', result: '1.400' },
    { id: '3', test: 'Visual Inspection', unit: '-', standard: '-', result: 'Pellet/Beige' },
    { id: '4', test: 'Filteration level\nLDPE Content', unit: '%', standard: '-', result: '99.30' }
  ]);

  const [sampleImage, setSampleImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalPages = 3;
  
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
        alert("Warning: Could not save to database. Have you created the 'receipts' table in Supabase yet? Check the console for details.");
      }

      // 2. Capture pages as high-res images
      const pages = document.querySelectorAll('.a4-page');
      const content = [];

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i] as HTMLElement, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        content.push({
          image: imgData,
          width: 595.28, // A4 Width in points
          height: 841.89, // A4 Height in points
          margin: [0, 0, 0, 0]
        });
      }

      const docDefinition = {
        pageSize: 'A4' as const,
        pageMargins: [0, 0, 0, 0] as [number, number, number, number],
        content: content,
        userPassword: password, // Locks the PDF!
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


        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 print:p-0 print:gap-0 print:overflow-visible">
        
        {/* PAGE 1 */}
        <div className="a4-page flex flex-col pt-[15mm] relative">
          <Header />
          <SubHeader reportNo={formData.reportNo} pageNum={1} totalPages={totalPages} />
          
          <div className="border-[1.5px] border-black rounded-[2rem] flex-1 flex flex-col relative mt-2 pb-2">
            <PnacLogo />
            
            <div className="flex justify-between items-end px-8 pt-10">
               <div className="font-sans font-bold text-[14px]">ISO/IEC 17025:2017 Accredited Lab</div>
               <div className="font-sans font-bold text-[26px] tracking-wider pr-10">TEST REPORT</div>
            </div>

            <PageOneData data={formData} />
            <Signature />
          </div>

          <Footer />
        </div>

        {/* PAGE 2 */}
        <div className="a4-page flex flex-col pt-[15mm] relative">
          <Header />
          <SubHeader reportNo={formData.reportNo} pageNum={2} totalPages={totalPages} />
          
          <div className="border-[1.5px] border-black rounded-[2rem] flex-1 flex flex-col relative mt-2 pb-2">
            <PnacLogo />
            
            <div className="flex justify-between items-end px-8 pt-10">
               <div className="font-sans font-bold text-[14px]">ISO/IEC 17025:2017 Accredited Lab</div>
               <div className="font-sans font-bold text-[26px] tracking-wider pr-10">TEST REPORT</div>
            </div>

            <TestTable sampleDetails={formData.sampleDetails} tests={tests} />
          </div>

          <Footer />
        </div>

        {/* PAGE 3 */}
        <div className="a4-page flex flex-col pt-[15mm] relative">
          <Header />
          <SubHeader reportNo={formData.reportNo} pageNum={3} totalPages={totalPages} />
          
          <div className="border-[1.5px] border-black rounded-[2rem] flex-1 flex flex-col relative mt-2 pb-2">
            <PnacLogo />
            
            <div className="flex justify-between items-end px-8 pt-10 mb-6">
               <div className="font-sans font-bold text-[14px]">ISO/IEC 17025:2017 Accredited Lab</div>
               <div className="font-sans font-bold text-[26px] tracking-wider pr-10">TEST REPORT</div>
            </div>

            <div className="flex-1 flex justify-center items-start pt-10 border-t-[1.5px] border-black mx-[20px]">
              {sampleImage ? (
                <img src={sampleImage} alt="Sample" className="max-w-[80%] max-h-[600px] object-contain shadow-sm border border-gray-200 p-2" />
              ) : (
                <div className="text-slate-400 italic mt-20 font-sans">No sample image attached.</div>
              )}
            </div>
          </div>

          <Footer />
        </div>

      </div>
    </div>
  );
}
