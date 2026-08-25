"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Template, DEFAULT_FORM_DATA, DEFAULT_TESTS, DEFAULT_TEMPLATES } from '@/types';
import { Plus, FileText, Settings, Trash2, Clock, ChevronRight, Layout, Download, Search } from 'lucide-react';
import TemplateUploadToast from '@/components/TemplateUploadToast';
import { toast } from 'react-hot-toast';
import PQSWordmark from '@/components/report/PQSWordmark';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import packageJson from '../../package.json';

export default function HomePage() {
  const router = useRouter();
  const [appVersion, setAppVersion] = useState(packageJson.version);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
        if (!isTauri) {
          const res = await fetch('https://api.github.com/repos/mdawoodali/LABORATORY-INFORMATION-MANAGEMENT-SYSTEM/releases/latest');
          if (res.ok) {
            const data = await res.json();
            if (data && data.tag_name) {
              setAppVersion(data.tag_name.replace('v', ''));
            }
          }
        }
      } catch (e) {}
    };
    fetchVersion();
  }, []);
  const { data: recentReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['recentReports'],
    queryFn: async () => {
      const { data: reports, error } = await supabase
        .from('receipts')
        .select('id, data, created_at')
        .order('created_at', { ascending: false });

      if (error || !reports) return [];

      return reports.map(r => {
        const applicantField = r.data?.formData?.dynamicFields?.find((f: Record<string, unknown>) => f.label === 'APPLICANT');
        
        let applicantValue = 'Untitled';
        if (r.data?.type === 'invoice') {
          applicantValue = r.data?.formData?.customerName || 'Unknown Customer';
        } else {
          applicantValue = applicantField ? applicantField.value : (r.data?.formData?.applicant || 'Untitled');
        }

        return {
          id: r.id,
          reportNo: r.id,
          applicant: applicantValue,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '-',
          type: r.data?.type || 'report'
        };
      });
    }
  });

  const [searchTerm, setSearchTerm] = useState('');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  async function loadData() {

    // Load templates from localStorage
    const savedTemplates = localStorage.getItem('sr_templates');
    let loadedTemplates = DEFAULT_TEMPLATES;
    if (savedTemplates) {
      try {
        loadedTemplates = JSON.parse(savedTemplates);
      } catch {
        console.error('Failed to parse templates');
      }
    }

    const hasPqsReport = loadedTemplates.some((t: Template) => t.id === 'pqs-report');
    const hasPqsInvoice = loadedTemplates.some((t: Template) => t.id === 'pqs-invoice');
    
    const updatedTemplates = [...loadedTemplates];
    
    // Add PQS templates to the very beginning if they don't exist
    if (!hasPqsInvoice) {
      updatedTemplates.unshift({
        id: 'pqs-invoice',
        name: 'PQS INVOICE',
        formData: DEFAULT_FORM_DATA,
        tests: [],
        createdAt: new Date().toISOString(),
        thumbnail: 'pqs-invoice'
      });
    }
    if (!hasPqsReport) {
      updatedTemplates.unshift({
        id: 'pqs-report',
        name: 'PQS REPORT',
        formData: DEFAULT_FORM_DATA,
        tests: [],
        createdAt: new Date().toISOString(),
        thumbnail: 'pqs-report'
      });
    }
    
    if (!hasPqsReport || !hasPqsInvoice) {
      localStorage.setItem('sr_templates', JSON.stringify(updatedTemplates));
    }

    setTemplates(updatedTemplates);
    setTemplatesLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const isLoading = reportsLoading || templatesLoading;

  const filteredReports = recentReports.filter(report => {
    const term = searchTerm.toLowerCase();
    return (
      report.reportNo.toLowerCase().includes(term) ||
      report.applicant.toLowerCase().includes(term) ||
      report.date.toLowerCase().includes(term)
    );
  });

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('sr_templates', JSON.stringify(updated));
    toast.success("Template deleted");
  };

  const handleSaveTemplate = (name: string, docxBase64?: string, thumbnailBase64?: string, extractedFields: string[] = []) => {
    try {
      const dynamicFields = extractedFields.map((field, index) => ({
        id: `f_${Date.now()}_${index}`,
        label: field,
        value: '',
        bold: false
      }));

      const newTemplate: Template = {
        id: Date.now().toString(),
        name,
        formData: { 
          ...DEFAULT_FORM_DATA, 
          reportNo: '', 
          dynamicFields: dynamicFields.length > 0 ? dynamicFields : undefined 
        },
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
    if (template.id === 'pqs-report') {
      router.push('/pas-report');
      return;
    }
    if (template.id === 'pqs-invoice') {
      router.push('/invoice');
      return;
    }
    if (template.id === 'pas-report') {
      router.push('/pas-report');
      return;
    }
    if (template.id === 'pas-invoice') {
      router.push('/invoice');
      return;
    }
    // Store template data in sessionStorage so editor can pick it up
    sessionStorage.setItem('sr_template_data', JSON.stringify(template));
    router.push('/editor?template=' + template.id);
  };

  const handleOpenReport = (report: Record<string, unknown>) => {
    if (report.type === 'invoice') {
      router.push('/invoice?id=' + report.reportNo);
    } else {
      router.push('/pas-report?id=' + report.reportNo);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-sans">
      
      {/* Top Bar */}
      <div className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-6">
          {/* Typographic Logo */}
          <div className="flex items-center gap-4 text-[#2b579a]">
            <img src="/lab_icon.jpg" alt="Logo Mark" className="w-20 h-20 object-contain mix-blend-multiply contrast-125 brightness-110 scale-125 origin-left" />
            <div className="font-[family-name:var(--font-montserrat)] tracking-tight leading-none flex items-center">
              <span className="text-2xl font-black text-gray-800">L.I.M.S</span>
              <span className="text-xs font-semibold ml-3 text-gray-500 uppercase tracking-widest hidden md:inline-block">
                Laboratory Information Management System
                <span className="ml-2 text-gray-400 font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">v{appVersion}</span>
              </span>
            </div>
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
                  {(template.thumbnail === 'pas-report' || template.thumbnail === 'pqs-report') ? (
                        <div className="absolute inset-0 bg-white opacity-80 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-start border border-gray-200 rounded p-4 pt-8">
                          <PQSWordmark style={{ height: '16px', width: 'auto' }} className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="w-full h-1 bg-[#071b3d] rounded mb-1"></div>
                          <div className="w-3/4 h-1 bg-gray-300 rounded mb-4"></div>
                          <div className="w-full h-[1px] bg-gray-200 mb-1"></div>
                          <div className="w-full h-[1px] bg-gray-200 mb-1"></div>
                          <div className="w-3/4 h-[1px] bg-gray-200"></div>
                        </div>
                      ) : (template.thumbnail === 'pas-invoice' || template.thumbnail === 'pqs-invoice') ? (
                      <div className="absolute inset-0 bg-white opacity-80 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-start border border-gray-200 rounded p-4 pt-8">
                        <PQSWordmark style={{ height: '16px', width: 'auto' }} className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="w-full h-2 bg-orange-300 rounded mb-2"></div>
                        <div className="w-full h-[1px] bg-gray-200 mb-1"></div>
                        <div className="w-full h-[1px] bg-gray-200 mb-1"></div>
                        <div className="w-full h-[1px] bg-gray-200 mb-1"></div>
                      </div>
                    ) : template.thumbnail ? (
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
              onClick={() => toast.custom((t) => <TemplateUploadToast t={t} onSave={handleSaveTemplate} />, { duration: Infinity })}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} />
              Recent Reports
            </h2>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by date, report #, applicant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2b579a] transition-shadow"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg p-10 text-center text-gray-400 text-sm">Loading...</div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-400">
              <FileText size={40} className="mx-auto mb-3 text-gray-300" />
              {recentReports.length === 0 ? (
                <p className="text-sm">No reports yet. Click <strong>&quot;Default&quot;</strong> to create one.</p>
              ) : (
                <p className="text-sm">No reports match your search.</p>
              )}
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
                  {filteredReports.map((report, idx) => (
                    <tr
                      key={report.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                      onClick={() => handleOpenReport(report)}
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
    </div>
  );
}
