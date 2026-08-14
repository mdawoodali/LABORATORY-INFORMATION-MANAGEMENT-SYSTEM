import React from 'react';
import Barcode from 'react-barcode';

interface SubHeaderProps {
  reportNo: string;
  pageNum: number;
  totalPages: number;
}

export default function SubHeader({ reportNo, pageNum, totalPages }: SubHeaderProps) {
  return (
    <div className="absolute right-10 top-6 flex flex-col items-end z-20">
      
      {/* Page # and Report # Boxes inline */}
      <div className="flex items-center gap-1 mb-1">
        <div className="bg-[#f0f0f0] px-4 py-0.5 text-[9px] font-sans border-[1px] border-gray-300">
          Page {pageNum} of {totalPages}
        </div>
        <div className="bg-[#f0f0f0] px-4 py-0.5 text-[9px] font-sans font-bold border-[1px] border-gray-300">
          Report # {reportNo || "000000"}
        </div>
      </div>

      {/* Barcode perfectly right aligned below Report # */}
      <div className="flex justify-end pt-1 transform scale-75 origin-top-right">
        <Barcode 
          value={reportNo || "000000"} 
          width={1.2}
          height={30}
          displayValue={false}
          margin={0}
          background="transparent"
        />
      </div>
      
    </div>
  );
}
