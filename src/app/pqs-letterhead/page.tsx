"use client";

import React, { useState } from 'react';
import PQSWordmark from '@/components/report/PQSWordmark';
import PQSLogoImage from '@/components/report/PQSLogoImage';

export default function PQSLetterheadPage() {
  const [refNo, setRefNo] = useState('');
  const [date, setDate] = useState('');

  return (
    <div className="bg-gray-100 flex flex-col items-center py-10 font-sans min-h-screen">
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print { display: none !important; }
          .a4-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
          }
        }
      `}} />
      <div className="no-print mb-6 text-gray-600 text-sm bg-white p-5 rounded-lg shadow-sm border border-gray-200 max-w-lg w-full">
        <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="text-xl">💡</span> How to use:
        </p>
        <ul className="list-disc pl-8 space-y-1">
          <li>Click anywhere inside the text to edit it (like the Ref #, Date, or Body text).</li>
          <li>Press <b>Ctrl + P</b> (or Cmd + P) to print or save as a PDF.</li>
        </ul>
      </div>

      <div 
        className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl shrink-0 border border-gray-300 mx-auto" 
        style={{ width: '210mm', height: '297mm' }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.05]">
          <PQSLogoImage className="w-[600px] h-[600px] object-contain" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          
          {/* Header */}
          <div className="flex justify-between items-start px-10 pt-10 pb-4">
            <div className="flex gap-4 items-center">
              {/* Blue Logo Box */}
              <div className="w-[105px] h-[105px] bg-[#0d1c33] rounded-[20px] flex items-center justify-center shrink-0">
                <PQSLogoImage className="w-[80px] h-[80px] object-contain invert brightness-0" />
              </div>
              {/* Wordmark and Tagline */}
              <div className="flex flex-col justify-center">
                <PQSWordmark className="mb-1" style={{ height: '32px', width: 'auto' }} />
                <span className="text-[#555] text-[13.5px] font-medium tracking-wide">
                  Providing Consultancy Services to Textile Industries
                </span>
              </div>
            </div>

            {/* Ref and Date */}
            <div className="flex flex-col gap-4 mt-4 text-[14px] font-bold text-gray-900">
              <div className="flex items-end gap-2">
                <span className="w-12 text-right pb-[2px]">Ref #:</span>
                <input 
                  type="text" 
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="border-b border-gray-400 bg-transparent outline-none w-56 px-1 font-normal pb-[2px]"
                />
              </div>
              <div className="flex items-end gap-2">
                <span className="w-12 text-right pb-[2px]">Date:</span>
                <input 
                  type="text" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-b border-gray-400 bg-transparent outline-none w-56 px-1 font-normal pb-[2px]"
                />
              </div>
            </div>
          </div>

          <div className="w-full h-[2px] bg-[#1a202c] mb-12"></div>

          {/* Body */}
          <div 
            className="flex-1 px-12 outline-none whitespace-pre-wrap font-sans text-gray-800 text-[15px] leading-relaxed"
            contentEditable
            suppressContentEditableWarning
          >
            Click here to start typing your letter...
          </div>

          {/* Footer */}
          <div className="px-12 pb-8 mt-auto">
            <div className="w-full h-[1px] bg-gray-400 mb-3"></div>
            <div className="flex justify-between items-center text-[12px] text-gray-600 font-medium tracking-wide">
              <div>R-332/9, Dastagir, F.B Area, Karachi, 75950.</div>
              <div>03322673373 | 03333769174</div>
              <div>precisionqualityserviceslabs@gmail.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
