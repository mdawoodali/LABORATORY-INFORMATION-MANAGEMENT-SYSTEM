"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyIndexPage() {
  const [reportNo, setReportNo] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportNo) {
      router.push(`/verify/receipt?id=${reportNo}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center font-sans text-white p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700">
        <h1 className="text-2xl font-bold mb-2 text-center tracking-wider">Verify Receipt</h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          Enter the Report Number from the Barcode to access the secure receipt.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Report Number</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. 519438"
              value={reportNo}
              onChange={(e) => setReportNo(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded shadow transition-all active:scale-95 mt-2"
          >
            Find Receipt
          </button>
        </form>
      </div>
    </div>
  );
}
