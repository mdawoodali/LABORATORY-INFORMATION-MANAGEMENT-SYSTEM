import React from 'react';
import { TestRow, ReportFormData, is7ColumnReport } from '@/types';

export default function TestTable({ 
  tests, 
  data,
  isFirstPage = true,
  isLastPage = true
}: { 
  tests: TestRow[], 
  data: ReportFormData,
  isFirstPage?: boolean,
  isLastPage?: boolean
}) {
  const is7Col = is7ColumnReport(data, tests);

  return (
    <div className="flex flex-col px-10 pt-4 font-sans mb-8" style={{ fontSize: '14px' }}>
      
      {/* Test Conducted / Sample Details */}
      {isFirstPage && (
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
      )}

      {/* Footer text above table */}
      {isFirstPage && (
        <div className="border border-black inline-block px-2 py-0.5 mb-0 font-bold" style={{ fontSize: '11px', width: 'fit-content' }}>
          {data.footerText || "Average readings are reported."}
        </div>
      )}

      {/* Main Table */}
      <table 
        className={`w-full border-collapse text-center table-fixed ${isFirstPage ? 'mt-2' : 'mt-10'}`} 
        style={{ fontSize: is7Col ? '13px' : '15px' }}
      >
        <thead>
          {is7Col ? (
            <tr>
              <th className="border border-black px-1.5 py-3 font-bold text-center" style={{ width: '22%' }}>{data.tableHeader1 || 'Test'}</th>
              <th className="border border-black px-1.5 py-3 font-bold text-center" style={{ width: '18%' }}>{data.tableHeader2 || 'Test Method'}</th>
              <th className="border border-black px-1.5 py-3 font-bold text-center" style={{ width: '12%' }}>{data.tableHeader3 || 'Value'}</th>
              <th className="border border-black px-1.5 py-3 font-bold text-center" style={{ width: '10%' }}>{data.tableHeader4 || 'Unit'}</th>
              <th className="border border-black px-1.5 py-3 font-bold text-center" style={{ width: '14%' }}>{data.tableHeader5 || 'Criteria'}</th>
              <th className="border border-black px-1.5 py-3 font-bold text-center" style={{ width: '10%' }}>{data.tableHeader6 || 'Unit'}</th>
              <th className="border border-black px-1.5 py-3 font-bold text-center" style={{ width: '14%' }}>{data.tableHeader7 || 'Result'}</th>
            </tr>
          ) : (
            <tr>
              <th className="border border-black px-2 py-6 font-bold text-center" style={{ width: '25%' }}>{data.tableHeader1 || 'Test'}</th>
              <th className="border border-black px-2 py-6 font-bold text-center" style={{ width: '20%' }}>{data.tableHeader2 || 'Test Method'}</th>
              <th className="border border-black px-2 py-6 font-bold text-center" style={{ width: '15%' }}>{data.tableHeader3 || 'Value'}</th>
              <th className="border border-black px-2 py-6 font-bold text-center" style={{ width: '15%' }}>{data.tableHeader4 || 'Unit'}</th>
              <th className="border border-black px-2 py-6 font-bold text-center" style={{ width: '25%' }}>{data.tableHeader5 || 'Result'}</th>
            </tr>
          )}
        </thead>
        <tbody>
          {tests.map((test, idx) => (
            is7Col ? (
              <tr key={test.id || idx}>
                <td className="border border-black px-1.5 py-3.5 text-center whitespace-pre-wrap break-words">{test.test || '-'}</td>
                <td className="border border-black px-1.5 py-3.5 text-center whitespace-pre-wrap break-words">{test.method || '-'}</td>
                <td className="border border-black px-1.5 py-3.5 text-center whitespace-pre-wrap break-words">{test.value || '-'}</td>
                <td className="border border-black px-1.5 py-3.5 text-center whitespace-pre-wrap break-words">{test.unit || '-'}</td>
                <td className="border border-black px-1.5 py-3.5 text-center whitespace-pre-wrap break-words">{test.criteria || '-'}</td>
                <td className="border border-black px-1.5 py-3.5 text-center whitespace-pre-wrap break-words">{test.criteriaUnit || '-'}</td>
                <td className="border border-black px-1.5 py-3.5 text-center font-bold break-words">{test.result || '-'}</td>
              </tr>
            ) : (
              <tr key={test.id || idx}>
                <td className="border border-black px-2 py-6 text-center whitespace-pre-wrap">{test.test || '-'}</td>
                <td className="border border-black px-2 py-6 text-center whitespace-pre-wrap">{test.method || '-'}</td>
                <td className="border border-black px-2 py-6 text-center whitespace-pre-wrap">{test.value || '-'}</td>
                <td className="border border-black px-2 py-6 text-center whitespace-pre-wrap">{test.unit || '-'}</td>
                <td className="border border-black px-2 py-6 text-center">{test.result || '-'}</td>
              </tr>
            )
          ))}
        </tbody>
      </table>

      {/* Remarks */}
      {isLastPage && data.remarks && (
        <div className="mt-4 text-[13px]">
          <span className="font-bold mr-2">Remarks:</span>
          <span className="font-bold underline underline-offset-[3px] decoration-solid">{data.remarks}</span>
        </div>
      )}

      {/* End of Report Marker */}
      {isLastPage && (
        <div className="w-full flex items-center justify-center mt-12 mb-4">
          <div className="flex-1 border-b-[2px] border-black mr-4"></div>
          <div className="font-bold tracking-widest text-gray-800 whitespace-nowrap text-[16px]">
            END OF REPORT
          </div>
          <div className="flex-1 border-b-[2px] border-black ml-4"></div>
        </div>
      )}

    </div>
  );
}
