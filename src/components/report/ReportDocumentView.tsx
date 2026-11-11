"use client";

import React from 'react';
import { ReportFormData, TestRow, ExtraPage } from '@/types';
import PASHeader from './PASHeader';
import PASFooter from './PASFooter';
import PageOneData from './PageOneData';
import TestTable from './TestTable';
import CanvaImage from './CanvaImage';

export interface ReportDocumentViewProps {
  formData: ReportFormData;
  tests: TestRow[];
  sampleImage?: string | null;
  sampleImages?: { id: string; src: string; name?: string }[];
  extraPages?: ExtraPage[];
  seal?: string;
  password?: string;
  onReportingDateChange?: (date: string) => void;
  isReadOnly?: boolean;
}

export default function ReportDocumentView({
  formData,
  tests,
  sampleImage,
  sampleImages,
  extraPages = [],
  seal,
  password,
  onReportingDateChange,
  isReadOnly = false,
}: ReportDocumentViewProps) {
  // Support both array sampleImages and legacy single sampleImage
  const images = sampleImages && sampleImages.length > 0
    ? sampleImages
    : sampleImage
      ? [{ id: '1', src: sampleImage }]
      : [];

  const ROWS_PER_PAGE = 8;
  const testList = tests || [];
  const testPagesCount = Math.max(1, Math.ceil(testList.length / ROWS_PER_PAGE));
  const testChunks: TestRow[][] = [];
  for (let i = 0; i < testList.length; i += ROWS_PER_PAGE) {
    testChunks.push(testList.slice(i, i + ROWS_PER_PAGE));
  }
  if (testChunks.length === 0) testChunks.push([]);

  const hasImages = images.length > 0;
  const sampleImagesCount = hasImages ? 1 : 0;
  const extraPagesCount = extraPages.length;
  const totalPages = 1 + testPagesCount + sampleImagesCount + extraPagesCount;

  return (
    <>
      {/* PAGE 1 */}
      <div 
        className="report-a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300" 
        style={{ width: '794px', height: '1123px' }}
      >
        <PASHeader 
          reportNo={formData.reportNo} 
          reportingDate={formData.reportDate || ''} 
          onReportingDateChange={onReportingDateChange}
          seal={seal} 
          password={password} 
        />
        <div className="flex-1">
          <PageOneData data={formData} />
        </div>
        <PASFooter pageNum={1} totalPages={totalPages} seal={seal} />
      </div>

      {/* TEST PAGES (Dynamically chunked into 8 tests per page) */}
      {testChunks.map((chunk, index) => (
        <div 
          key={`test-page-${index}`} 
          className="report-a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300 mt-8" 
          style={{ width: '794px', height: '1123px' }}
        >
          <PASHeader 
            reportNo={formData.reportNo} 
            reportingDate={formData.reportDate || ''} 
            onReportingDateChange={onReportingDateChange}
            seal={seal} 
            password={password} 
          />
          <div className="flex-1">
            <TestTable 
              tests={chunk} 
              data={formData} 
              isFirstPage={index === 0}
              isLastPage={index === testChunks.length - 1}
            />
          </div>
          <PASFooter pageNum={2 + index} totalPages={totalPages} seal={seal} />
        </div>
      ))}

      {/* Sample Images Page */}
      {hasImages && (
        <div 
          className="report-a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300 mt-8" 
          style={{ width: '794px', height: '1123px' }}
        >
          <PASHeader 
            reportNo={formData.reportNo} 
            reportingDate={formData.reportDate || ''} 
            onReportingDateChange={onReportingDateChange}
            seal={seal} 
            password={password} 
          />
          <div className="flex-1 flex flex-col px-10">
            <div className="flex-1 w-full relative">
              {images.map((img, imgIdx) => (
                <CanvaImage 
                  key={img.id || imgIdx}
                  src={img.src}
                  caption={images.length > 1 ? `Product Picture #${imgIdx + 1}` : 'Product Picture'} 
                  defaultWidth={400} 
                  defaultHeight={400} 
                  className="border border-gray-200 shadow-sm bg-white p-2 absolute" 
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          </div>
          <PASFooter pageNum={1 + testPagesCount + 1} totalPages={totalPages} seal={seal} />
        </div>
      )}

      {/* Extra Pages */}
      {extraPages.map((page, index) => {
        const pageNum = 1 + testPagesCount + sampleImagesCount + 1 + index;
        return (
          <div 
            key={page.id || index} 
            className="report-a4-page relative overflow-hidden flex flex-col bg-white shadow-xl print:shadow-none shrink-0 border border-gray-300 mt-8" 
            style={{ width: '794px', height: '1123px' }}
          >
            <PASHeader 
              reportNo={formData.reportNo} 
              reportingDate={formData.reportDate || ''} 
              onReportingDateChange={onReportingDateChange}
              seal={seal} 
              password={password} 
            />
            <div className="flex-1 flex flex-col px-10 relative">
              {page.image && (
                <div className="flex-1 flex justify-center items-start mb-4 relative">
                  <CanvaImage 
                    src={page.image}
                    className="max-w-full max-h-[850px] object-contain"
                    isReadOnly={isReadOnly}
                  />
                </div>
              )}
              {page.text && (
                <div className="whitespace-pre-wrap font-sans text-sm pb-10">
                  {page.text}
                </div>
              )}
            </div>
            <PASFooter pageNum={pageNum} totalPages={totalPages} seal={seal} />
          </div>
        );
      })}
    </>
  );
}
