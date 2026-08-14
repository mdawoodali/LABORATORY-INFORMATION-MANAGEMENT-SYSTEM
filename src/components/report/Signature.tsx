import React from 'react';

export default function Signature() {
  return (
    <div className="flex justify-between items-end px-10 mt-auto pb-6 font-sans" style={{ fontSize: '11px' }}>
      
      {/* Left Disclaimer Text */}
      <div className="flex flex-col text-gray-700 leading-tight" style={{ width: '55%', fontSize: '9px', lineHeight: '1.4' }}>
        <p>This document is issued by the Company under its General Conditions of Services accessible at http: www.srtexlab.com/terms.html.</p>
        <p>Attention is drawn to the limitation of liability, indemnification and jurisdiction issues defined therein.</p>
        <p>Unless otherwise stated the results show in this test report refer only to the sample (s) tested and such sample (s) are retained for 30 days only.</p>
        <p>This document cannot be reproduced except in full, without prior approval of the Company.</p>
      </div>

      {/* Right Signature Area */}
      <div className="flex flex-col items-center" style={{ width: '35%' }}>
        <div className="text-center mb-6" style={{ fontSize: '11px' }}>
          Signed for and on behalf of<br/>
          S. R. Laboratories ( Pvt. ) Ltd.
        </div>
        
        {/* Signature image from DOCX */}
        <img src="/docx_images/image2.png" alt="Signature" className="h-[50px] w-auto object-contain mb-1 opacity-90 mix-blend-multiply" />

        <div className="text-center font-bold underline" style={{ fontSize: '12px' }}>
          Zulfiqar Ali
        </div>
        <div className="font-bold text-center" style={{ fontSize: '12px' }}>
          Lab. Manager
        </div>
      </div>

    </div>
  );
}
