/* eslint-disable */
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
  multiline?: boolean;
}

export default function DropdownInput({
  value,
  onChange,
  fieldKey,
  className = '',
  placeholder = '',
  defaultOptions,
  multiline = false
}: DropdownInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<string[]>(defaultOptions || []);
  const [isMultiline, setIsMultiline] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const effectiveMultiline = multiline || isMultiline || Boolean(value && value.includes('\n'));

  // Load options from localStorage on mount and when fieldKey changes
  useEffect(() => {
    const saved = localStorage.getItem(`sr_options_${fieldKey.trim().toLowerCase()}`);
    if (saved) {
      try {
        setOptions(JSON.parse(saved));
      } catch {
        console.error("Failed to parse options for", fieldKey);
        setOptions(defaultOptions || []);
      }
    } else {
      setOptions(defaultOptions || []);
    }
  }, [fieldKey, defaultOptions]);

  // Listen for sync updates
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem(`sr_options_${fieldKey.trim().toLowerCase()}`);
      if (saved) {
        try { setOptions(JSON.parse(saved)); } catch {}
      } else {
        setOptions(defaultOptions || []);
      }
    };
    window.addEventListener('local-storage-synced', handleSync);
    return () => window.removeEventListener('local-storage-synced', handleSync);
  }, [fieldKey, defaultOptions]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // When user presses Ctrl+Enter or Cmd+Enter (or Shift+Enter in multiline mode)
    if ((e.ctrlKey || e.metaKey || (effectiveMultiline && e.shiftKey)) && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget;
      const start = target.selectionStart ?? (value ? value.length : 0);
      const end = target.selectionEnd ?? (value ? value.length : 0);
      const currentVal = value || '';

      const nextValue = currentVal.slice(0, start) + '\n' + currentVal.slice(end);
      setIsMultiline(true);
      onChange(nextValue);

      const newCursorPos = start + 1;
      setTimeout(() => {
        const el = textareaRef.current || inputRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 10);
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const saveNewOption = (newVal: string) => {
    const trimmed = newVal.trim();
    if (!trimmed) return;
    
    let newOptions = [...options];
    if (!newOptions.includes(trimmed)) {
      newOptions = [trimmed, ...newOptions];
      setOptions(newOptions);
      localStorage.setItem(`sr_options_${fieldKey.trim().toLowerCase()}`, JSON.stringify(newOptions));
      pushGlobalSettings();
    }
    
    onChange(trimmed);
    setIsOpen(false);
  };

  const handleSelect = (option: string) => {
    if (effectiveMultiline && value && value.includes('\n')) {
      const target = textareaRef.current;
      if (target) {
        const start = target.selectionStart ?? value.length;
        const end = target.selectionEnd ?? value.length;
        if (value.slice(0, start).endsWith('\n') || start === value.length) {
          const nextValue = value.slice(0, start) + option + value.slice(end);
          onChange(nextValue);
          setIsOpen(false);
          return;
        }
      }
    }
    onChange(option);
    setIsOpen(false);
  };

  const safeVal = value || '';
  const exactMatch = options.find(o => o.toLowerCase() === safeVal.trim().toLowerCase());
  const showCreateNew = safeVal.trim().length > 0 && !exactMatch;
  const lineCount = Math.max(1, safeVal.split('\n').length);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-start">
        {effectiveMultiline ? (
          <textarea
            ref={textareaRef}
            value={safeVal}
            onChange={(e) => {
              onChange(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={Math.min(6, Math.max(1, lineCount))}
            className={`pr-8 resize-y min-h-[34px] leading-relaxed ${className}`}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={safeVal}
            onChange={(e) => {
              onChange(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`pr-8 ${className}`}
          />
        )}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-2 text-slate-400 hover:text-blue-500 transition-colors"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {/* Always show the Create New option at the top */}
          <button
            onClick={() => {
              if (safeVal.trim() && showCreateNew) {
                saveNewOption(safeVal);
              } else {
                const newVal = prompt("Enter new option:");
                if (newVal) saveNewOption(newVal);
              }
            }}
            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2 border-b border-slate-100"
          >
            <Plus size={14} /> {safeVal.trim() && showCreateNew ? `Create new "${safeVal.trim().length > 25 ? safeVal.trim().slice(0, 25).replace(/\n/g, ' ') + '...' : safeVal.trim().replace(/\n/g, ' ')}"` : 'Create new option...'}
          </button>
          
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400 italic">No saved options yet</div>
          ) : (
            options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0 whitespace-pre-wrap"
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
