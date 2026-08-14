import React from 'react';
import QRCode from 'react-qr-code';

interface SubHeaderProps {
  reportNo: string;
  pageNum: number;
  totalPages: number;
}

export default function SubHeader({ reportNo, pageNum, totalPages }: SubHeaderProps) {
  const verifyUrl = `https://sr-laboratories-nine.vercel.app/verify/${reportNo}`;

  return (
    <div className="absolute right-6 top-[110px] flex flex-col items-end z-20">
      
      {/* Page # and Report # Boxes inline */}
      <div className="flex items-center gap-2 mb-1">
        <div className="bg-[#e5e5e5] px-3 py-0.5 text-[12px] font-serif border border-gray-300 shadow-sm">
          Page # {pageNum} of {totalPages}
        </div>
        <div className="bg-[#e5e5e5] px-3 py-0.5 text-[13px] font-serif font-bold border border-gray-300 shadow-sm">
          Report # {reportNo}
        </div>
      </div>

      {/* QR Code perfectly right aligned below Report # */}
      <div className="flex flex-col items-center pt-1 pr-2">
        <QRCode 
          value={verifyUrl} 
          size={50}
          level="L"
          style={{ height: "auto", maxWidth: "100%", width: "50px" }}
        />
        <span className="text-[8px] font-bold font-sans tracking-[0.1em] text-gray-700 mt-[2px]">SCAN ME</span>
      </div>
      
    </div>
  );
}
