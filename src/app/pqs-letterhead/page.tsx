"use client";

import React, { useState, useEffect } from 'react';
import PQSWordmark from '@/components/report/PQSWordmark';
import PQSLogoImage from '@/components/report/PQSLogoImage';
import { useRouter } from 'next/navigation';
import { ZoomIn, ZoomOut, ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PQSLetterheadPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [date, setDate] = useState('');
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

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
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print { display: none !important; }
          .a4-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
          }
        }
        .placeholder-empty:empty:before,
        .placeholder-empty:has(> br:only-child):before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
      `}} />

      {/* Sidebar */}
      <div className="w-full md:w-[400px] h-auto md:h-full bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl md:shadow-none no-print overflow-hidden">
        <div className="flex-none p-4 md:p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <button 
            onClick={() => router.push('/')} 
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
            title="Back to Home"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-sm font-semibold text-slate-700">PQS Letterhead</div>
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 bg-[#002f6c] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#001f4d] transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Printer size={16} />
            <span>Print / PDF</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800">
            <p className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span> How to use:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Click anywhere inside the text to edit it (like the Date or Body text).</li>
              <li>Use the zoom tools on the right to adjust your view.</li>
              <li>Click <b>Print / PDF</b> to save or print the document.</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
            <input 
              type="text" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="e.g. September 13, 2026"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#002f6c]/20 focus:border-[#002f6c] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-4 md:gap-8 print:p-0 print:gap-0 print:overflow-visible items-center bg-gray-50 relative ${isGenerating ? 'is-generating-pdf' : ''}`}>
        
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
          className="w-full max-w-[794px] origin-top md:transform-none print:scale-100 print:mb-0 flex flex-col gap-4 md:gap-8 items-center transition-transform"
          style={{ transform: `scale(${zoom})`, marginBottom: zoom < 1 ? `-${300 * (1 - zoom)}px` : '0' }}
        >
          <div 
            className="a4-page relative overflow-hidden flex flex-col bg-white shadow-xl shrink-0 border border-gray-300 mx-auto" 
            style={{ width: '210mm', height: '297mm' }}
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <PQSLogoImage className="object-contain" style={{ width: '60%', opacity: 0.08 }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              
              {/* Header */}
              <div className="relative flex justify-center items-start mb-6 border-b-2 border-gray-800 pb-4 px-10 pt-6 z-10">

                {/* Centered Logo Stack */}
                <div className="flex flex-col items-center gap-2 mx-auto">
                  <PQSLogoImage style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  <PQSWordmark style={{ height: '26px', width: '252px', objectFit: 'contain' }} />
                  <div className="text-xs text-gray-500" contentEditable suppressContentEditableWarning>Providing Consultancy Service to Textile Industries</div>
                </div>

                {/* Date field, right above the line */}
                <div className="absolute bottom-4 right-10 flex gap-2 text-sm items-end">
                  <span className="font-bold whitespace-nowrap pb-1">Date:</span>
                  <input 
                    type="text" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-36 text-left border-b border-gray-400 bg-transparent outline-none font-normal"
                  />
                </div>
              </div>

              {/* Body */}
              <div 
                className="flex-1 px-10 outline-none relative z-10 mt-4 pb-16 text-sm text-gray-800 whitespace-pre-wrap placeholder-empty"
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Type your letter or report content here..."
              ></div>

              {/* Footer */}
              <div className="absolute bottom-6 left-0 w-full flex flex-col items-center z-10 bg-white">
                <div className="w-[90%] flex justify-between border-t border-gray-400 pt-2 text-[11px] text-gray-500">
                  <span contentEditable suppressContentEditableWarning>R-332/9, Dastagir, F.B Area, Karachi, 75950.</span>
                  <span contentEditable suppressContentEditableWarning>03322673373 | 03333769174</span>
                  <span contentEditable suppressContentEditableWarning>precisionqualityserviceslabs@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
