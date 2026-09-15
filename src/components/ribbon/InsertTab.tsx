import React, { useRef } from 'react';
import { Image as ImageIcon, Table as TableIcon, Link as LinkIcon, Stamp } from 'lucide-react';

interface InsertTabProps {
  showStamp: boolean;
  setShowStamp: (val: boolean) => void;
  blendMode: string;
  setBlendMode: (val: string) => void;
}

export default function InsertTab({ showStamp, setShowStamp, blendMode, setBlendMode }: InsertTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exec = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    const editor = document.querySelector('[contentEditable="true"]:focus') as HTMLElement;
    if (editor) editor.focus();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        // Insert image html
        const imgHtml = `<img src="${src}" style="max-width: 100%; height: auto;" />`;
        exec('insertHTML', imgHtml);
      };
      reader.readAsDataURL(file);
    }
    // reset
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const insertTable = () => {
    const rows = prompt("Enter number of rows", "3");
    const cols = prompt("Enter number of columns", "3");
    
    if (rows && cols) {
      const r = parseInt(rows, 10);
      const c = parseInt(cols, 10);
      
      let html = '<table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;" border="1">';
      for (let i = 0; i < r; i++) {
        html += '<tr>';
        for (let j = 0; j < c; j++) {
          html += '<td style="border: 1px solid #ccc; padding: 8px; min-width: 50px;">&nbsp;</td>';
        }
        html += '</tr>';
      }
      html += '</table><p><br></p>';
      
      exec('insertHTML', html);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter link URL", "https://");
    if (url) {
      exec('createLink', url);
    }
  };

  const Button = ({ icon: Icon, label, onClick }: any) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 p-2 w-16 h-16 rounded transition-colors text-slate-700 hover:bg-slate-200"
    >
      <Icon size={24} className="text-[#002f6c]" />
      <span className="text-[10px]">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-4 w-full text-sm">
      
      {/* Editor Insert Group */}
      <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Content</div>
        
        <div className="flex gap-2 items-center">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImageUpload} 
          />
          <Button icon={ImageIcon} label="Picture" onClick={() => fileInputRef.current?.click()} />
          <Button icon={TableIcon} label="Table" onClick={insertTable} />
          <Button icon={LinkIcon} label="Link" onClick={insertLink} />
        </div>
      </div>

      {/* Stamp Group */}
      <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Overlays</div>
        
        <div className="space-y-4 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stamp size={18} className="text-[#002f6c]" />
              <label className="text-sm font-semibold text-slate-700">Add Stamp</label>
            </div>
            <button 
              onClick={() => setShowStamp(!showStamp)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${showStamp ? 'bg-[#002f6c]' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${showStamp ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          
          {showStamp && (
            <div className="space-y-3 p-3 bg-white rounded-lg border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blend Mode</label>
              <select 
                value={blendMode}
                onChange={(e) => setBlendMode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002f6c]/20"
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
  );
}
