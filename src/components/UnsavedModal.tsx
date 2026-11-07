/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Save } from 'lucide-react';

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
  const [focusedIndex, setFocusedIndex] = useState<number>(2); // Default to Save button
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(2);
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(defaultFilename);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSaving) return;
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
        if (focusedIndex === 2) handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, onCancel, onDontSave, isSaving, defaultFilename]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key="unsavedModal"
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
                  You have unsaved changes. Do you want to save your progress before {action === 'CLOSE' ? 'closing the app' : 'leaving'}?
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50/30 flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isSaving}
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
              disabled={isSaving}
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
              onClick={handleSave}
              disabled={isSaving}
              onMouseEnter={() => setFocusedIndex(2)}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all outline-none flex items-center gap-2 ${
                focusedIndex === 2 
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2 shadow-lg shadow-blue-600/20' 
                  : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
