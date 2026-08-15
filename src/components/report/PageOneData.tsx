import React from 'react';
import { ReportFormData, migrateToDynamicFields } from '@/types';

interface PageOneDataProps {
  data: ReportFormData;
}

export default function PageOneData({ data }: PageOneDataProps) {
  const fields = migrateToDynamicFields(data);

  return (
    <div className="flex flex-col w-full font-sans px-10 mt-2" style={{ fontSize: '11.5px' }}>
      
      {/* Top Label */}
      <div className="font-bold mb-2 uppercase" style={{ fontSize: '11.5px', letterSpacing: '0.02em' }}>
        SAMPLE SUBMITTED AND DESCRIBED BY CLIENT AS:
      </div>

      {/* Field Rows - matching DOCX exactly */}
      <div className="flex flex-col w-full">
        {fields.map((field, idx) => (
          <div key={idx} className="flex w-full" style={{ lineHeight: '1.65' }}>
            {/* Label column - fixed width to align all colons */}
            <div className="uppercase font-bold shrink-0" style={{ width: '220px' }}>
              {field.label}
            </div>
            
            {/* Colon */}
            <div className="font-bold shrink-0 mr-1">:</div>
            
            {/* Value */}
            <div className={field.bold ? 'font-bold' : ''}>
              {field.value || '-'}
            </div>
          </div>
        ))}
        
        {/* Spacer */}
        <div style={{ height: '8px' }}></div>

        {/* TEST RESULT row */}
        <div className="flex w-full" style={{ lineHeight: '1.65' }}>
          <div className="uppercase font-bold shrink-0" style={{ width: '220px' }}>
            TEST RESULT
          </div>
          <div className="font-bold shrink-0 mr-1">:</div>
          <div className="font-bold uppercase">PLEASE REFER TO THE NEXT PAGE(S)</div>
        </div>
      </div>
    </div>
  );
}
