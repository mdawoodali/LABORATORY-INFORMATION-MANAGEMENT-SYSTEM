import React from 'react';

export default function Header() {
  return (
    <div className="flex justify-between items-start border-b-[3px] border-black pb-2 mb-4 mt-2 font-sans w-[90%] mx-auto">
      <div className="flex items-center gap-4">
        {/* Synthetic PNAC Logo */}
        <div className="border-[3px] border-green-800 rounded-lg p-2 w-44 flex flex-col items-center justify-center bg-white relative">
          <div className="bg-green-800 text-white font-bold px-5 py-1 rounded-full text-lg z-10 relative">PNAC</div>
          <svg className="absolute inset-0 w-full h-full text-green-800 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
             <ellipse cx="50" cy="50" rx="48" ry="30" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div className="text-[9px] text-center mt-1 text-slate-800 font-bold leading-tight font-sans">Pakistan National Accreditation Council</div>
        </div>
        
        <div className="flex flex-col border-2 border-slate-500 p-2 text-center ml-2 bg-white min-w-[80px]">
          <span className="font-bold text-[13px]">LAB 089</span>
          <span className="font-bold text-[13px]">17025</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center flex-1 mx-4 mt-1">
        <h1 className="text-[34px] font-bold text-blue-900 tracking-wide font-serif" style={{ textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.5)' }}>
          S. R. LABORATORIES
        </h1>
        <p className="text-[14px] tracking-widest font-bold mt-1 text-slate-800 font-serif italic">
          A COMPREHENSIVE TEXTILE LAB.
        </p>
      </div>

      <div className="flex flex-col items-end text-[11px] font-bold text-slate-700 w-32 mt-1">
        <div>Lab\04\001</div>
        <div>Issue - 5</div>
      </div>
    </div>
  );
}
