"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ZoomIn, ZoomOut, ArrowLeft, Printer } from 'lucide-react';
import { Rnd } from 'react-rnd';
import RibbonSidebar from '@/components/ribbon/RibbonSidebar';

export default function PQSLetterheadPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Stamp state
  const [showStamp, setShowStamp] = useState(false);
  const [stampPos, setStampPos] = useState({ x: 500, y: 700 });
  const [stampSize, setStampSize] = useState({ width: 200, height: 200 });
  const [blendMode, setBlendMode] = useState<string>('normal');
  const [margins, setMargins] = useState({ top: 40, right: 40, bottom: 40, left: 40 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = () => {
    setIsGenerating(true);
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
    }, 300);
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: 100%;
          }
          .no-print { display: none !important; }
          .a4-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            page-break-after: avoid;
          }
        }
      `}} />

      {/* Sidebar */}
      <RibbonSidebar 
        handlePrint={handlePrint}
        showStamp={showStamp}
        setShowStamp={setShowStamp}
        blendMode={blendMode}
        setBlendMode={setBlendMode}
        margins={margins}
        setMargins={setMargins}
      />

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-4 md:gap-8 print:p-0 print:gap-0 print:overflow-visible items-center bg-gray-100 relative ${isGenerating ? 'is-generating-pdf' : ''}`}>
        
        {/* Floating Toolbar */}
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200 no-print items-center">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-700" title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <span className="text-[10px] font-bold font-mono text-slate-500 self-center text-center leading-none">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-700" title="Zoom Out">
            <ZoomOut size={18} />
          </button>
        </div>

        <div 
          className="w-full origin-top md:transform-none print:scale-100 print:mb-0 flex flex-col items-center transition-transform"
          style={{ transform: `scale(${zoom})`, marginBottom: zoom < 1 ? `-${300 * (1 - zoom)}px` : '0' }}
        >
          <div className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl shrink-0 border border-gray-300 mx-auto" style={{ width: "210mm", height: "297mm" }}>
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <img src="/pqs-logo.png" alt="Watermark" style={{ width: "55%", opacity: 0.06, objectFit: "contain" }} />
            </div>

            {/* Stamp Overlay */}
            {showStamp && (
              <Rnd
                size={{ width: stampSize.width, height: stampSize.height }}
                position={{ x: stampPos.x, y: stampPos.y }}
                onDragStop={(e, d) => setStampPos({ x: d.x, y: d.y })}
                onResizeStop={(e, direction, ref, delta, position) => {
                  setStampSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
                  setStampPos(position);
                }}
                bounds="parent"
                className={`z-40 ${isGenerating ? '' : 'hover:outline hover:outline-2 hover:outline-blue-500/50'}`}
                style={{ mixBlendMode: blendMode as any }}
                enableResizing={!isGenerating}
                disableDragging={isGenerating}
              >
                <img 
                  src={'/stamp.png'} 
                  alt="Stamp" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} 
                />
              </Rnd>
            )}

            {/* Header */}
            <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 px-10 pt-6 relative z-10">
              <div className="flex items-center gap-3 shrink-0">
                <img src="/pqs-logo.png" alt="PQS Logo" style={{ width: "90px", height: "90px", objectFit: "contain" }} />
                <div className="flex flex-col justify-center">
                  <img src="/pqs-wordmark.png" alt="PQS Wordmark" style={{ height: "28px", width: "271px", objectFit: "contain" }} />
                  <div className="text-xs text-gray-500 mt-1" contentEditable suppressContentEditableWarning>Providing Consultancy Service to Textile Industries</div>
                </div>
              </div>
              
              {/* Right Side */}
              <div className="text-right flex flex-col items-end pt-2">
                <div className="flex gap-2 text-sm mt-1">
                  <span className="font-bold w-16 text-right whitespace-nowrap">Ref #:</span>
                  <span className="w-36 text-left border-b border-gray-400" contentEditable suppressContentEditableWarning></span>
                </div>
                <div className="flex gap-2 text-sm mt-3">
                  <span className="font-bold w-16 text-right whitespace-nowrap">Date:</span>
                  <span className="w-36 text-left border-b border-gray-400" contentEditable suppressContentEditableWarning></span>
                </div>
              </div>
            </div>

            {/* Body text */}
            <div 
              className="flex-1 outline-none relative z-10" 
              style={{ padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px` }} 
              contentEditable 
              suppressContentEditableWarning
            >
              <p className="text-sm text-gray-800">Type your letter or report content here...</p>
            </div>

            {/* Footer */}
            <div className="w-full flex flex-col items-center mt-auto pb-8 relative z-10">
              <div className="w-[95%] flex justify-between items-center border-t border-gray-400 pt-4 text-xs text-gray-500">
                <span className="whitespace-nowrap" contentEditable suppressContentEditableWarning>
                  R-332/9, Dastagir, F.B Area, Karachi, 75950.
                </span>
                <span className="whitespace-nowrap" contentEditable suppressContentEditableWarning>
                  03322673373 | 03333769174
                </span>
                <span className="whitespace-nowrap" contentEditable suppressContentEditableWarning>
                  precisionqualityserviceslabs@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
