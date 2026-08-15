import React from 'react';

export default function Header({ logoBase64 }: { logoBase64?: string }) {
  return (
    <div className="w-full flex justify-center pb-4">
      {logoBase64 ? (
        <img src={logoBase64} alt="Company Header" className="w-full max-h-[150px] object-contain" />
      ) : (
        <img src="/docx_images/image1.jpeg" alt="Default Header" className="w-full max-h-[150px] object-contain" />
      )}
    </div>
  );
}
