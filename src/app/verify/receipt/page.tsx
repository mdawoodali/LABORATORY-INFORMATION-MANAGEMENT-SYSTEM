"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { ReportFormData, TestRow, ExtraPage } from '@/types';
import PQSWordmark from '@/components/report/PQSWordmark';
import PQSLogoImage from '@/components/report/PQSLogoImage';
import PageOneData from '@/components/report/PageOneData';
import TestTable from '@/components/report/TestTable';
import CanvaImage from '@/components/report/CanvaImage';
import QRCode from 'react-qr-code';

const PASHeader = ({ reportNo, reportingDate }: { reportNo: string, reportingDate: string }) => {
  const verifyUrl = `https://limsreportgenerator.vercel.app/verify/receipt?id=${reportNo}`;

  return (
    <div className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4 px-10 pt-6">
      <div className="flex items-center gap-3 shrink-0">
        <PQSLogoImage className="w-[90px] h-[90px] object-contain" />
        <div className="flex flex-col">
          <PQSWordmark className="mb-2" />
          <div className="text-xs text-gray-500 mt-1">
            R-332/9, Dastagir, F.B Area, Karachi, 75950.
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Contact: 03322673373
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Email: precisionqualityserviceslabs@gmail.com
          </div>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end">
        <div className="flex items-start mb-4">
          <div className="flex flex-col items-center mr-4 mt-1">
            <QRCode 
              value={verifyUrl} 
              size={40}
              level="M"
            />
            <span className="text-[7px] mt-0.5 text-gray-500 font-bold uppercase tracking-wider">Scan Me</span>
          </div>
          <div className="text-2xl font-bold tracking-wider text-gray-800 border border-gray-800 px-4 py-1">
            REPORT
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="font-bold w-20 text-right whitespace-nowrap">Report #:</span>
          <span className="w-28 text-left border-b border-gray-400">{reportNo}</span>
        </div>
        <div className="flex gap-2 text-sm mt-1">
          <span className="font-bold w-20 text-right whitespace-nowrap">Report Date:</span>
          <span className="w-28 text-left border-b border-gray-400">{reportingDate}</span>
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

const EndOfReportMarker = () => (
  <div className="w-full flex items-center mt-6 px-10 mb-4">
    <div className="flex-1 border-b-[2px] border-black mr-4"></div>
    <div className="font-bold whitespace-nowrap text-[#002f6c]" style={{ fontSize: '14px', fontFamily: 'sans-serif' }}>End of Report</div>
  </div>
);

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
    extraPages?: ExtraPage[];
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
          scale: 3,
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
    const totalPages = 2 + (hasImages ? 1 : 0) + (extraPages?.length || 0);
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center gap-8 py-10 font-sans print:bg-white print:p-0 print:gap-0">
        
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
        <div className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl shrink-0 border border-gray-300" style={{ width: '794px', height: '1123px' }}>
          <PASHeader reportNo={formData.reportNo} reportingDate={formData.reportDate || ''} />
          <div className="flex-1">
            <PageOneData data={formData} />
          </div>
          <PASFooter pageNum={1} totalPages={totalPages} />
        </div>

        {/* PAGE 2 */}
        <div className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl shrink-0 border border-gray-300" style={{ width: '794px', height: '1123px' }}>
          <PASHeader reportNo={formData.reportNo} reportingDate={formData.reportDate || ''} />
          <div className="flex-1 px-10">
            <TestTable tests={tests} data={formData} />
          </div>
          <PASFooter pageNum={2} totalPages={totalPages} />
        </div>

        {/* PAGE 3 - Sample Images */}
        {hasImages && (
          <div className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl shrink-0 border border-gray-300" style={{ width: '794px', height: '1123px' }}>
            <PASHeader reportNo={formData.reportNo} reportingDate={formData.reportDate || ''} />
            <div className="flex-1 flex flex-col px-10">
              <div className="flex-1 w-full relative">
                {images.map(img => (
                  <CanvaImage 
                    key={img.id}
                    src={img.src}
                    caption={images.length > 1 ? `Product Picture #${images.indexOf(img) + 1}` : 'Product Picture'} 
                    defaultWidth={400} 
                    defaultHeight={400} 
                    className="border border-gray-200 shadow-sm bg-white p-2 absolute" 
                    isReadOnly={true}
                  />
                ))}
              </div>
            </div>
            <PASFooter pageNum={3} totalPages={totalPages} />
          </div>
        )}

        {/* Extra Pages */}
        {extraPages && extraPages.map((page, index) => {
          const pageNum = (hasImages ? 4 : 3) + index;
          return (
            <div key={page.id || index} className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl shrink-0 border border-gray-300" style={{ width: '794px', height: '1123px' }}>
              <PASHeader reportNo={formData.reportNo} reportingDate={formData.reportDate || ''} />
              <div className="flex-1 flex flex-col px-10 relative">
                {page.image && (
                  <div className="flex-1 flex justify-center items-start mb-4 relative">
                    <CanvaImage 
                      src={page.image}
                      className="max-w-full max-h-[850px] object-contain"
                      isReadOnly={true}
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
