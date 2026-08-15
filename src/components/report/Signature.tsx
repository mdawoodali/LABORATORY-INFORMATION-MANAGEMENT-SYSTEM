import React, { useEffect, useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '@/types';
import CanvaImage from './CanvaImage';

export default function Signature({ companyName }: { companyName?: string }) {
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  
  useEffect(() => {
    const savedSettings = localStorage.getItem('sr_settings');
    if (savedSettings) {
      try {
        const settings: AppSettings = JSON.parse(savedSettings);
        if (settings.signatureImage) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSignatureImage(settings.signatureImage);
        }
      } catch {
        console.error("Failed to parse settings for signature");
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
          {companyName || "S. R. Laboratories ( Pvt. ) Ltd."}
        </div>
        
        {/* Draggable/Resizable Signature image from DOCX or Settings */}
        <div className="w-full h-[90px] flex items-center justify-center -mt-2 mb-1 z-50">
          <CanvaImage 
            src={signatureImage || "/docx_images/image2.png"}
            defaultWidth={150}
            defaultHeight={90}
            onReplace={(newSrc) => {
              setSignatureImage(newSrc);
              // Save to localStorage
              const savedSettings = localStorage.getItem('sr_settings');
              const settings = savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
              localStorage.setItem('sr_settings', JSON.stringify({ ...settings, signatureImage: newSrc }));
            }}
            onRemove={() => {
              setSignatureImage("/docx_images/image2.png");
              const savedSettings = localStorage.getItem('sr_settings');
              const settings = savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
              localStorage.setItem('sr_settings', JSON.stringify({ ...settings, signatureImage: undefined }));
            }}
          />
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
