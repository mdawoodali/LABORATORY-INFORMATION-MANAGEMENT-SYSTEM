"use client";

import React, { useState } from 'react';
import ReportForm from '@/components/form/ReportForm';
import Header from '@/components/report/Header';
import SubHeader from '@/components/report/SubHeader';
import PageOneData from '@/components/report/PageOneData';
import TestTable from '@/components/report/TestTable';
import Signature from '@/components/report/Signature';
import Footer from '@/components/report/Footer';
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

  const totalPages = sampleImage ? 3 : 2;
  
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
      
      {/* FORM SIDEBAR */}
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

      {/* PDF PREVIEW AREA */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 print:p-0 print:gap-0 print:overflow-visible">
        
        {/* PAGE 1 */}
        <div className="a4-page flex flex-col">
          <Header />
          <SubHeader reportNo={formData.reportNo} pageNum={1} totalPages={totalPages} />
          <PageOneData data={formData} />
          <Signature />
          <Footer />
        </div>

        {/* PAGE 2 */}
        <div className="a4-page flex flex-col">
          <Header />
          <SubHeader reportNo={formData.reportNo} pageNum={2} totalPages={totalPages} />
          <TestTable sampleDetails={formData.sampleDetails} tests={tests} />
          <Footer />
        </div>

        {/* PAGE 3 (Optional Image) */}
        {sampleImage && (
          <div className="a4-page flex flex-col">
            <Header />
            <div className="flex justify-end mb-8 mt-4">
              <div className="bg-gray-200 px-4 py-1 text-base font-sans font-bold">Report # {formData.reportNo}</div>
            </div>
            <div className="flex-1 flex justify-center items-start pt-10 border-t border-black">
               <img src={sampleImage} alt="Sample" className="max-w-[80%] max-h-[600px] object-contain shadow-sm" />
            </div>
            <Footer />
          </div>
        )}

      </div>
    </div>
  );
}
