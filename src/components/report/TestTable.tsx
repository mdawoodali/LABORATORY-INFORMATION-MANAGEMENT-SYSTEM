import React from 'react';
import { TestRow } from '@/types';

interface TestTableProps {
  sampleDetails: string;
  tests: TestRow[];
}

export default function TestTable({ sampleDetails, tests }: TestTableProps) {
  return (
    <div className="flex-1 text-[13px] mt-4 font-sans">
      <h3 className="font-bold text-[14px] mb-4">Test Conducted :</h3>
      <div className="font-bold mb-1">Sample Details :</div>
      <p className="mb-6 whitespace-pre-wrap">{sampleDetails}</p>

      <table className="w-[90%] border-collapse border border-black mb-8 text-[13px]">
        <thead>
          <tr>
            <th colSpan={4} className="border border-black text-left p-1.5 bg-white font-bold text-[11px] uppercase tracking-wide">
              Average readings are reported.
            </th>
          </tr>
          <tr className="bg-white text-center font-bold">
            <th className="border border-black p-1.5 w-[40%]">Test</th>
            <th className="border border-black p-1.5 w-[20%]">Unit</th>
            <th className="border border-black p-1.5 w-[25%]">ASTM Standard</th>
            <th className="border border-black p-1.5 w-[15%]">Actual Results</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((t) => (
            <tr key={t.id} className="text-center">
              <td className="border border-black p-1.5 text-left whitespace-pre-wrap font-serif text-[14px]">{t.test}</td>
              <td className="border border-black p-1.5 font-serif text-[14px]">{t.unit}</td>
              <td className="border border-black p-1.5 font-serif text-[14px]">{t.standard}</td>
              <td className="border border-black p-1.5 font-bold">{t.result}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="w-[90%] flex justify-end mt-4">
        <span className="font-serif text-[13px] italic">End of Report</span>
      </div>
    </div>
  );
}
