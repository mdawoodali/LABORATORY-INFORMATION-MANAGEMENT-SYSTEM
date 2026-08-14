import React from 'react';

export default function Signature() {
  return (
    <div className="mt-8 flex justify-end w-full mb-2">
      <div className="w-[300px] h-[150px] overflow-hidden relative">
        <img 
          src="/receipt.png" 
          alt="Signature" 
          className="absolute top-[-750px] right-0 w-[800px] max-w-none pointer-events-none" 
        />
      </div>
    </div>
  );
}
