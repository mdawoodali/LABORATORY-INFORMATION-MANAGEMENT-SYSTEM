import React from 'react';
import { TestRow, ReportFormData } from '@/types';

export default function TestTable({ tests, data }: { tests: TestRow[], data: ReportFormData }) {
  return (
    <div className="flex flex-col px-10 pt-4 font-sans" style={{ fontSize: '12px' }}>
      
      {/* Test Conducted / Sample Details */}
      <div className="mb-4">
        <div className="flex" style={{ lineHeight: '1.6' }}>
          <span className="font-bold underline" style={{ width: '130px' }}>Test Conducted</span>
          <span className="font-bold">:</span>
        </div>
        <div className="mt-1">
          <span className="font-bold underline">Sample  Details</span>
          <span className="font-bold ml-1">:</span>
        </div>
        <div className="mt-0.5" style={{ lineHeight: '1.5' }}>
          {data.sampleDetails}
        </div>
      </div>

      {/* Footer text above table */}
      <div className="border border-black inline-block px-2 py-0.5 mb-0 font-bold" style={{ fontSize: '11px', width: 'fit-content' }}>
        {data.footerText}
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse text-center" style={{ fontSize: '12px' }}>
        <thead>
          <tr>
            <th className="border border-black p-1.5 font-bold text-center" style={{ width: '30%' }}>{data.tableHeader1}</th>
            <th className="border border-black p-1.5 font-bold text-center" style={{ width: '18%' }}>{data.tableHeader2}</th>
            <th className="border border-black p-1.5 font-bold text-center" style={{ width: '27%' }}>{data.tableHeader3}</th>
            <th className="border border-black p-1.5 font-bold text-center" style={{ width: '25%' }}>{data.tableHeader4}</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test, idx) => (
            <tr key={test.id || idx}>
              <td className="border border-black p-1.5 text-center whitespace-pre-wrap">{test.test}</td>
              <td className="border border-black p-1.5 text-center">{test.unit}</td>
              <td className="border border-black p-1.5 text-center">{test.standard}</td>
              <td className="border border-black p-1.5 text-center">{test.result}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* End of Report */}
      <div className="flex items-center w-full mt-8">
        <div className="border-b border-black flex-1"></div>
        <div className="font-bold pl-3" style={{ fontSize: '12px' }}>End of Report</div>
      </div>
    </div>
  );
}
