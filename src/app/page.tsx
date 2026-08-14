"use client";

import React, { useState } from 'react';
import ReportForm from '@/components/form/ReportForm';
import Header from '@/components/report/Header';
import SubHeader from '@/components/report/SubHeader';
import PageOneData from '@/components/report/PageOneData';
import TestTable from '@/components/report/TestTable';
import Signature from '@/components/report/Signature';
import Footer from '@/components/report/Footer';
import PnacLogo from '@/components/report/PnacLogo';
import { ReportFormData, TestRow } from '@/types';

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

  const totalPages = 3;
  
  const handlePrint = () => {
    window.print();
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

            <div className="flex-1 flex justify-center items-start pt-10 border-t-[1.5px] border-black">
              {sampleImage ? (
                <img src={sampleImage} alt="Sample" className="max-w-[80%] max-h-[600px] object-contain shadow-sm" />
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
