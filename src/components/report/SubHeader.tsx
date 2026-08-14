import React from 'react';
import Barcode from 'react-barcode';

interface SubHeaderProps {
  reportNo: string;
  pageNum: number;
  totalPages: number;
}

export default function SubHeader({ reportNo, pageNum, totalPages }: SubHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-4 mt-2">
      <div>
        <div className="font-bold text-[13px] border-b border-black inline-block mb-1 font-sans">ISO/IEC 17025:2017 Accredited Lab</div>
        <div className="font-bold text-2xl tracking-wide font-sans">TEST REPORT</div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 px-2 py-0.5 text-[13px] font-sans">Page # {pageNum} of {totalPages}</div>
          <div className="bg-gray-200 px-2 py-0.5 text-[13px] font-sans font-bold">Report # {reportNo}</div>
        </div>
        {pageNum === 1 && (
          <div className="h-10 w-48 mt-1 overflow-hidden flex justify-end">
             <Barcode value={reportNo} width={1.5} height={40} displayValue={false} margin={0} />
          </div>
        )}
      </div>
    </div>
  );
}
