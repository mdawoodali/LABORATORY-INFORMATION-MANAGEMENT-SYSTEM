import React from 'react';

export default function Header() {
  return (
    <div className="w-full h-[140px] overflow-hidden relative mb-4">
      {/* We use the original receipt image and slice it using CSS to guarantee 100% pixel perfection */}
      <img 
        src="/receipt.png" 
        alt="S.R. Laboratories Header" 
        className="absolute top-0 left-0 w-full object-cover object-top h-[1100px] pointer-events-none" 
      />
    </div>
  );
}
