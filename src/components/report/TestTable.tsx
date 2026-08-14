import React from 'react';
import { TestRow } from '@/types';

interface TestTableProps {
  sampleDetails: string;
  tests: TestRow[];
}

export default function TestTable({ sampleDetails, tests }: TestTableProps) {
  return (
    <div className="w-full px-6 mt-6 font-sans text-[12px]">
      
      {/* Table Intro */}
      <div className="mb-4 text-[13px]">
        <div className="flex gap-2">
          <span className="font-bold w-32">Test Conducted</span>
          <span>:</span>
        </div>
        <div className="flex gap-2 mt-1">
          <span className="font-bold w-32">Sample Details</span>
          <span className="flex-1">: A Sample of <span className="font-bold">Recycled Material</span>, tested for Density, Melt Flow Index, Shape and Filteration Level LDPE Content.</span>
        </div>
      </div>

      <div className="font-bold text-[13px] mb-1">Average readings are reported.</div>

      {/* Main Table */}
      <table className="w-full border-collapse border border-black text-center mb-6">
        <thead>
          <tr className="border-b border-black">
            <th className="border border-black p-2 font-bold w-[35%]">Test</th>
            <th className="border border-black p-2 font-bold w-[20%]">Unit</th>
            <th className="border border-black p-2 font-bold w-[25%]">ASTM Standard</th>
            <th className="border border-black p-2 font-bold w-[20%]">Actual Results</th>
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
      <div className="flex items-center w-full">
        <div className="border-b-[1.5px] border-black flex-1"></div>
        <div className="font-bold pl-4">End of Report</div>
      </div>
      
    </div>
  );
}
