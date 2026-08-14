import React from 'react';

export default function Signature() {
  return (
    <div className="mt-8 flex justify-end pb-8 border-b-2 border-black w-[90%] mx-auto">
      <div className="w-64 flex flex-col items-center">
        {/* Synthetic Signature SVG matching the Manager */}
        <div className="h-24 w-full relative -mb-4 flex items-center justify-center opacity-80 mix-blend-multiply">
           <svg viewBox="0 0 100 100" className="w-32 h-24 stroke-blue-900 fill-transparent stroke-[1.5]">
             <path d="M 20 60 Q 30 10, 50 40 T 80 70 M 45 30 L 55 90 M 35 50 Q 80 30, 90 70 M 25 70 L 35 20 L 45 80" strokeLinecap="round" strokeLinejoin="round" />
           </svg>
        </div>
        <div className="text-center text-[12px] font-serif mb-6 leading-tight">
          Signed for and on behalf of<br/>
          S. R. Laboratories ( Pvt. ) Ltd.
        </div>
        <div className="w-full font-bold text-[14px] border-b-2 border-black inline-block text-center mb-1 pb-1 font-sans">
          Zulfiqar Ali
        </div>
        <div className="font-bold text-[14px] font-sans">
          Lab. Manager
        </div>
      </div>
    </div>
  );
}
