import React from 'react';

export default function Header() {
  return (
    <div className="w-full flex justify-center pb-4 shrink-0" style={{ height: '166px' }}>
      {/* 
        The overlay image has been removed because it was rendering on top of the background frame template.
        We keep this empty div to maintain the exact same vertical spacing (150px image + 16px pb-4) 
        so the rest of the PDF content doesn't shift upwards.
      */}
    </div>
  );
}
