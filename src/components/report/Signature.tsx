import React from 'react';

export default function Signature() {
  return (
    <div className="flex justify-between items-end px-6 mt-auto pb-4">
      
      {/* Left Disclaimer Text */}
      <div className="flex flex-col text-[10px] text-gray-700 leading-tight w-[60%]">
        <p>This document is issued by the Company under its General Conditions of Services accessible at http: www.srtexlab.com/terms.html.</p>
        <p>Attention is drawn to the limitation of liability, indemnification and jurisdiction issues defined therein.</p>
        <p>Unless otherwise stated the results show in this test report refer only to the sample (s) tested and such sample (s) are retained for 30 days only.</p>
        <p>This document cannot be reproduced except in full, without prior approval of the Company.</p>
      </div>

      {/* Right Signature Area */}
      <div className="w-[30%] flex flex-col items-center relative">
        <div className="text-[12px] font-sans text-center z-10 w-full mb-8">
          Signed for and on behalf of<br/>
          S. R. Laboratories ( Pvt. ) Ltd.
        </div>
        
        {/* Synthetic script signature to look like black ink */}
        <div className="absolute top-8 w-full flex justify-center opacity-80 mix-blend-multiply z-0">
          <svg viewBox="0 0 150 60" className="w-32 h-16 stroke-black fill-transparent stroke-[1.5]">
            <path d="M 20 40 Q 30 10, 50 30 T 80 50 M 45 20 L 55 60 M 35 30 Q 80 20, 90 50 M 25 50 L 35 10 L 45 60" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="w-full text-center text-[13px] font-bold font-sans underline z-10 relative">
          Zulfiqar Ali
        </div>
        <div className="text-[13px] font-bold font-sans z-10 relative">
          Lab. Manager
        </div>
      </div>

    </div>
  );
}
