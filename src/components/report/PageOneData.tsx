import React from 'react';
import { ReportFormData } from '@/types';

interface PageOneDataProps {
  data: ReportFormData;
}

export default function PageOneData({ data }: PageOneDataProps) {
  const fields = [
    { label: 'APPLICANT', value: data.applicant, bold: true },
    { label: 'ADDRESS', value: data.address },
    { label: 'PHONE #', value: data.phone },
    { label: 'SAMPLE DESCRIPTION', value: data.sampleDescription },
    { label: 'SAMPLE', value: data.sample },
    { label: 'SHAPE', value: data.shape },
    { label: 'SAMPLE DATE', value: data.sampleDate },
    { label: 'ORDER NO.', value: data.orderNo },
    { label: 'COLOR', value: data.color },
    { label: 'SIZE', value: data.size },
    { label: 'FABRIC CONSTRUCTION', value: data.fabricConstruction },
    { label: 'FABRIC WEIGHT', value: data.fabricWeight },
    { label: 'FIBRE CONTENT', value: data.fibreContent },
    { label: 'END USE', value: data.endUse },
    { label: 'BUYER NAME', value: data.buyerName },
    { label: 'BUYING HOUSE', value: data.buyingHouse },
    { label: 'MANUFACTURER', value: data.manufacturer },
    { label: 'PREVIOUS REPORT #', value: data.previousReportNo },
    { label: 'SAMPLE RECEIVING  DATE ', value: data.sampleReceivingDate },
    { label: 'SAMPLE REPORTING DATE', value: data.sampleReportingDate },
    { label: 'CARE LABEL SYMBOLS', value: data.careLabelSymbols },
  ];

  return (
    <div className="flex flex-col w-full font-sans px-12 mt-2" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      
      {/* Top Label */}
      <div className="font-bold mb-[6px] uppercase text-[11px] tracking-wide text-black">
        SAMPLE SUBMITTED AND DESCRIBED BY CLIENT AS:
      </div>

      {/* Field Rows - matching DOCX exactly */}
      <div className="flex flex-col w-full">
        {fields.map((field, idx) => (
          <div key={idx} className="flex w-full" style={{ lineHeight: '1.25' }}>
            {/* Label column - fixed width to align all colons */}
            <div className="uppercase font-bold shrink-0 text-[10px] text-black" style={{ width: '185px' }}>
              {field.label}
            </div>
            
            {/* Colon */}
            <div className="font-bold shrink-0 mr-2 text-[10px] text-black">:</div>
            
            {/* Value */}
            <div className={`text-[10px] text-black ${field.bold ? 'font-bold' : ''}`}>
              {field.value || '-'}
            </div>
          </div>
        ))}
        
        {/* Spacer */}
        <div style={{ height: '14px' }}></div>

        {/* TEST RESULT row */}
        <div className="flex w-full" style={{ lineHeight: '1.25' }}>
          <div className="uppercase font-bold shrink-0 text-[10px] text-black" style={{ width: '185px' }}>
            TEST RESULT
          </div>
          <div className="font-bold shrink-0 mr-2 text-[10px] text-black">:</div>
          <div className="font-bold uppercase text-[10px] text-black tracking-wide">PLEASE REFER TO THE NEXT PAGE(S)</div>
        </div>
      </div>
    </div>
  );
}
