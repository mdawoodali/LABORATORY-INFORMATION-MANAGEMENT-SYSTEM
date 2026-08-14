"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { ReportFormData, TestRow } from '@/types';
import Header from '@/components/report/Header';
import SubHeader from '@/components/report/SubHeader';
import PageOneData from '@/components/report/PageOneData';
import TestTable from '@/components/report/TestTable';
import Signature from '@/components/report/Signature';
import Footer from '@/components/report/Footer';

export default function VerifyPage() {
  const params = useParams();
  const reportNo = params.id as string;

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    formData: ReportFormData;
    tests: TestRow[];
    sampleImage: string | null;
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
        setError('Receipt not found in the database.');
        setIsLoading(false);
        return;
      }

      if (data.password !== password) {
        setError('Incorrect password. Access denied.');
        setIsLoading(false);
        return;
      }

      setReceiptData(data.data as any);
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  if (receiptData) {
    const { formData, tests, sampleImage } = receiptData;
    const totalPages = 3;
    
    return (
      <div className="min-h-screen bg-slate-200 flex flex-col items-center gap-8 py-10 font-sans print:bg-white print:p-0 print:gap-0">
        
        {/* PAGE 1 */}
        <div className="a4-page flex flex-col pt-[15mm] relative bg-white shadow-xl border-[3px] border-black rounded-[2rem] no-print-shadow">
          <Header />
          <SubHeader reportNo={formData.reportNo} pageNum={1} totalPages={totalPages} />
          
          <div className="border-[1.5px] border-black rounded-[2rem] flex-1 flex flex-col relative mt-2 pb-2 mx-[38px] mb-[38px]">
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
        <div className="a4-page flex flex-col pt-[15mm] relative bg-white shadow-xl border-[3px] border-black rounded-[2rem] no-print-shadow">
          <Header />
          <SubHeader reportNo={formData.reportNo} pageNum={2} totalPages={totalPages} />
          
          <div className="border-[1.5px] border-black rounded-[2rem] flex-1 flex flex-col relative mt-2 pb-2 mx-[38px] mb-[38px]">
            <div className="flex justify-between items-end px-8 pt-10">
               <div className="font-sans font-bold text-[14px]">ISO/IEC 17025:2017 Accredited Lab</div>
               <div className="font-sans font-bold text-[26px] tracking-wider pr-10">TEST REPORT</div>
            </div>

            <TestTable sampleDetails={formData.sampleDetails} tests={tests} />
          </div>
          <Footer />
        </div>

        {/* PAGE 3 */}
        <div className="a4-page flex flex-col pt-[15mm] relative bg-white shadow-xl border-[3px] border-black rounded-[2rem] no-print-shadow">
          <Header />
          <SubHeader reportNo={formData.reportNo} pageNum={3} totalPages={totalPages} />
          
          <div className="border-[1.5px] border-black rounded-[2rem] flex-1 flex flex-col relative mt-2 pb-2 mx-[38px] mb-[38px]">
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
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center font-sans text-white p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700">
        <h1 className="text-2xl font-bold mb-2 text-center tracking-wider">Secure Receipt Portal</h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          Receipt #{reportNo} is strictly encrypted.
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
            {isLoading ? 'Verifying...' : 'Unlock Receipt'}
          </button>
        </form>
      </div>
    </div>
  );
}
