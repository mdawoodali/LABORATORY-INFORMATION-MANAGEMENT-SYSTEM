import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { AppSettings, DEFAULT_SETTINGS } from '@/types';

export default function Signature() {
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  
  useEffect(() => {
    const savedSettings = localStorage.getItem('sr_settings');
    if (savedSettings) {
      try {
        const settings: AppSettings = JSON.parse(savedSettings);
        if (settings.signatureImage) {
          setSignatureImage(settings.signatureImage);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);
  return (
    <div className="flex justify-between items-end px-10 mt-auto pb-6 font-sans" style={{ fontSize: '11px' }}>
      
      {/* Left Disclaimer Text */}
      <div className="flex flex-col text-gray-700 leading-tight" style={{ width: '55%', fontSize: '9px', lineHeight: '1.4' }}>
        <p>This document is issued by the Company under its General Conditions of Services accessible at http: www.srtexlab.com/terms.html.</p>
        <p>Attention is drawn to the limitation of liability, indemnification and jurisdiction issues defined therein.</p>
        <p>Unless otherwise stated the results show in this test report refer only to the sample (s) tested and such sample (s) are retained for 30 days only.</p>
        <p>This document cannot be reproduced except in full, without prior approval of the Company.</p>
      </div>

      {/* Right Signature Area */}
      <div className="flex flex-col items-center" style={{ width: '35%' }}>
        <div className="text-center mb-6" style={{ fontSize: '11px' }}>
          Signed for and on behalf of<br/>
          S. R. Laboratories ( Pvt. ) Ltd.
        </div>
        
        {/* Draggable/Resizable Signature image from DOCX or Settings */}
        <div className="relative w-full h-[90px] flex items-center justify-center -mt-2 mb-1">
          <Rnd
            default={{
              x: 0,
              y: 0,
              width: 150,
              height: 90,
            }}
            bounds="parent"
            className="group"
            enableResizing={{
              bottom: true, bottomLeft: true, bottomRight: true,
              left: true, right: true, top: true, topLeft: true, topRight: true
            }}
          >
            <div className="w-full h-full relative group hover:ring-2 hover:ring-blue-400 hover:ring-dashed transition-all cursor-move">
              <img 
                src={signatureImage || "/docx_images/image2.png"} 
                alt="Signature" 
                className="w-full h-full object-contain opacity-90 mix-blend-multiply pointer-events-none" 
              />
              {/* This class hides handles during generation */}
              <style jsx global>{`
                .is-generating-pdf .react-draggable {
                  border: none !important;
                  outline: none !important;
                  ring: none !important;
                }
                .is-generating-pdf .react-draggable:hover, .is-generating-pdf .group:hover {
                  box-shadow: none !important;
                  ring: none !important;
                }
                .is-generating-pdf [class*="react-resizable-handle"] {
                  display: none !important;
                }
              `}</style>
            </div>
          </Rnd>
        </div>

        <div className="text-center font-bold underline" style={{ fontSize: '12px' }}>
          Zulfiqar Ali
        </div>
        <div className="font-bold text-center" style={{ fontSize: '12px' }}>
          Lab. Manager
        </div>
      </div>

    </div>
  );
}
