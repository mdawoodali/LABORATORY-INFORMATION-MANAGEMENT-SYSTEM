import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Edit2, Check } from 'lucide-react';
import { pushGlobalSettings } from '@/lib/sync';
import toast from 'react-hot-toast';

export default function PasswordLock({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('sr_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.defaultPassword !== undefined) {
            onChange(parsed.defaultPassword);
          }
        } catch {}
      }
    };
    handleSync();
    window.addEventListener('local-storage-synced', handleSync);
    return () => window.removeEventListener('local-storage-synced', handleSync);
  }, [onChange]);

  const handleSave = () => {
    setIsEditing(false);
    const saved = localStorage.getItem('sr_settings');
    let settings: any = {};
    if (saved) {
      try { settings = JSON.parse(saved); } catch {}
    }
    const newSettings = { ...settings, defaultPassword: value };
    localStorage.setItem('sr_settings', JSON.stringify(newSettings));
    pushGlobalSettings();
    toast.success("Global password locked and synced!");
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase font-bold text-slate-400">Global PDF Password Lock</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          {isEditing ? (
            <input
              type="text"
              className="border border-blue-500 bg-slate-800 rounded p-2 text-sm w-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={(e) => { e.preventDefault(); toast.error("Pasting disabled for security reasons."); }}
              placeholder="Enter password"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            />
          ) : (
            <div className="border border-slate-700 bg-slate-800 rounded p-2 text-sm w-full text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Lock size={14} className="text-emerald-500 shrink-0" />
                <span className="truncate">{value ? '•'.repeat(Math.max(4, value.length)) : 'No Password'}</span>
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
