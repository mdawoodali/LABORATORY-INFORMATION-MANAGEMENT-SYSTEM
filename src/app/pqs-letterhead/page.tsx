"use client";

import React, { useState, useEffect } from 'react';
import PQSWordmark from '@/components/report/PQSWordmark';
import PQSLogoImage from '@/components/report/PQSLogoImage';
import { useRouter } from 'next/navigation';
import { ZoomIn, ZoomOut, ArrowLeft, Printer } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { PQSStampBase64 } from '@/components/report/PQSStampBase64';
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css';

const SunEditor = dynamic(() => import('suneditor-react'), { ssr: false });

export default function PQSLetterheadPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [date, setDate] = useState('');
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Stamp state
  const [showStamp, setShowStamp] = useState(false);
  const [stampPos, setStampPos] = useState({ x: 500, y: 700 });
  const [stampSize, setStampSize] = useState({ width: 200, height: 200 });
  const [blendMode, setBlendMode] = useState<string>('normal');

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
          }
          .no-print { display: none !important; }
          .a4-page {
            box-shadow: none !important;
            border: none !important;
            width: 210mm !important;
            height: auto !important;
            min-height: 297mm !important;
            margin: 0 !important;
            page-break-after: avoid;
          }
          body {
            counter-reset: page;
          }
          .print-page-number::after {
            counter-increment: page;
            content: "Page " counter(page);
          }
          .placeholder-empty:empty:before,
          .placeholder-empty:has(> br:only-child):before {
            content: none !important;
            display: none !important;
          }
        }

        /* SunEditor Overrides */
        .sun-editor {
          border: none !important;
          background: transparent !important;
        }
        .sun-editor .se-wrapper {
          margin: 0 !important;
          border: none !important;
          z-index: 10 !important;
        }
        .sun-editor-editable {
          padding: 0 !important;
          font-family: inherit !important;
          background-color: transparent !important;
        }
        
        /* Hide toolbar container during print */
        @media print {
          #toolbar-container { display: none !important; }
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

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Add Stamp</label>
              <button 
                onClick={() => setShowStamp(!showStamp)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${showStamp ? 'bg-[#002f6c]' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${showStamp ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            {showStamp && (
              <div className="space-y-3 p-3 bg-slate-100 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stamp Blend Mode</label>
                <select 
                  value={blendMode}
                  onChange={(e) => setBlendMode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002f6c]/20"
                >
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="darken">Darken</option>
                  <option value="color-burn">Color Burn</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                </select>
                <p className="text-[10px] text-slate-500 italic">Drag to move. Drag edges to resize.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto flex flex-col items-center bg-gray-50 relative ${isGenerating ? 'is-generating-pdf' : ''}`}>
        
        {/* SunEditor Toolbar Container */}
        <div id="toolbar-container" className="sticky top-0 w-full z-[100] shadow-sm mb-4 print:hidden"></div>
        
        <div className="w-full flex-1 p-4 md:p-8 flex flex-col gap-4 md:gap-8 print:p-0 print:gap-0 print:overflow-visible items-center">
        
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
            className="a4-page relative flex flex-col bg-white shadow-xl shrink-0 border border-gray-300 mx-auto" 
            style={{ width: '210mm', minHeight: '297mm', height: '297mm' }}
          >
            {/* Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <PQSLogoImage className="w-1/2 opacity-[0.03] object-contain" />
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
                  src={PQSStampBase64} 
                  alt="Stamp" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} 
                />
              </Rnd>
            )}

            <table className="w-full relative z-10">
              <thead className="w-full table-header-group">
                <tr>
                  <td>
                    {/* Header */}
                    <div className="w-full flex justify-between items-start px-10 pt-8 pb-4 border-b-2 border-gray-800 bg-white">
                      {/* Left Side */}
                      <div className="flex flex-col items-center gap-1 w-[280px]">
                        <PQSLogoImage className="h-24 w-24 object-contain" />
                        <div className="flex flex-col items-center -mt-2">
                          <PQSWordmark className="h-8 object-contain" />
                          <div className="text-xs text-gray-500 mt-1" contentEditable suppressContentEditableWarning>Providing Consultancy Service to Textile Industries</div>
                        </div>
                      </div>
                      
                      {/* Right Side */}
                      <div className="text-right flex flex-col items-end pt-2">
                        <div className="flex gap-2 text-sm mt-1 items-center">
                          <span className="font-bold w-16 text-right whitespace-nowrap">Ref #:</span>
                          <span className="w-36 text-left border-b border-gray-400 outline-none" contentEditable suppressContentEditableWarning></span>
                        </div>
                        <div className="flex gap-2 text-sm mt-3 items-end">
                          <span className="font-bold w-16 text-right whitespace-nowrap">Date:</span>
                          <input 
                            type="text" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-36 text-left border-b border-gray-400 bg-transparent outline-none font-normal leading-tight pb-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </thead>

              <tbody className="w-full">
                <tr>
                  <td className="align-top">
                    {/* Body text */}
                    <div className="px-10 mt-4 pb-10" style={{ minHeight: '150mm' }}>
                      <SunEditor
                        setOptions={{
                          toolbarContainer: '#toolbar-container',
                          showPathLabel: false,
                          minHeight: '150mm',
                          resizingBar: false,
                          buttonList: [
                            ['undo', 'redo'],
                            ['font', 'fontSize', 'formatBlock'],
                            ['paragraphStyle', 'blockquote'],
                            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                            ['fontColor', 'hiliteColor', 'textStyle'],
                            ['removeFormat'],
                            ['outdent', 'indent'],
                            ['align', 'horizontalRule', 'list', 'lineHeight'],
                            ['table', 'link', 'image', 'video'],
                            ['fullScreen', 'showBlocks', 'codeView']
                          ],
                        }}
                        placeholder="Type your letter or report content here..."
                        setDefaultStyle="font-family: inherit; font-size: 14px; padding: 0;"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>

              <tfoot className="w-full table-footer-group">
                <tr>
                  <td>
                    {/* Footer */}
                    <div className="w-full flex flex-col items-center pt-6 pb-8 bg-white">
                      <div className="w-[90%] flex justify-between border-t border-gray-400 pt-3 text-xs text-gray-500">
                        <span contentEditable suppressContentEditableWarning>R-332/9, Dastagir, F.B Area, Karachi, 75950.</span>
                        <span contentEditable suppressContentEditableWarning>03322673373 | 03333769174</span>
                        <span contentEditable suppressContentEditableWarning>precisionqualityserviceslabs@gmail.com</span>
                      </div>
                      <div className="w-[90%] flex justify-end pt-2 text-[10px] text-gray-400">
                        <span className="print-page-number hidden print:inline"></span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>

          </div>
        </div>
        </div>
      </div>
    </div>
  );

}
