import React from 'react';

export default function Footer() {
  return (
    <div className="mt-auto pt-6 pb-2 text-[10px] text-slate-600 border-t-2 border-slate-300 font-sans leading-tight">
      <p className="mb-1">This document is issued by the Company under its General Conditions of Services accessible at http: www.srtexlab.com/terms.html.</p>
      <p className="mb-1">Attention is drawn to the limitation of liability, indemnification and jurisdiction issues defined therein.</p>
      <p className="mb-1">Unless otherwise stated the results show in this test report refer only to the sample (s) tested and such sample (s) are retained for 30 days only.</p>
      <p>This document cannot be reproduced except in full, without prior approval of the Company.</p>
      
      <div className="border-t-[3px] border-slate-800 mt-4 pt-3 flex items-center justify-center text-center pb-2 w-[90%] mx-auto">
        <div className="text-blue-900 font-serif font-bold text-[19px] w-1/3 text-left tracking-wide" style={{ textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.2)' }}>
          S. R. LABORATORIES (PVT.) LIMITED
        </div>
        <div className="text-[11px] text-slate-700 leading-[1.3] border-l-2 border-slate-500 pl-4 text-left flex-1 ml-4 font-sans font-bold">
          First Floor S.P. Chamber Opp. S.I.T.E. Post Office S.I.T.E. Karachi Pakistan.<br/>
          Ph: +92-21-32551701-3 Cell: +92 300-8236361, 0321-8270373<br/>
          E-mail: info@srtexlab.com URL: www.srtexlab.com
        </div>
      </div>
    </div>
  );
}
