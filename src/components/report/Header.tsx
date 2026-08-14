import React from 'react';

export default function Header() {
  return (
    <div className="relative w-full flex flex-col items-center justify-center pt-2 pb-2">
      
      {/* Absolute Issue block Top Right */}
      <div className="absolute top-0 right-2 text-right text-[10px] font-sans font-bold text-gray-700 leading-tight">
        <div>Lab\04\001</div>
        <div>Issue - 5</div>
      </div>

      {/* Main Title Area */}
      <div className="flex flex-col items-center z-10 w-full pl-32">
        <h1 className="font-gothic text-[44px] text-blue-900 tracking-widest leading-none font-medium" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.4)', WebkitTextStroke: '0.5px #1E3A8A' }}>
          S. R. LABORATORIES
        </h1>
        <div className="font-sans font-bold italic text-[14px] text-slate-800 tracking-widest mt-1">
          A COMPREHENSIVE TEXTILE LAB.
        </div>
      </div>

    </div>
  );
}
