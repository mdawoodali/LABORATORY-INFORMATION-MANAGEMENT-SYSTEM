import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { Trash2, Upload, Settings } from 'lucide-react';

interface CanvaImageProps {
  src: string;
  defaultWidth?: number;
  defaultHeight?: number;
  onRemove?: () => void;
  onReplace?: (newSrc: string) => void;
  className?: string;
  caption?: string;
}

export default function CanvaImage({ src, defaultWidth = 150, defaultHeight = 90, onRemove, onReplace, className = '', caption }: CanvaImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [blendMode, setBlendMode] = useState<'normal' | 'multiply' | 'screen' | 'darken'>('multiply');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleStyle = {
    width: '12px',
    height: '12px',
    background: '#ffffff',
    border: '2px solid #3b82f6',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onReplace) {
      const reader = new FileReader();
      reader.onloadend = () => onReplace(reader.result as string);
      reader.readAsDataURL(file);
    }
    setIsMenuOpen(false);
  };

  return (
    <div 
      className="absolute inset-0 pointer-events-none canva-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
    >
      <Rnd
        default={{
          x: 0,
          y: 0,
          width: defaultWidth,
          height: defaultHeight,
        }}
        bounds="parent"
        className={`group pointer-events-auto ${isHovered ? 'z-50' : 'z-10'}`}
        resizeHandleStyles={{
          bottomRight: { ...handleStyle, right: '-6px', bottom: '-6px' },
          bottomLeft: { ...handleStyle, left: '-6px', bottom: '-6px' },
          topRight: { ...handleStyle, right: '-6px', top: '-6px' },
          topLeft: { ...handleStyle, left: '-6px', top: '-6px' },
        }}
        enableResizing={{
          bottom: false, bottomLeft: true, bottomRight: true,
          left: false, right: false, top: false, topLeft: true, topRight: true
        }}
      >
        <div className={`w-full h-full relative flex flex-col transition-all cursor-move ${isHovered ? 'ring-2 ring-blue-500' : ''}`}>
          
          {/* Floating Toolbar */}
          {isHovered && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-slate-200 flex items-center p-1 gap-1 toolbar-hide no-print z-50">
              
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                  title="Blend Mode"
                >
                  <Settings size={14} />
                </button>
                {isMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-lg rounded text-xs py-1 w-24 flex flex-col z-[60]">
                    <button onClick={() => { setBlendMode('multiply'); setIsMenuOpen(false); }} className="px-3 py-1 hover:bg-blue-50 text-left">Multiply</button>
                    <button onClick={() => { setBlendMode('normal'); setIsMenuOpen(false); }} className="px-3 py-1 hover:bg-blue-50 text-left">Normal</button>
                    <button onClick={() => { setBlendMode('darken'); setIsMenuOpen(false); }} className="px-3 py-1 hover:bg-blue-50 text-left">Darken</button>
                    <button onClick={() => { setBlendMode('screen'); setIsMenuOpen(false); }} className="px-3 py-1 hover:bg-blue-50 text-left">Screen</button>
                  </div>
                )}
              </div>

              <div className="w-px h-4 bg-slate-200 mx-0.5"></div>

              {onReplace && (
                <label className="p-1.5 hover:bg-slate-100 rounded text-blue-600 cursor-pointer transition-colors" title="Replace Image">
                  <Upload size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              )}
              
              {onRemove && (
                <button onClick={onRemove} className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors" title="Remove">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}

          <img 
            src={src} 
            alt="Element" 
            className={`w-full flex-1 min-h-0 object-contain pointer-events-none ${className}`}
            style={{ mixBlendMode: blendMode }}
          />
          {caption && (
            <div className="font-bold text-center w-full pb-2 text-slate-800 tracking-wide pt-2" style={{ fontSize: '18px' }}>
              {caption}
            </div>
          )}

          <style jsx global>{`
            .is-generating-pdf .react-draggable {
              border: none !important;
              outline: none !important;
            }
            .is-generating-pdf .react-draggable:hover, .is-generating-pdf .group:hover {
              box-shadow: none !important;
              ring: none !important;
            }
            .is-generating-pdf [class*="react-resizable-handle"] {
              display: none !important;
            }
            .is-generating-pdf .toolbar-hide {
              display: none !important;
            }
            .is-generating-pdf .canva-wrapper > div > div {
              box-shadow: none !important;
              border: none !important;
            }
          `}</style>
        </div>
      </Rnd>
    </div>
  );
}
