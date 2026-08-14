import React from 'react';

export default function Header() {
  return (
    <div className="w-full flex items-start justify-between px-10 pt-4 pb-2 relative z-20">
      
      {/* Left side: PNAC Box */}
      <div className="flex flex-col items-center border-[1.5px] border-[#1e3b8a] p-1.5 rounded-lg bg-white shadow-sm" style={{ width: '150px' }}>
        <div className="flex items-center gap-2 mb-1 w-full justify-center">
          <div className="bg-[#007b3b] text-white text-[11px] font-bold px-3 py-1 rounded-[50%] italic flex items-center justify-center" style={{ minWidth: '50px' }}>
            PNAC
          </div>
          <div className="text-[7.5px] font-semibold leading-tight text-center text-gray-800">
            LAB 069<br/>17025
          </div>
        </div>
        <div className="text-[7px] font-bold text-center border-t border-gray-400 w-[95%] pt-1 text-gray-800">
          ISO/IEC 17025:2017 Accredited Lab
        </div>
        <div className="text-[13px] font-black text-center mt-0.5 uppercase tracking-widest text-black">
          TEST REPORT
        </div>
      </div>

      {/* Center/Right side: S.R. LABORATORIES */}
      <div className="flex flex-col items-center pt-2 pr-4">
        {/* We use a specific display font style to match the original closely */}
        <div 
          className="text-[#1e3b8a] font-serif font-black tracking-tighter" 
          style={{ 
            fontSize: '38px', 
            fontFamily: 'Impact, "Arial Black", serif',
            transform: 'scaleY(1.1)',
            textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.1)'
          }}
        >
          S. R. LABORATORIES
        </div>
        <div className="text-[#1e3b8a] text-[9.5px] font-bold tracking-[0.25em] mt-2 ml-1" style={{ fontFamily: 'Arial, sans-serif' }}>
          A COMPREHENSIVE TEXTILE LAB.
        </div>
      </div>

    </div>
  );
}
