"use client";

import React, { useState, useEffect } from 'react';
import PQSWordmark from '@/components/report/PQSWordmark';
import PQSLogoImage from '@/components/report/PQSLogoImage';

export default function PQSLetterheadPage() {
  const [isClient, setIsClient] = useState(false);
  const [date, setDate] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

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
      <div className="no-print mb-4 text-gray-500 text-sm bg-white p-4 rounded shadow max-w-lg w-full">
        <p>💡 <b>How to use:</b></p>
        <ul className="list-disc pl-5 mt-2">
          <li>Click anywhere inside the text to edit it (like the Date or Body text).</li>
          <li>Press <b>Ctrl + P</b> (or Cmd + P) to print or save as a PDF.</li>
        </ul>
      </div>

      <div 
        className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl shrink-0 border border-gray-300 mx-auto" 
        style={{ width: '210mm', height: '297mm' }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <PQSLogoImage className="object-contain" style={{ width: '60%', opacity: 0.08 }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          
          {/* Header */}
          <div className="relative flex justify-center items-start mb-6 border-b-2 border-gray-800 pb-4 px-10 pt-6 z-10">

            {/* Centered Logo Stack */}
            <div className="flex flex-col items-center gap-2 mx-auto">
              <PQSLogoImage style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              <PQSWordmark style={{ height: '26px', width: '252px', objectFit: 'contain' }} />
              <div className="text-xs text-gray-500" contentEditable suppressContentEditableWarning>Providing Consultancy Service to Textile Industries</div>
            </div>

            {/* Date field, top right, in place of the old Ref # field */}
            <div className="absolute top-6 right-10 flex gap-2 text-sm">
              <span className="font-bold whitespace-nowrap">Date:</span>
              <input 
                type="text" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-36 text-left border-b border-gray-400 bg-transparent outline-none font-normal"
              />
            </div>
          </div>

          {/* Body */}
          <div 
            className="flex-1 px-10 outline-none relative z-10 mt-4 text-sm text-gray-800 whitespace-pre-wrap"
            contentEditable
            suppressContentEditableWarning
          >
            Type your letter or report content here...
          </div>

          {/* Footer */}
          <div className="w-full flex flex-col items-center mt-auto pb-8 relative z-10">
            <div className="w-[90%] flex justify-between border-t border-gray-400 pt-3 text-xs text-gray-500">
              <span contentEditable suppressContentEditableWarning>R-332/9, Dastagir, F.B Area, Karachi, 75950.</span>
              <span contentEditable suppressContentEditableWarning>03322673373 | 03333769174</span>
              <span contentEditable suppressContentEditableWarning>precisionqualityserviceslabs@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
