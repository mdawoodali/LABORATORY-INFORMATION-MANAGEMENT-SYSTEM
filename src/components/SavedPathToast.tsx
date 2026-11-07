import React, { useState } from 'react';
import { toast, Toast } from 'react-hot-toast';
import { CheckCircle, Copy, Check, X } from 'lucide-react';

interface SavedPathToastProps {
  t: Toast;
  savedPath: string;
  type?: 'report' | 'invoice' | 'letterhead';
  isDuplicate?: boolean;
}

export default function SavedPathToast({ t, savedPath, type = 'report', isDuplicate = false }: SavedPathToastProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(savedPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const title = type === 'invoice' 
    ? 'Invoice PDF Saved' 
    : type === 'letterhead' 
    ? 'Letterhead PDF Saved' 
    : 'Report PDF Saved';

  const subtitle = isDuplicate 
    ? 'Original was in use — saved as duplicate'
    : 'Replaced & saved to backup location';

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-lg w-full bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-2xl pointer-events-auto p-4 text-white font-sans transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white tracking-wide">{title}</p>
              {isDuplicate && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Duplicate (1)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-3 bg-slate-950/90 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between gap-2">
        <span
          className="text-[11px] font-mono text-emerald-300 truncate select-all flex-1"
          title={savedPath}
        >
          {savedPath}
        </span>
        <button
          onClick={handleCopy}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-all active:scale-95 ${
            copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
          title="Copy full path to clipboard"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied!' : 'Copy Path'}</span>
        </button>
      </div>
    </div>
  );
}
