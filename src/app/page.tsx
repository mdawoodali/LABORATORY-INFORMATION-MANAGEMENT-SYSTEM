"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Template, DEFAULT_FORM_DATA, DEFAULT_TESTS } from '@/types';
import { Plus, FileText, Settings, Trash2, Clock, ChevronRight, Layout, Download, Activity } from 'lucide-react';
import TemplateModal from '@/components/TemplateModal';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    // Load recent reports from Supabase
    try {
      const { data: reports } = await supabase
        .from('receipts')
        .select('id, data, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (reports) {
        setRecentReports(reports.map(r => ({
          id: r.id,
          reportNo: r.id,
          applicant: r.data?.formData?.applicant || 'Untitled',
          date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '-',
        })));
      }
    } catch (e) {
      console.error('Failed to load reports:', e);
    }

    // Load templates from localStorage
    const savedTemplates = localStorage.getItem('sr_templates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error('Failed to parse templates:', e);
      }
    }

    setIsLoading(false);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('sr_templates', JSON.stringify(updated));
    toast.success('Template deleted');
  };

  const handleSaveTemplate = (name: string, docxBase64?: string, thumbnailBase64?: string) => {
    try {
      const newTemplate: Template = {
        id: Date.now().toString(),
        name,
        formData: { ...DEFAULT_FORM_DATA, reportNo: '' },
        tests: [...DEFAULT_TESTS],
        createdAt: new Date().toISOString(),
        fileData: docxBase64,
        thumbnail: thumbnailBase64,
      };
      
      const updated = [...templates, newTemplate];
      setTemplates(updated);
      localStorage.setItem('sr_templates', JSON.stringify(updated));
      toast.success('Template added successfully!');
    } catch (error) {
      toast.error('Failed to save template. File might be too large for browser storage.');
      console.error(error);
    }
  };

  const handleNewReport = () => {
    router.push('/editor');
  };

  const handleOpenTemplate = (template: Template) => {
    // Store template data in sessionStorage so editor can pick it up
    sessionStorage.setItem('sr_template_data', JSON.stringify(template));
    router.push('/editor?template=' + template.id);
  };

  const handleOpenReport = (reportNo: string) => {
    router.push('/editor?report=' + reportNo);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-sans">
      
      {/* Top Bar */}
      <div className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-6">
          {/* Typographic Logo */}
          <div className="flex items-center gap-2 text-[#2b579a]">
            <Activity size={32} strokeWidth={2.5} />
            <div className="font-[family-name:var(--font-montserrat)] tracking-tight leading-none">
              <span className="text-2xl font-black">S.R.</span>
              <span className="text-xl font-bold ml-1 opacity-90">LABORATORIES</span>
            </div>
          </div>
          
          <div className="ml-8 pl-8 border-l border-gray-200 hidden md:block">
            <h1 className="text-lg font-bold tracking-wide text-gray-700">Report Management System</h1>
            <p className="text-gray-400 text-xs tracking-wider uppercase font-semibold">Internal Portal</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/settings')}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all text-sm text-gray-700"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* NEW REPORT Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">New</h2>
          <div className="flex gap-5 flex-wrap">
            
            {/* Default Template Card */}
            <motion.button
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewReport}
              className="group relative w-[180px] h-[240px] bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#2b579a] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-end"
            >
              <div className="absolute inset-0 bg-[url('/template_preview.png')] bg-cover bg-top bg-no-repeat opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/10 to-transparent"></div>
              <div className="relative z-10 p-3 w-full text-center bg-white/80 backdrop-blur-sm border-t border-gray-100">
                <span className="text-sm font-bold text-gray-700 group-hover:text-[#2b579a] transition-colors">Default</span>
              </div>
            </motion.button>

            {/* Template Cards */}
            {templates.map((template, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={template.id} 
                className="relative group flex flex-col gap-2"
              >
                <motion.button
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenTemplate(template)}
                  className="w-[180px] h-[240px] bg-white border border-gray-200 rounded-lg flex flex-col justify-between p-4 hover:shadow-lg hover:border-[#2b579a] transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent z-10 pointer-events-none" />
                  
                  {template.thumbnail ? (
                    <div className="absolute inset-0 bg-cover bg-top opacity-60 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `url(${template.thumbnail})` }} />
                  ) : (
                    <div className="w-full h-[140px] bg-gradient-to-b from-gray-50 to-gray-100 rounded flex items-center justify-center border border-gray-100 relative z-0 mt-2">
                      <Layout size={36} className="text-gray-300" />
                    </div>
                  )}

                  <div className="mt-auto relative z-20 bg-white/80 backdrop-blur-sm p-2 -mx-2 rounded">
                    <div className="text-sm font-bold text-gray-700 truncate">{template.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{new Date(template.createdAt).toLocaleDateString()}</div>
                  </div>
                </motion.button>
                
                {template.fileData && (
                  <a
                    href={template.fileData}
                    download={`${template.name}.docx`}
                    className="absolute top-2 left-2 z-30 bg-[#2b579a] text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#1e4178] shadow"
                    title="Download DOCX"
                  >
                    <Download size={12} />
                  </a>
                )}
                
                <button
                  onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                  className="absolute top-2 right-2 z-30 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow"
                  title="Delete Template"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}

            {/* Add Template Card */}
            <motion.button
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="group w-[180px] h-[240px] bg-white/50 border border-dashed border-gray-200 rounded-lg flex flex-col justify-center items-center gap-2 hover:border-[#2b579a] hover:bg-blue-50/30 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Plus size={20} className="text-gray-400 group-hover:text-[#2b579a]" />
              </div>
              <span className="text-xs text-gray-400 group-hover:text-[#2b579a] font-bold">Add Template</span>
            </motion.button>
          </div>
        </motion.div>

        {/* RECENT REPORTS Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Clock size={14} />
            Recent Reports
          </h2>

          {isLoading ? (
            <div className="bg-white rounded-lg p-10 text-center text-gray-400 text-sm">Loading...</div>
          ) : recentReports.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-400">
              <FileText size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No reports yet. Click <strong>"Default"</strong> to create one.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Report #</th>
                    <th className="px-6 py-3 font-semibold">Applicant</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report, idx) => (
                    <tr
                      key={report.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                      onClick={() => handleOpenReport(report.reportNo)}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-[#2b579a]">{report.reportNo}</td>
                      <td className="px-6 py-4 text-gray-700">{report.applicant}</td>
                      <td className="px-6 py-4 text-gray-500">{report.date}</td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight size={16} className="text-gray-400 inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <TemplateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTemplate} 
      />
    </div>
  );
}
