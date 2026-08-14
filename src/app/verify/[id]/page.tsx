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
    // We only render Page 1 for the online verification preview
    return (
      <div className="min-h-screen bg-slate-200 flex justify-center py-10 font-gothic">
        <div className="a4-page relative overflow-hidden bg-white shadow-xl mx-auto border-[3px] border-black rounded-[2rem]">
          <div className="px-[38px] pt-8">
            <Header />
            <SubHeader reportNo={formData.reportNo} />
            <PageOneData data={formData} />
            <TestTable tests={tests} />
            <Signature />
            <Footer />
          </div>
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
