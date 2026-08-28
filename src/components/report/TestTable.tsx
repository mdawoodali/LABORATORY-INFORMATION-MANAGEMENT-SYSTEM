import React from 'react';
import { TestRow, ReportFormData } from '@/types';

export default function TestTable({ tests, data }: { tests: TestRow[], data: ReportFormData }) {
  return (
    <div className="flex flex-col px-10 pt-4 font-sans" style={{ fontSize: '14px' }}>
      
      {/* Test Conducted / Sample Details */}
      <div className="mb-4">
        <div className="flex" style={{ lineHeight: '2' }}>
          <span className="font-bold underline" style={{ width: '130px' }}>Test Conducted</span>
          <span className="font-bold">:</span>
        </div>
        <div className="mt-1">
          <span className="font-bold underline">Sample  Details</span>
          <span className="font-bold ml-1">:</span>
        </div>
        <div className="mt-0.5" style={{ lineHeight: '2' }}>
          {data.sampleDetails}
        </div>
      </div>

      {/* Footer text above table */}
      <div className="border border-black inline-block px-2 py-0.5 mb-0 font-bold" style={{ fontSize: '11px', width: 'fit-content' }}>
        {data.footerText || "Average readings are reported."}
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse text-center mt-2" style={{ fontSize: '15px' }}>
        <thead>
          <tr>
            <th className="border border-black px-2 py-6 font-bold text-center" style={{ width: '25%' }}>{data.tableHeader1 || 'Test'}</th>
            <th className="border border-black px-2 py-6 font-bold text-center" style={{ width: '20%' }}>{data.tableHeader2 || 'Test Method'}</th>
            <th className="border border-black px-2 py-6 font-bold text-center" style={{ width: '15%' }}>{data.tableHeader3 || 'Value'}</th>
            <th className="border border-black px-2 py-6 font-bold text-center" style={{ width: '15%' }}>{data.tableHeader4 || 'Unit'}</th>
            <th className="border border-black px-2 py-6 font-bold text-center" style={{ width: '25%' }}>{data.tableHeader5 || 'Result'}</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test, idx) => (
            <tr key={test.id || idx}>
              <td className="border border-black px-2 py-6 text-center whitespace-pre-wrap">{test.test || '-'}</td>
              <td className="border border-black px-2 py-6 text-center">{test.method || '-'}</td>
              <td className="border border-black px-2 py-6 text-center">{test.value || '-'}</td>
              <td className="border border-black px-2 py-6 text-center">{test.unit || '-'}</td>
              <td className="border border-black px-2 py-6 text-center">{test.result || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Remarks */}
      {data.remarks && (
        <div className="mt-4 text-[13px]">
          <span className="font-bold mr-2">Remarks:</span>
          <span className="font-bold underline underline-offset-[3px] decoration-solid">{data.remarks}</span>
        </div>
      )}

      {/* End of Report Marker */}
      <div className="w-full flex items-center justify-center mt-12 mb-4">
        <div className="flex-1 border-b-[1.5px] border-black mr-4"></div>
        <div className="font-bold tracking-widest text-gray-800 whitespace-nowrap text-[16px]">
          END OF REPORT
        </div>
        <div className="flex-1 border-b-[1.5px] border-black ml-4"></div>
      </div>

    </div>
  );
}
