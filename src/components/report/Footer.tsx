import React from 'react';

export default function Footer() {
  return (
    <div className="absolute bottom-[10px] left-0 right-0 z-20 flex flex-col items-center">
      
      {/* Top thin line */}
      <div className="w-[90%] border-t-[0.5px] border-[#1e3b8a] mb-0.5"></div>
      
      {/* Bottom line */}
      <div className="w-[90%] border-t-[1.5px] border-[#1e3b8a] mb-1"></div>

      <div className="flex w-[90%] justify-between items-center pb-2 px-1">
        <div className="text-[#1e3b8a] font-serif font-bold text-[10px] uppercase tracking-wide">
          S. R. LABORATORIES (PVT.) LIMITED
        </div>
        
        <div className="flex items-center gap-2">
          {/* Very thin vertical divider */}
          <div className="h-[20px] border-l-[0.5px] border-black"></div>
          
          <div className="text-gray-800 text-[6.5px] font-sans leading-[1.2]">
            First Floor, S.P. Chamber Opp. S.I.T.E. Post Office S.I.T.E. Karachi Pakistan.<br />
            Ph: +92-21-32551701-3 Cell: +92 300-8236361, 0301-8270373<br />
            E-mail: info@srtexlab.com URL : www.srtexlab.com
          </div>
        </div>
      </div>

    </div>
  );
}
