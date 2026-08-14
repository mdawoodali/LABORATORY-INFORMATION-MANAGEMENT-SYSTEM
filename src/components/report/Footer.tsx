import React from 'react';

export default function Footer() {
  return (
    <div className="flex items-center justify-between w-full mt-2 pt-1 border-t-0 font-sans">
      
      {/* Left Blue Title */}
      <div className="w-[45%] text-left">
        <div className="font-gothic text-[22px] text-blue-900 leading-none tracking-widest font-medium" style={{ WebkitTextStroke: '0.2px #1E3A8A' }}>
          S. R. LABORATORIES <span className="text-[14px]">(PVT.) LIMITED</span>
        </div>
      </div>

      {/* Crosshair divider */}
      <div className="border-l-[1.5px] border-black h-12 mx-2"></div>

      {/* Right Contact Info */}
      <div className="w-[50%] flex flex-col text-[10px] text-gray-800 font-bold leading-[1.3] pl-2">
        <div>First Floor S.P. Chamber Opp. S.I.T.E. Post Office S.I.T.E. Karachi Pakistan.</div>
        <div>Ph: +92-21-32551701-3 Cell: +92 300-8236361, 0321-8270373</div>
        <div>E-mail: info@srtexlab.com URL : www.srtexlab.com</div>
      </div>
      
    </div>
  );
}
