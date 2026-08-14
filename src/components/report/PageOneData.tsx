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
    { label: 'SAMPLE RECEIVING DATE', value: data.sampleReceivingDate },
    { label: 'SAMPLE REPORTING DATE', value: data.sampleReportingDate },
    { label: 'CARE LABEL SYMBOLS', value: data.careLabelSymbols },
  ];

  return (
    <div className="flex flex-col w-full text-[12px] font-sans font-medium px-4 mt-6">
      
      {/* Top Label */}
      <div className="font-bold mb-3 uppercase text-[12.5px] tracking-wide">
        SAMPLE SUBMITTED AND DESCRIBED BY CLIENT AS:
      </div>

      {/* Grid Layout */}
      <div className="flex flex-col gap-[3px] w-full">
        {fields.map((field, idx) => (
          <div key={idx} className="flex w-full leading-tight">
            {/* Left Column - 35% */}
            <div className="w-[35%] uppercase tracking-wide">
              {field.label}
            </div>
            
            {/* Right Column - 65% with exactly aligned colon */}
            <div className="w-[65%] flex">
              <span className="mr-2 font-bold">:</span>
              <span className={`uppercase ${field.bold ? 'font-bold' : ''}`}>
                {field.value}
              </span>
            </div>
          </div>
        ))}
        
        {/* Empty row spacing */}
        <div className="h-4"></div>

        {/* Test Result Row */}
        <div className="flex w-full leading-tight">
          <div className="w-[35%] uppercase tracking-wide font-bold">
            TEST RESULT
          </div>
          <div className="w-[65%] flex font-bold">
            <span className="mr-2">:</span>
            <span className="uppercase">PLEASE REFER TO THE NEXT PAGE(S)</span>
          </div>
        </div>

      </div>

      {/* Full width border line ending the section */}
      <div className="w-full border-b-[1.5px] border-black mt-3"></div>

    </div>
  );
}
