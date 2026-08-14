import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, docxBase64?: string, thumbnailBase64?: string) => void;
}

export default function TemplateModal({ isOpen, onClose, onSave }: TemplateModalProps) {
  const [name, setName] = useState('');
  const [docxBase64, setDocxBase64] = useState<string>('');
  const [thumbnailBase64, setThumbnailBase64] = useState<string>('');
  const [docxName, setDocxName] = useState('');
  const [thumbName, setThumbName] = useState('');

  if (!isOpen) return null;

  const handleDocxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocxName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setDocxBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name, docxBase64, thumbnailBase64);
    setName('');
    setDocxBase64('');
    setThumbnailBase64('');
    setDocxName('');
    setThumbName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-[#2b579a] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">Add New Template</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Template Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chemical Analysis V2"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#2b579a] outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">.DOCX Template File (Optional)</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-[#2b579a] transition-all bg-gray-50/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                {docxName ? (
                  <>
                    <FileText size={24} className="mb-2 text-[#2b579a]" />
                    <p className="text-xs font-semibold text-[#2b579a]">{docxName}</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="mb-2" />
                    <p className="text-xs font-semibold">Click to upload .docx</p>
                  </>
                )}
              </div>
              <input type="file" accept=".docx" className="hidden" onChange={handleDocxUpload} />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Thumbnail Image (First Page) (Optional)</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-[#2b579a] transition-all bg-gray-50/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                {thumbName ? (
                  <>
                    <FileText size={24} className="mb-2 text-[#2b579a]" />
                    <p className="text-xs font-semibold text-[#2b579a]">{thumbName}</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="mb-2" />
                    <p className="text-xs font-semibold">Click to upload image</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
            </label>
            <p className="text-[10px] text-gray-400 mt-2 italic">Note: Browsers cannot automatically generate thumbnails from Word documents, so please upload a screenshot of the first page.</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-6 py-2 bg-[#2b579a] hover:bg-[#1e4178] disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow transition-all"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}
