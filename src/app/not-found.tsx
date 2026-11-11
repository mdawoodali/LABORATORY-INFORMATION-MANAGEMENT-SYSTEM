"use client";

import React from 'react';
import Link from 'next/link';
import PQSLogoImage from '@/components/report/PQSLogoImage';
import PQSWordmark from '@/components/report/PQSWordmark';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-gray-900">
      <div className="w-full max-w-md bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 text-center relative z-10">
        
        {/* Logo and Wordmark */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-gray-200 flex items-center justify-center p-2.5 shadow-sm mb-3">
            <PQSLogoImage className="w-full h-full object-contain" />
          </div>
          <PQSWordmark className="h-5 sm:h-6 object-contain mb-1" />
        </div>

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800 uppercase tracking-wider mb-4">
          <FileQuestion size={14} className="text-amber-600" />
          <span>Error 404 • Resource Not Found</span>
        </div>

        {/* Heading & Explanation */}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          Page or Document Not Found
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto mb-6">
          The laboratory report, invoice, or page you requested does not exist or may have been relocated. Please verify the URL or return to the dashboard.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#2b579a] hover:bg-[#1e4178] active:scale-[0.99] text-white text-xs font-bold py-3 px-5 rounded-xl shadow-md transition-all"
          >
            <Home size={15} />
            <span>Return to Dashboard</span>
          </Link>

          <Link
            href="/verify/"
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 active:scale-[0.99] text-gray-700 text-xs font-semibold py-3 px-4 rounded-xl transition-all border border-gray-200"
          >
            <Search size={15} />
            <span>Verify Document</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-[10.5px] text-gray-400">
          Precision Quality Services • ISO/IEC 17025 Compliant System
        </div>

      </div>
    </div>
  );
}
