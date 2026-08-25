import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { pushGlobalSettings } from '@/lib/sync';

interface DropdownInputProps {
  value: string;
  onChange: (value: string) => void;
  fieldKey: string;
  className?: string;
  placeholder?: string;
  defaultOptions?: string[];
}

export default function DropdownInput({ value, onChange, fieldKey, className = '', placeholder = '', defaultOptions }: DropdownInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<string[]>(defaultOptions || []);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load options from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`sr_options_${fieldKey}`);
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOptions(JSON.parse(saved));
      } catch {
        console.error("Failed to parse options for", fieldKey);
        if (defaultOptions) setOptions(defaultOptions);
      }
    } else if (defaultOptions) {
      setOptions(defaultOptions);
    }
  }, [fieldKey]);

  // Listen for sync updates
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem(`sr_options_${fieldKey}`);
      if (saved) {
        try { setOptions(JSON.parse(saved)); } catch {}
      }
    };
    window.addEventListener('local-storage-synced', handleSync);
    return () => window.removeEventListener('local-storage-synced', handleSync);
  }, [fieldKey]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveNewOption = (newVal: string) => {
    const trimmed = newVal.trim();
    if (!trimmed) return;
    
    let newOptions = [...options];
    if (!newOptions.includes(trimmed)) {
      newOptions = [trimmed, ...newOptions];
      setOptions(newOptions);
      localStorage.setItem(`sr_options_${fieldKey}`, JSON.stringify(newOptions));
      pushGlobalSettings();
    }
    
    onChange(trimmed);
    setIsOpen(false);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const exactMatch = options.find(o => o.toLowerCase() === value.trim().toLowerCase());
  const showCreateNew = value.trim().length > 0 && !exactMatch;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`pr-8 ${className}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 text-slate-400 hover:text-blue-500 transition-colors"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {/* Always show the Create New option at the top */}
          <button
            onClick={() => {
              if (value.trim() && showCreateNew) {
                saveNewOption(value);
              } else {
                const newVal = prompt("Enter new option:");
                if (newVal) saveNewOption(newVal);
              }
            }}
            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2 border-b border-slate-100"
          >
            <Plus size={14} /> {value.trim() && showCreateNew ? `Create new "${value}"` : 'Create new option...'}
          </button>
          
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400 italic">No saved options yet</div>
          ) : (
            options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
