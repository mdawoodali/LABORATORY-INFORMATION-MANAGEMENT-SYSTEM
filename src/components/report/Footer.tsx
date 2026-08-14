import React from 'react';

export default function Footer() {
  return (
    <div className="mt-auto w-full h-[150px] overflow-hidden relative">
      <img 
        src="/receipt.png" 
        alt="S.R. Laboratories Footer" 
        className="absolute bottom-0 left-0 w-full object-cover object-bottom h-[1100px] pointer-events-none" 
      />
    </div>
  );
}
