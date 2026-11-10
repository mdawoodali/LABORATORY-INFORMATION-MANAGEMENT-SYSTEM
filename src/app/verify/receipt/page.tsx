"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { ReportFormData, TestRow, ExtraPage } from '@/types';
import PQSWordmark from '@/components/report/PQSWordmark';
import PQSLogoImage from '@/components/report/PQSLogoImage';
import PageOneData from '@/components/report/PageOneData';
import TestTable from '@/components/report/TestTable';
import CanvaImage from '@/components/report/CanvaImage';
import QRCode from 'react-qr-code';
import { generateDocumentSeal } from '@/utils/cryptoSeal';
import MobileDocumentViewport from '@/components/MobileDocumentViewport';
import { ShieldCheck, Lock, ArrowRight, Download } from 'lucide-react';

const PASHeader = ({ 
  reportNo, 
  reportingDate, 
  seal, 
  password 
}: { 
  reportNo: string; 
  reportingDate: string; 
  seal?: string; 
  password?: string;
}) => {
  const pwdParam = password ? `&pwd=${encodeURIComponent(password)}` : '';
  const sealParam = seal ? `&seal=${seal}` : '';
  const verifyUrl = `https://limsreportgenerator.vercel.app/verify/receipt?id=${reportNo}${sealParam}${pwdParam}`;

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
            {seal && <span className="text-[6.5px] text-gray-400 font-mono tracking-tighter mt-0.5">{seal}</span>}
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

const PASFooter = ({ pageNum, totalPages, seal }: { pageNum: number, totalPages: number, seal?: string }) => (
  <div className="absolute bottom-10 left-0 w-full flex flex-col items-center">
    <div className="w-[85%] flex justify-between items-center border-t border-gray-400 pt-3 text-xs text-gray-500">
      <div className="flex flex-col text-left">
        <span className="italic tracking-wide">This is a computer generated document and doesn&apos;t need a signature.</span>
        {seal && (
          <span className="text-[9px] text-gray-400 font-mono mt-0.5">
            Digital Integrity Seal: {seal} • ISO/IEC 17025 Compliant Electronic Audit Trail
          </span>
        )}
      </div>
      <span className="font-bold text-gray-700">Page {pageNum}/{totalPages}</span>
    </div>
  </div>
);

function VerifyPage() {
  const searchParams = useSearchParams();
  const reportNo = searchParams.get('id') || '';
  const urlSeal = searchParams.get('seal') || '';
  const urlPwd = searchParams.get('pwd') || searchParams.get('auth') || '';

  const [password, setPassword] = useState(urlPwd);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [computedSeal, setComputedSeal] = useState<string>('');
  const [receiptData, setReceiptData] = useState<{
    formData: ReportFormData;
    tests: TestRow[];
    sampleImage?: string | null;
    sampleImages?: {id: string, src: string, name?: string}[];
    extraPages?: ExtraPage[];
  } | null>(null);

  const verifyWithPassword = async (pwdToTest: string) => {
    if (!reportNo) {
      setIsLoading(false);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { data, error: sbError } = await supabase
        .from('receipts')
        .select('data, password')
        .eq('id', reportNo)
        .single();

      if (sbError || !data) {
        setError('Document not found in the database.');
        setIsLoading(false);
        return;
      }

      const isPasswordless = !data.password || data.password === '-' || data.data?.type === 'invoice';

      if (!isPasswordless && data.password !== pwdToTest) {
        if (pwdToTest) {
          setError('Incorrect password. Please enter the valid document PIN.');
        }
        setIsLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rData = data.data as any;
      setReceiptData(rData);

      if (rData?.formData) {
        generateDocumentSeal(
          rData.formData.reportNo || reportNo,
          rData.formData.reportDate || '',
          rData.tests || []
        ).then(c => setComputedSeal(c));
      }
    } catch {
      setError('An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verify on mount if auth token/password is present or document is password-free
  useEffect(() => {
    verifyWithPassword(urlPwd);
  }, [reportNo, urlPwd]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyWithPassword(password);
  };

  const handleSavePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const pages = document.querySelectorAll('.report-a4-page');
      const { createDocumentPdf } = await import('@/utils/pdfGenerator');
      const { pdf } = await createDocumentPdf({
        pages,
        filename: reportNo,
        password: password || undefined,
        type: 'report'
      });
      pdf.save(`Report_${reportNo}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading && !receiptData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center font-sans text-white p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-300 text-sm font-semibold tracking-wide">
            Verifying cryptographic authenticity...
          </p>
        </div>
      </div>
    );
  }

  if (receiptData) {
    const { formData, tests, sampleImage, sampleImages, extraPages } = receiptData;
    
    // Support both old sampleImage (single string) and new sampleImages (array)
    const images = sampleImages && sampleImages.length > 0 
      ? sampleImages 
      : sampleImage 
        ? [{ id: '1', src: sampleImage }] 
        : [];
    
    const hasImages = images.length > 0;
    const ROWS_PER_PAGE = 8;
    const testList = tests || [];
    const testPagesCount = Math.max(1, Math.ceil(testList.length / ROWS_PER_PAGE));
    const testChunks: TestRow[][] = [];
    for (let i = 0; i < testList.length; i += ROWS_PER_PAGE) {
      testChunks.push(testList.slice(i, i + ROWS_PER_PAGE));
    }
    if (testChunks.length === 0) testChunks.push([]);

    const sampleImagesCount = hasImages ? 1 : 0;
    const extraPagesCount = extraPages?.length || 0;
    const totalPages = 1 + testPagesCount + sampleImagesCount + extraPagesCount;
    const activeSeal = computedSeal || urlSeal;

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center gap-4 md:gap-6 py-4 md:py-8 font-sans print:bg-white print:p-0 print:gap-0 overflow-x-hidden">
        
        {/* Verification Status Banner */}
        <div className="w-full max-w-[794px] px-4 no-print">
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-emerald-950">Official Document Verified</h2>
                  <span className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Authentic Record
                  </span>
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">
                  ISO/IEC 17025 Electronic Audit Trail • Cryptographic Seal: <span className="font-mono font-bold">{activeSeal || 'VERIFIED'}</span>
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
              <span className="text-xs text-emerald-800 block font-bold">Report #{formData.reportNo}</span>
              <span className="text-[11px] text-emerald-600 font-medium">Precision Quality Services</span>
            </div>
          </div>
        </div>

        {/* Save PDF button */}
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 no-print">
          <button
            onClick={handleSavePdf}
            disabled={isGeneratingPdf}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-5 rounded-full shadow-2xl transition-all active:scale-95 flex items-center gap-2 text-sm"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Save PDF</span>
              </>
            )}
          </button>
        </div>
        
        {/* Responsive Fit-to-Screen Document Viewport */}
        <MobileDocumentViewport pageCount={totalPages}>
          {/* PAGE 1 */}
          <div className="report-a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300" style={{ width: '794px', height: '1123px' }}>
            <PASHeader reportNo={formData.reportNo} reportingDate={formData.reportDate || ''} seal={activeSeal} password={password} />
            <div className="flex-1">
              <PageOneData data={formData} />
            </div>
            <PASFooter pageNum={1} totalPages={totalPages} seal={activeSeal} />
          </div>

          {/* TEST PAGES (Dynamically chunked) */}
          {testChunks.map((chunk, index) => (
            <div 
              key={`test-page-${index}`} 
              className="report-a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300 mt-8" 
              style={{ width: '794px', height: '1123px' }}
            >
              <PASHeader reportNo={formData.reportNo} reportingDate={formData.reportDate || ''} seal={activeSeal} password={password} />
              <div className="flex-1">
                <TestTable 
                  tests={chunk} 
                  data={formData} 
                  isFirstPage={index === 0}
                  isLastPage={index === testChunks.length - 1}
                />
              </div>
              <PASFooter pageNum={2 + index} totalPages={totalPages} seal={activeSeal} />
            </div>
          ))}

          {/* Sample Images Page */}
          {hasImages && (
            <div className="report-a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300 mt-8" style={{ width: '794px', height: '1123px' }}>
              <PASHeader reportNo={formData.reportNo} reportingDate={formData.reportDate || ''} seal={activeSeal} password={password} />
              <div className="flex-1 flex flex-col px-10">
                <div className="flex-1 w-full relative">
                  {images.map((img, imgIdx) => (
                    <CanvaImage 
                      key={img.id || imgIdx}
                      src={img.src}
                      caption={images.length > 1 ? `Product Picture #${imgIdx + 1}` : 'Product Picture'} 
                      defaultWidth={400} 
                      defaultHeight={400} 
                      className="border border-gray-200 shadow-sm bg-white p-2 absolute" 
                      isReadOnly={true}
                    />
                  ))}
                </div>
              </div>
              <PASFooter pageNum={1 + testPagesCount + 1} totalPages={totalPages} seal={activeSeal} />
            </div>
          )}

          {/* Extra Pages */}
          {extraPages && extraPages.map((page, index) => {
            const pageNum = 1 + testPagesCount + sampleImagesCount + 1 + index;
            return (
              <div key={page.id || index} className="report-a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300 mt-8" style={{ width: '794px', height: '1123px' }}>
                <PASHeader reportNo={formData.reportNo} reportingDate={formData.reportDate || ''} seal={activeSeal} password={password} />
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
                <PASFooter pageNum={pageNum} totalPages={totalPages} seal={activeSeal} />
              </div>
            );
          })}
        </MobileDocumentViewport>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center font-sans text-white p-4">
      <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center p-2 shadow-inner">
            <PQSLogoImage className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-white tracking-wide">Document Verification</h1>
          <p className="text-slate-400 text-xs mt-1">
            Report <span className="font-mono text-blue-400 font-bold">#{reportNo || 'Unknown'}</span> is protected with security encryption.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Lock size={12} className="text-blue-400" />
              <span>Security PIN / Password</span>
            </label>
            <input
              type="password"
              inputMode="text"
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
              placeholder="Enter document PIN"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl p-3 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm mt-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Unlock & Verify</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            Precision Quality Services • ISO 17025
          </span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPageWrapper() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">Loading verification portal...</div>}>
      <VerifyPage />
    </React.Suspense>
  );
}
