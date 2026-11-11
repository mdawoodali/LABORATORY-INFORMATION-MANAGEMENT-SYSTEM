"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PQSLogoImage from '@/components/report/PQSLogoImage';
import PQSWordmark from '@/components/report/PQSWordmark';
import { Search, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyIndexPage() {
  const [reportNo, setReportNo] = useState('');
  const router = useRouter();

  useEffect(() => {
    document.title = "Verify Document | Precision Quality Services LIMS";
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportNo.trim()) {
      router.push(`/verify/receipt?id=${reportNo.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans text-gray-900 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200">
        
        {/* Logo and Wordmark */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-gray-200 flex items-center justify-center p-2.5 shadow-sm mb-3">
            <PQSLogoImage className="w-full h-full object-contain" />
          </div>
          <PQSWordmark className="h-5 sm:h-6 object-contain mb-1.5" />
          <div className="flex items-center gap-1.5 px-3 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-[10.5px] font-semibold text-blue-900 uppercase tracking-widest mt-1">
            <ShieldCheck size={12} className="text-[#2b579a]" />
            <span>Official Verification Portal</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Verify Document</h1>
          <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
            Enter the 6-digit Report Number or Invoice ID printed beneath the QR code to verify its authenticity.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Search size={12} className="text-[#2b579a]" />
              <span>Report or Document Number</span>
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:bg-white focus:outline-none focus:border-[#2b579a] focus:ring-2 focus:ring-[#2b579a]/20 transition-all font-mono"
              placeholder="e.g. 588193 or pqs-1126-560947"
              value={reportNo}
              onChange={(e) => setReportNo(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2b579a] hover:bg-[#1e4178] active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm mt-1 cursor-pointer"
          >
            <span>Verify & View Document</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <Link href="/" className="hover:text-[#2b579a] flex items-center gap-1 font-medium transition-colors">
            <ArrowLeft size={13} />
            <span>Return to Dashboard</span>
          </Link>
          <span className="font-medium">ISO/IEC 17025 System</span>
        </div>

      </div>
    </div>
  );
}
