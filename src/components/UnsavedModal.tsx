/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, FileText, Save, X, Trash2 } from 'lucide-react';

export type UnsavedAction = 'CLOSE' | 'BACK' | 'REFRESH' | null;

interface UnsavedModalProps {
  isOpen: boolean;
  action: UnsavedAction;
  defaultFilename: string;
  onCancel: () => void;
  onDontSave: () => void;
  onSave: (filename: string) => Promise<void>;
}

export default function UnsavedModal({ isOpen, action, defaultFilename, onCancel, onDontSave, onSave }: UnsavedModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [filename, setFilename] = useState(defaultFilename);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFocusedIndex(0);
      setFilename(defaultFilename);
      setIsSaving(false);
    }
  }, [isOpen, defaultFilename]);

    const handleSave = async () => {
    const finalName = filename.trim() || defaultFilename;
    setIsSaving(true);
    try {
      await onSave(finalName);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Step 1: Navigation
      if (step === 1) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setFocusedIndex(i => (i < 2 ? i + 1 : i));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setFocusedIndex(i => (i > 0 ? i - 1 : i));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (focusedIndex === 0) onCancel();
          if (focusedIndex === 1) onDontSave();
          if (focusedIndex === 2) setStep(2);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      } 
      // Step 2: Filename input
      else if (step === 2) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setStep(1);
          setFocusedIndex(2);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, focusedIndex, onCancel, onDontSave]);

  // Auto-focus input when entering step 2
  useEffect(() => {
    if (step === 2 && inputRef.current) {
      inputRef.current.select();
    }
  }, [step]);



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle className="text-amber-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Unsaved Changes</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    You have unsaved changes. Do you want to save before {action === 'CLOSE' ? 'closing the app' : 'leaving'}?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50/30 flex justify-end gap-3">
              <button
                onClick={onCancel}
                onMouseEnter={() => setFocusedIndex(0)}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all outline-none ${
                  focusedIndex === 0 
                    ? 'bg-slate-200 text-slate-800 ring-2 ring-slate-400 ring-offset-2' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={onDontSave}
                onMouseEnter={() => setFocusedIndex(1)}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all outline-none ${
                  focusedIndex === 1 
                    ? 'bg-red-500 text-white ring-2 ring-red-500 ring-offset-2 shadow-lg shadow-red-500/20' 
                    : 'bg-white text-red-600 border border-slate-200 hover:bg-red-50'
                }`}
              >
                Don&apos;t Save
              </button>
              <button
                onClick={() => setStep(2)}
                onMouseEnter={() => setFocusedIndex(2)}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all outline-none ${
                  focusedIndex === 2 
                    ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2 shadow-lg shadow-blue-600/20' 
                    : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md'
                }`}
              >
                Save PDF
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Save PDF Document</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Enter a filename for your document.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Filename</label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  disabled={isSaving}
                  className="w-full pl-4 pr-12 py-3 bg-white border-2 border-blue-100 focus:border-blue-500 rounded-xl outline-none transition-all text-slate-800 font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm pointer-events-none">
                  .pdf
                </span>
              </div>
            </div>

            <div className="p-6 pt-0 flex justify-end gap-3">
              <button
                onClick={() => { setStep(1); setFocusedIndex(2); }}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl font-medium text-sm bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save & {action === 'CLOSE' ? 'Close' : 'Exit'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
