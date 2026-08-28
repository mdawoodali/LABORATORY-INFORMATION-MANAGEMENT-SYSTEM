"use client";

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { ReportFormData, TestRow } from '@/types';
import SubHeader from '@/components/report/SubHeader';
import PageOneData from '@/components/report/PageOneData';
import TestTable from '@/components/report/TestTable';
import Signature from '@/components/report/Signature';
import PQSLogoImage from '@/components/report/PQSLogoImage';
import PQSWordmark from '@/components/report/PQSWordmark';
import PnacLogo from '@/components/report/PnacLogo';
import Footer from '@/components/report/Footer';

function VerifyPage() {
  const searchParams = useSearchParams();
  const reportNo = searchParams.get('id') || '';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    formData: ReportFormData;
    tests: TestRow[];
    sampleImage?: string | null;
    sampleImages?: {id: string, src: string, name?: string}[];
    extraPages?: any[];
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: sbError } = await supabase
        .from('receipts')
        .select('data, password')
        .eq('id', reportNo)
        .single();

      if (sbError || !data) {
        setError('Report not found in the database.');
        setIsLoading(false);
        return;
      }

      if (data.password !== password) {
        setError('Incorrect password. Access denied.');
        setIsLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setReceiptData(data.data as any);
    } catch {
      setError('An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const pages = document.querySelectorAll('.a4-page');
      const html2canvasModule = await import('html2canvas-pro');
      const html2canvas = html2canvasModule.default;
      const content: string[] = [];

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;
        await new Promise(r => setTimeout(r, 100));
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        content.push(canvas.toDataURL('image/png'));
      }

      const { jsPDF } = await import('jspdf');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsPdfOptions: any = {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      };

      if (password) {
        jsPdfOptions.encryption = {
          userPassword: password,
          ownerPassword: password,
          userPermissions: ['print']
        };
      }

      const pdf = new jsPDF(jsPdfOptions);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < content.length; i++) {
        if (i > 0) pdf.addPage();
        pdf.addImage(content[i], 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`Report_${reportNo}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (receiptData) {
    const { formData, tests, sampleImage, sampleImages, extraPages } = receiptData;
    
    // Support both old sampleImage (single string) and new sampleImages (array)
    const images = sampleImages && sampleImages.length > 0 
      ? sampleImages 
      : sampleImage 
        ? [{ id: '1', src: sampleImage }] 
        : [];
    
    const hasImages = images.length > 0;
    const hasExtraPages = extraPages && extraPages.length > 0;
    const totalPages = 2 + (hasImages ? 1 : 0) + (hasExtraPages ? extraPages.length : 0);
    let pageNum = 0;
    
    return (
      <div className={`min-h-screen bg-slate-200 flex flex-col items-center gap-8 py-10 font-sans print:bg-white print:p-0 print:gap-0 ${isGeneratingPdf ? 'is-generating-pdf' : ''}`}>
        
        {/* Save PDF button */}
        <div className="fixed bottom-6 right-6 z-50 no-print">
          <button
            onClick={handleSavePdf}
            disabled={isGeneratingPdf}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-full shadow-2xl transition-all active:scale-95 flex items-center gap-2"
          >
            {isGeneratingPdf ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Save PDF
              </>
            )}
          </button>
        </div>
        
        {/* PAGE 1 */}
        <div className="a4-page relative overflow-hidden flex flex-col bg-white">
          <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" />
          <div className="relative z-10 w-full h-full flex flex-col">
            <SubHeader reportNo={formData.reportNo} pageNum={++pageNum} totalPages={totalPages} />
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
            <SubHeader reportNo={formData.reportNo} pageNum={++pageNum} totalPages={totalPages} />
            <div className="pt-[175px] flex-1 flex flex-col">
              <TestTable tests={tests} data={formData} />
              <div className="flex-1"></div>
              <div className="pb-[55px]">
                <Signature />
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 3 - Sample Images */}
        {hasImages && (
          <div className="a4-page relative overflow-hidden flex flex-col bg-white">
            <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" />
            <div className="relative z-10 w-full h-full flex flex-col">
              <SubHeader reportNo={formData.reportNo} pageNum={++pageNum} totalPages={totalPages} />
              <div className="pt-[175px] flex-1 flex flex-col items-center px-10">
                {images.map((img) => (
                  <div key={img.id} className="flex flex-col items-center mt-4">
                    <img src={img.src} alt={img.name || "Sample"} className="max-w-[85%] max-h-[500px] object-contain border border-gray-200 p-2" />
                    {img.name && (
                      <p className="text-center mt-2 font-bold text-slate-800 text-[16px]">{img.name}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="pb-[55px]">
                <Signature />
              </div>
            </div>
          </div>
        )}

        {/* EXTRA PAGES */}
        {hasExtraPages && extraPages!.map((page, idx) => (
          <div key={idx} className="a4-page relative overflow-hidden flex flex-col bg-white">
            <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" />
            <div className="relative z-10 w-full h-full flex flex-col">
              <SubHeader reportNo={formData.reportNo} pageNum={++pageNum} totalPages={totalPages} />
              <div className="pt-[175px] flex-1 px-10">
                {page.content && (
                  <div dangerouslySetInnerHTML={{ __html: page.content }} />
                )}
              </div>
              <div className="pb-[55px]">
                <Signature />
              </div>
            </div>
          </div>
        ))}

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center font-sans text-white p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700">
        <div className="flex justify-center mb-4">
          <PQSLogoImage className="w-[70px] h-[70px] object-contain" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center tracking-wider">Secure Report Portal</h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          Report #{reportNo} is password protected.
        </p>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Password</label>
            <input
              type="password"
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-400 text-sm font-semibold">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded shadow transition-all active:scale-95 mt-2"
          >
            {isLoading ? 'Verifying...' : 'Unlock Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPageWrapper() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-900 flex justify-center items-center text-white">Loading secure portal...</div>}>
      <VerifyPage />
    </React.Suspense>
  );
}
