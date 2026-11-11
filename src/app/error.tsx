"use client";

import React, { useEffect } from 'react';
import PQSLogoImage from '@/components/report/PQSLogoImage';
import { RefreshCw, Home, AlertOctagon } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("LIMS Application Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-gray-900">
      <div className="w-full max-w-md bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 text-center relative z-10">
        
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-gray-200 flex items-center justify-center p-2.5 shadow-sm">
            <PQSLogoImage className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Error Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-xs font-bold text-red-800 uppercase tracking-wider mb-4">
          <AlertOctagon size={14} className="text-red-600" />
          <span>Application Notice</span>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-black text-gray-900 tracking-tight mb-2">
          An Unexpected Error Occurred
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto mb-6">
          The system encountered an unexpected state while processing this operation. Your saved reports and local database are safe.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-[#2b579a] hover:bg-[#1e4178] active:scale-[0.99] text-white text-xs font-bold py-3 px-5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 active:scale-[0.99] text-gray-700 text-xs font-semibold py-3 px-4 rounded-xl transition-all border border-gray-200 cursor-pointer"
          >
            <Home size={14} />
            <span>Return to Dashboard</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-[10.5px] text-gray-400">
          Precision Quality Services • ISO/IEC 17025 System
        </div>

      </div>
    </div>
  );
}
