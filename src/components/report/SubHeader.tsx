import React from 'react';
import Barcode from 'react-barcode';

interface SubHeaderProps {
  reportNo: string;
  pageNum: number;
  totalPages: number;
}

export default function SubHeader({ reportNo, pageNum, totalPages }: SubHeaderProps) {
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

      {/* Barcode perfectly right aligned below Report # */}
      <div className="h-10 overflow-hidden flex justify-end">
        <Barcode 
          value={reportNo} 
          width={1} 
          height={30} 
          displayValue={false} 
          background="transparent" 
          lineColor="#000" 
          margin={0} 
        />
      </div>
      
    </div>
  );
}
