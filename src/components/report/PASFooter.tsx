"use client";

import React from 'react';

export interface PASFooterProps {
  pageNum: number;
  totalPages: number;
  seal?: string;
}

export default function PASFooter({ pageNum, totalPages, seal }: PASFooterProps) {
  return (
    <div className="absolute bottom-10 left-0 w-full flex flex-col items-center">
      <div className="w-[85%] flex justify-between items-center border-t border-gray-400 pt-3 text-xs text-gray-500">
        <div className="flex flex-col text-left">
          <span className="italic tracking-wide">This is a computer generated document and doesn&apos;t need a signature.</span>
          {seal && (
            <span className="text-[9px] text-gray-400 font-mono mt-0.5">
              Digital Integrity Seal: {seal} • ISO/IEC 17025 Compliant Electronic Audit Trail
            </span>
          )}
        </div>
        <span className="font-bold text-gray-700">Page {pageNum}/{totalPages}</span>
      </div>
    </div>
  );
}
