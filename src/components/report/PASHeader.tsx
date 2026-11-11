"use client";

import React from 'react';
import QRCode from 'react-qr-code';
import PQSLogoImage from './PQSLogoImage';
import PQSWordmark from './PQSWordmark';

export interface PASHeaderProps {
  reportNo: string;
  reportingDate: string;
  onReportingDateChange?: (date: string) => void;
  seal?: string;
  password?: string;
}

const convertDate = (d: string) => {
  if (!d) return '';
  const p = d.split('-');
  if (p.length !== 3) return d;
  return `${p[2]}-${p[1]}-${p[0]}`;
};

export default function PASHeader({
  reportNo,
  reportingDate,
  onReportingDateChange,
  seal,
  password
}: PASHeaderProps) {
  const pwdParam = password ? `&pwd=${encodeURIComponent(password)}` : '';
  const sealParam = seal ? `&seal=${seal}` : '';
  const verifyUrl = `https://limsreportgenerator.vercel.app/verify/receipt?id=${reportNo}${sealParam}${pwdParam}`;

  return (
    <div className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4 px-10 pt-6">
      <div className="flex items-center gap-3 shrink-0">
        <PQSLogoImage className="w-[90px] h-[90px] object-contain" />
        <div className="flex flex-col">
          <PQSWordmark className="mb-2" />
          <div className="text-xs text-gray-500 mt-1">
            R-332/9, Dastagir, F.B Area, Karachi, 75950.
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Contact: 03322673373
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Email: precisionqualityserviceslabs@gmail.com
          </div>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end">
        <div className="flex items-start mb-4">
          <div className="flex flex-col items-center mr-4 mt-1">
            <QRCode 
              value={verifyUrl} 
              size={40}
              level="M"
            />
            <span className="text-[7px] mt-0.5 text-gray-500 font-bold uppercase tracking-wider">Scan Me</span>
            {seal && <span className="text-[6.5px] text-gray-400 font-mono tracking-tighter mt-0.5">{seal}</span>}
          </div>
          <div className="text-2xl font-bold tracking-wider text-gray-800 border border-gray-800 px-4 py-1">
            REPORT
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="font-bold w-20 text-right whitespace-nowrap">Report #:</span>
          <span className="w-28 text-left border-b border-gray-400">{reportNo}</span>
        </div>
        <div className="flex gap-2 text-sm mt-1">
          <span className="font-bold w-20 text-right whitespace-nowrap">Report Date:</span>
          {onReportingDateChange ? (
            <label className="w-28 text-left border-b border-gray-400 relative cursor-pointer block">
              {reportingDate}
              <input 
                type="date"
                data-html2canvas-ignore="true"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full no-print"
                value={convertDate(reportingDate)}
                onChange={(e) => onReportingDateChange(convertDate(e.target.value))}
              />
            </label>
          ) : (
            <span className="w-28 text-left border-b border-gray-400">{reportingDate}</span>
          )}
        </div>
      </div>
    </div>
  );
}
