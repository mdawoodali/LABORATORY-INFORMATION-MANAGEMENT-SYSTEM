import React from 'react';
import { ReportFormData } from '@/types';

export default function PageOneData({ data }: { data: ReportFormData }) {
  return (
    <>
      <div className="mb-4">
        <span className="font-semibold text-sm font-sans">SAMPLE SUBMITTED AND DESCRIBED BY CLIENT AS:</span>
      </div>

      <div className="flex-1 text-[13px] leading-[1.3] grid grid-cols-[220px_auto] gap-y-1 font-serif uppercase tracking-wide">
        <div className="font-bold">APPLICANT</div><div className="font-bold">: {data.applicant}</div>
        <div className="font-bold">ADDRESS</div><div>: {data.address}</div>
        <div className="font-bold">PHONE #</div><div>: {data.phone}</div>
        <div className="font-bold">SAMPLE DESCRIPTION</div><div>: {data.sampleDescription}</div>
        <div className="font-bold">SAMPLE</div><div>: {data.sample}</div>
        <div className="font-bold">SHAPE</div><div>: {data.shape}</div>
        <div className="font-bold">SAMPLE DATE</div><div>: {data.sampleDate}</div>
        <div className="font-bold">ORDER NO.</div><div>: {data.orderNo}</div>
        <div className="font-bold">COLOR</div><div>: {data.color}</div>
        <div className="font-bold">SIZE</div><div>: {data.size}</div>
        <div className="font-bold">FABRIC CONSTRUCTION</div><div>: {data.fabricConstruction}</div>
        <div className="font-bold">FABRIC WEIGHT</div><div>: {data.fabricWeight}</div>
        <div className="font-bold">FIBRE CONTENT</div><div>: {data.fibreContent}</div>
        <div className="font-bold">END USE</div><div>: {data.endUse}</div>
        <div className="font-bold">BUYER NAME</div><div>: {data.buyerName}</div>
        <div className="font-bold">BUYING HOUSE</div><div>: {data.buyingHouse}</div>
        <div className="font-bold">MANUFACTURER</div><div>: {data.manufacturer}</div>
        <div className="font-bold">PREVIOUS REPORT #</div><div>: {data.previousReportNo}</div>
        <div className="font-bold">SAMPLE RECEIVING DATE</div><div>: {data.sampleReceivingDate}</div>
        <div className="font-bold">SAMPLE REPORTING DATE</div><div>: {data.sampleReportingDate}</div>
        <div className="font-bold">CARE LABEL SYMBOLS</div><div>: {data.careLabelSymbols}</div>
        
        <div className="col-span-2 h-4"></div>
        
        <div className="font-bold">TEST RESULT</div><div>: PLEASE REFER TO THE NEXT PAGE(S)</div>
      </div>
    </>
  );
}
