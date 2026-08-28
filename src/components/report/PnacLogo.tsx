import React from 'react';

export default function PnacLogo() {
  return (
    <div className="absolute top-[-25px] left-8 bg-white border-2 border-black rounded-xl flex items-center h-16 w-64 shadow-sm">
      
      {/* Left PNAC Section */}
      <div className="w-1/2 flex flex-col items-center justify-center h-full pt-1 px-2 border-r-[2px] border-black relative">
        <div className="bg-green-800 text-white font-sans font-bold italic px-4 py-0.5 rounded-full text-[14px] z-10 relative">
          PNAC
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full text-green-800 opacity-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
           <ellipse cx="50" cy="50" rx="42" ry="24" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div className="text-[6.5px] text-center mt-0.5 text-black font-sans leading-tight">
          Pakistan National Accreditation<br/>Council
        </div>
      </div>

      {/* Right LAB Section */}
      <div className="w-1/2 flex flex-col items-center justify-center h-full">
        <div className="font-sans font-bold text-[12px] text-black">LAB 089</div>
        <div className="font-sans font-bold text-[12px] text-black">17025</div>
      </div>

    </div>
  );
}
