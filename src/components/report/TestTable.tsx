import React from 'react';
import { TestRow, ReportFormData } from '@/types';

export default function TestTable({ tests, data }: { tests: TestRow[], data: ReportFormData }) {
  return (
    <div className="flex flex-col flex-1 pl-12 pr-12 pt-6">
      <div className="text-[13px] mb-6">
        <div className="flex gap-2">
          <span className="font-bold w-32">Test Conducted</span>
          <span>:</span>
        </div>
        <div className="flex gap-2 mt-1">
          <span className="font-bold w-32">Sample Details</span>
          <span className="flex-1">: {data.sampleDetails}</span>
        </div>
      </div>

      <div className="font-bold text-[13px] mb-1">{data.footerText}</div>

      {/* Main Table */}
      <table className="w-full border-collapse border border-black text-center mb-6">
        <thead>
          <tr className="border-b border-black">
            <th className="border border-black p-2 font-bold w-[35%]">{data.tableHeader1}</th>
            <th className="border border-black p-2 font-bold w-[20%]">{data.tableHeader2}</th>
            <th className="border border-black p-2 font-bold w-[25%]">{data.tableHeader3}</th>
            <th className="border border-black p-2 font-bold w-[20%]">{data.tableHeader4}</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test, idx) => (
            <tr key={test.id || idx}>
              <td className="border border-black p-2 text-left px-3 whitespace-pre-wrap">{test.test}</td>
              <td className="border border-black p-2">{test.unit}</td>
              <td className="border border-black p-2">{test.standard}</td>
              <td className="border border-black p-2">{test.result}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* End of Report Line */}
      <div className="flex items-center w-full mt-4">
        <div className="border-b-[1.5px] border-black flex-1"></div>
        <div className="font-bold pl-4">End of Report</div>
      </div>
    </div>
  );
}
