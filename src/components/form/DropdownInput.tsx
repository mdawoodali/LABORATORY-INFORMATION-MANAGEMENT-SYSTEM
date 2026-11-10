/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, X, Trash2 } from 'lucide-react';
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isMultiline, setIsMultiline] = useState(false);
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [inlineText, setInlineText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingInline && inlineInputRef.current) {
      inlineInputRef.current.focus();
    }
  }, [isAddingInline]);

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
        setIsAddingInline(false);
        setInlineText('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
        return;
      }
      if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && highlightedIndex >= 0 && options[highlightedIndex]) {
        e.preventDefault();
        handleSelect(options[highlightedIndex]);
        setHighlightedIndex(-1);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Escape') {
        setIsOpen(false);
        setIsAddingInline(false);
        setHighlightedIndex(-1);
        return;
      }
    }

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
      setIsAddingInline(false);
      setInlineText('');
      setHighlightedIndex(-1);
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
          {/* Create new option: inline form or button */}
          {isAddingInline ? (
            <div className="p-2 border-b border-slate-200 bg-blue-50/70 flex items-center gap-1.5 sticky top-0 bg-white z-10">
              <input
                ref={inlineInputRef}
                type="text"
                value={inlineText}
                onChange={(e) => setInlineText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (inlineText.trim()) {
                      saveNewOption(inlineText);
                      setIsAddingInline(false);
                      setInlineText('');
                    }
                  } else if (e.key === 'Escape') {
                    setIsAddingInline(false);
                    setInlineText('');
                  }
                }}
                placeholder="Type new option..."
                className="flex-1 min-w-0 border border-blue-400 rounded px-2.5 py-1 text-xs sm:text-sm bg-white outline-none focus:ring-1 focus:ring-blue-500 shadow-sm text-slate-800"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  if (inlineText.trim()) {
                    saveNewOption(inlineText);
                    setIsAddingInline(false);
                    setInlineText('');
                  }
                }}
                disabled={!inlineText.trim()}
                className="bg-blue-600 disabled:opacity-40 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1 rounded shadow transition-all shrink-0 active:scale-95"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingInline(false);
                  setInlineText('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors shrink-0"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (safeVal.trim() && showCreateNew) {
                  saveNewOption(safeVal);
                } else {
                  setIsAddingInline(true);
                  setInlineText('');
                }
              }}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2 border-b border-slate-100 transition-colors"
            >
              <Plus size={14} /> {safeVal.trim() && showCreateNew ? `Create new "${safeVal.trim().length > 25 ? safeVal.trim().slice(0, 25).replace(/\n/g, ' ') + '...' : safeVal.trim().replace(/\n/g, ' ')}"` : 'Create new option...'}
            </button>
          )}
          
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400 italic">No saved options yet</div>
          ) : (
            options.map((opt, idx) => (
              <div
                key={idx}
                className={`group/item flex items-center justify-between px-3 py-2 text-sm transition-colors border-b border-slate-50 last:border-b-0 cursor-pointer ${
                  idx === highlightedIndex ? 'bg-blue-100 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <span className="whitespace-pre-wrap flex-1">{opt}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = options.filter(o => o !== opt);
                    setOptions(updated);
                    localStorage.setItem(`sr_options_${fieldKey.trim().toLowerCase()}`, JSON.stringify(updated));
                    pushGlobalSettings();
                  }}
                  className="text-slate-300 hover:text-red-600 opacity-0 group-hover/item:opacity-100 p-1 rounded transition-all shrink-0 ml-2"
                  title="Remove saved option"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
