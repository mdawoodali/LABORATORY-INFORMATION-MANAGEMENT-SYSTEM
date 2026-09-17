/* eslint-disable */
import React, { useState } from 'react';
import { Lock, Unlock, Edit2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PasswordLock({ value, onChange, placeholderFallback = '' }: { value: string, onChange: (val: string) => void, placeholderFallback?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Sync localValue with prop value when not editing
  React.useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    onChange(localValue);
    toast.success("Password locked for this document!");
  };

  const displayValue = localValue || placeholderFallback;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase font-bold text-slate-400">PDF Password Lock</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          {isEditing ? (
            <input
              type="text"
              className="border border-blue-500 bg-slate-800 rounded p-2 text-sm w-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onPaste={(e) => { e.preventDefault(); toast.error("Pasting disabled for security reasons."); }}
              placeholder={placeholderFallback ? `Default: ${placeholderFallback}` : "Enter password"}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            />
          ) : (
            <div className="border border-slate-700 bg-slate-800 rounded p-2 text-sm w-full text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Lock size={14} className="text-emerald-500 shrink-0" />
                <span className="truncate">{displayValue ? '•'.repeat(Math.max(4, displayValue.length)) : 'No Password'}</span>
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className={"shrink-0 flex items-center justify-center p-2 rounded transition-colors " + (
            isEditing ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          )}
        >
          {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
        </button>
      </div>
    </div>
  );
}
