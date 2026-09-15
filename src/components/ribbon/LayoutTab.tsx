import React from 'react';

interface LayoutTabProps {
  margins: { top: number, right: number, bottom: number, left: number };
  setMargins: React.Dispatch<React.SetStateAction<{ top: number, right: number, bottom: number, left: number }>>;
}

export default function LayoutTab({ margins, setMargins }: LayoutTabProps) {

  const handleMarginChange = (side: keyof typeof margins, value: string) => {
    const val = parseInt(value, 10);
    if (!isNaN(val)) {
      setMargins(prev => ({ ...prev, [side]: val }));
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full text-sm">
      
      {/* Margins Group */}
      <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Page Margins (px)</div>
        
        <div className="grid grid-cols-2 gap-3 p-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 uppercase">Top</label>
            <input 
              type="number" 
              value={margins.top} 
              onChange={(e) => handleMarginChange('top', e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded text-sm w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 uppercase">Bottom</label>
            <input 
              type="number" 
              value={margins.bottom} 
              onChange={(e) => handleMarginChange('bottom', e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded text-sm w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 uppercase">Left</label>
            <input 
              type="number" 
              value={margins.left} 
              onChange={(e) => handleMarginChange('left', e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded text-sm w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 uppercase">Right</label>
            <input 
              type="number" 
              value={margins.right} 
              onChange={(e) => handleMarginChange('right', e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded text-sm w-full"
            />
          </div>
        </div>
        
        <div className="text-[10px] text-slate-500 italic px-2 mt-1">
          Adjusts the inner padding of the letterhead page content area.
        </div>
      </div>

    </div>
  );
}
