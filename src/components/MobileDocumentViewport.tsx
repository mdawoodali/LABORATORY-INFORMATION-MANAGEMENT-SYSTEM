"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface MobileDocumentViewportProps {
  children: React.ReactNode;
  pageCount?: number;
  className?: string;
  onScaleChange?: (scale: number) => void;
}

export default function MobileDocumentViewport({
  children,
  pageCount = 1,
  className = '',
  onScaleChange
}: MobileDocumentViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [fitScale, setFitScale] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  const initialDistanceRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(1);
  const lastTapRef = useRef<number>(0);

  // Auto calculate screen fit scale
  useEffect(() => {
    const calculateFit = () => {
      if (typeof window === 'undefined') return;
      const screenW = window.innerWidth;
      const mobile = screenW < 840;
      setIsMobile(mobile);

      // A4 page width standard is 794px
      const standardPageWidth = 794;
      const horizontalPadding = mobile ? 16 : 48;
      const availableW = Math.max(300, screenW - horizontalPadding);
      const computedFit = Math.min(1.2, availableW / standardPageWidth);
      setFitScale(computedFit);

      // On initial mobile load, default to fit-to-screen
      if (mobile) {
        setScale((prev) => (prev === 1 ? computedFit : prev));
      }
    };

    calculateFit();
    window.addEventListener('resize', calculateFit);
    return () => window.removeEventListener('resize', calculateFit);
  }, []);

  useEffect(() => {
    if (onScaleChange) onScaleChange(scale);
  }, [scale, onScaleChange]);

  // Touch Pinch-to-zoom handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialDistanceRef.current = dist;
      initialScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistanceRef.current > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialDistanceRef.current;
      const newScale = Math.max(0.3, Math.min(2.5, initialScaleRef.current * factor));
      setScale(parseFloat(newScale.toFixed(2)));
    }
  };

  const handleTouchEnd = () => {
    initialDistanceRef.current = 0;
  };

  // Double tap to toggle fit vs 100%
  const handleDoubleTap = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'A'].includes(target.tagName)) {
      return;
    }
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (Math.abs(scale - fitScale) < 0.05) {
        setScale(1);
      } else {
        setScale(fitScale);
      }
    }
    lastTapRef.current = now;
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full flex flex-col items-center overflow-x-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleDoubleTap}
    >
      {/* Floating Touch Zoom Controls for Mobile / Tablet */}
      {isMobile && (
        <div className="sticky top-2 z-40 bg-white/90 backdrop-blur-md border border-gray-200 shadow-md rounded-full px-3 py-1.5 flex items-center gap-2 mb-4 text-xs font-semibold text-gray-700 no-print">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setScale(fitScale); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors ${Math.abs(scale - fitScale) < 0.05 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-blue-600'}`}
            title="Fit to Screen"
          >
            <Maximize2 size={12} />
            <span>Fit</span>
          </button>
          
          <div className="w-[1px] h-3 bg-gray-300" />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(0.35, parseFloat((s - 0.1).toFixed(2)))); }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>

          <span className="font-mono text-[11px] w-9 text-center text-gray-600">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(2.5, parseFloat((s + 0.1).toFixed(2)))); }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>

          <div className="w-[1px] h-3 bg-gray-300" />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setScale(1); }}
            className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${Math.abs(scale - 1) < 0.05 ? 'bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
            title="100% Real Size"
          >
            100%
          </button>
        </div>
      )}

      {/* Responsive Scaled Document Container */}
      <div 
        className="flex flex-col items-center origin-top transition-transform duration-75 ease-out"
        style={{
          transform: `scale(${scale})`,
          width: '794px',
          marginBottom: scale < 1 ? `-${Math.round((1123 * pageCount + 40 * pageCount) * (1 - scale))}px` : '0px'
        }}
      >
        {children}
      </div>
    </div>
  );
}
