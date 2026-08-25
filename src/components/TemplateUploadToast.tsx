import React, { useState } from 'react';
import { toast, Toast } from 'react-hot-toast';
import { X, Upload } from 'lucide-react';

interface TemplateUploadToastProps {
  t: Toast;
  onSave: (name: string, docxBase64?: string, thumbnailBase64?: string, extractedFields?: string[]) => void;
}

export default function TemplateUploadToast({ t, onSave }: TemplateUploadToastProps) {
  const [name, setName] = useState('');
  const [docxBase64, setDocxBase64] = useState<string>('');
  const [thumbnailBase64, setThumbnailBase64] = useState<string>('');
  const [docxName, setDocxName] = useState('');
  const [thumbName, setThumbName] = useState('');
  const [isParsing, setIsParsing] = useState(false);

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

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setIsParsing(true);
    let extractedFields: string[] = [];
    
    if (docxBase64) {
      try {
        const base64Data = docxBase64.split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const PizZip = (await import('pizzip')).default;
        const Docxtemplater = (await import('docxtemplater')).default;
        const InspectModule = (await import('docxtemplater/js/inspect-module.js')).default;
        
        const zip = new PizZip(bytes);
        const iModule = InspectModule();
        const doc = new Docxtemplater(zip, { modules: [iModule] });
        doc.render();
        const tags = iModule.getAllTags();
        extractedFields = Object.keys(tags);
      } catch (err) {
        console.error("Failed to parse docx tags:", err);
      }
    }

    onSave(name, docxBase64, thumbnailBase64, extractedFields);
    toast.dismiss(t.id);
    setIsParsing(false);
  };

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 flex-col overflow-hidden`}
    >
      <div className="bg-[#2b579a] text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-bold text-sm">Upload New Template</h3>
        <button onClick={() => toast.dismiss(t.id)} className="hover:bg-white/20 p-1 rounded transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Template Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chemical Analysis V2"
            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-[#2b579a] outline-none"
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">.DOCX File</label>
            <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50 hover:border-[#2b579a] transition-all bg-gray-50/50">
              <div className="flex flex-col items-center justify-center p-2 text-gray-400 text-center">
                {docxName ? (
                  <span className="text-[10px] font-bold text-[#2b579a] truncate w-[120px]">{docxName}</span>
                ) : (
                  <span className="text-[10px] font-semibold flex items-center gap-1"><Upload size={12}/> Upload</span>
                )}
              </div>
              <input type="file" accept=".docx" className="hidden" onChange={handleDocxUpload} />
            </label>
          </div>

          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Thumbnail</label>
            <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50 hover:border-[#2b579a] transition-all bg-gray-50/50">
              <div className="flex flex-col items-center justify-center p-2 text-gray-400 text-center">
                {thumbName ? (
                  <span className="text-[10px] font-bold text-[#2b579a] truncate w-[120px]">{thumbName}</span>
                ) : (
                  <span className="text-[10px] font-semibold flex items-center gap-1"><Upload size={12}/> Upload</span>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
            </label>
          </div>
        </div>
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || isParsing}
          className="px-4 py-1.5 bg-[#2b579a] hover:bg-[#1e4178] disabled:opacity-50 text-white text-xs font-bold rounded shadow"
        >
          {isParsing ? 'Parsing Fields...' : 'Save Template'}
        </button>
      </div>
    </div>
  );
}
