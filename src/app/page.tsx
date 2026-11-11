"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Template, DEFAULT_FORM_DATA, DEFAULT_TESTS, DEFAULT_TEMPLATES, ReportStatus, REPORT_STATUS_CONFIG } from '@/types';
import { FileText, Clock, ChevronRight, Search, Plus, Trash2, Edit2, Copy, Settings, Layout, Download, ChevronDown, Check } from 'lucide-react';
import TemplateUploadToast from '@/components/TemplateUploadToast';
import { toast } from 'react-hot-toast';
import PQSWordmark from '@/components/report/PQSWordmark';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import packageJson from '../../package.json';
import { pushGlobalSettings } from '@/lib/sync';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function HomePage() {
  const router = useRouter();
  const appVersion = packageJson.version;

  useEffect(() => {
    // Relying on packageJson.version directly
  }, []);
  const { data: recentReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['recentReports'],
    queryFn: async () => {
      const { data: reports, error } = await supabase
        .from('receipts')
        .select('id, data, password, created_at')
        .neq('id', 'GLOBAL_SETTINGS')
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

        const rawStatus = r.data?.formData?.status as ReportStatus | undefined;
        const status: ReportStatus = rawStatus || (r.data?.type === 'invoice' ? 'Dispatched' : 'Approved');

        return {
          id: r.id,
          reportNo: r.id,
          applicant: applicantValue,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '-',
          password: r.data?.type === 'invoice' ? '-' : (r.password || '-'),
          type: r.data?.type || 'report',
          status,
          rawData: r.data
        };
      });
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ReportStatus>('All');
  const [activeStatusDropdown, setActiveStatusDropdown] = useState<string | null>(null);

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
    const hasPqsLetterhead = loadedTemplates.some((t: Template) => t.id === 'pqs-letterhead');
    
    const updatedTemplates = [...loadedTemplates];
    
    // Add PQS templates to the very beginning if they don't exist
    if (!hasPqsLetterhead) {
      updatedTemplates.unshift({
        id: 'pqs-letterhead',
        name: 'PQS LETTERHEAD',
        formData: DEFAULT_FORM_DATA,
        tests: [],
        createdAt: new Date().toISOString(),
        thumbnail: 'pqs-letterhead'
      });
    }
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
    
    if (!hasPqsReport || !hasPqsInvoice || !hasPqsLetterhead) {
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
    const matchesSearch = (
      report.reportNo.toLowerCase().includes(term) ||
      report.applicant.toLowerCase().includes(term) ||
      report.date.toLowerCase().includes(term)
    );
    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (e: React.MouseEvent, id: string, newStatus: ReportStatus, rawData: any) => {
    e.stopPropagation();
    setActiveStatusDropdown(null);
    try {
      const updatedData = {
        ...rawData,
        formData: {
          ...rawData?.formData,
          status: newStatus
        }
      };
      const { error } = await supabase.from('receipts').update({ data: updatedData }).eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['recentReports'] });
      toast.success(`Updated ${id} to "${REPORT_STATUS_CONFIG[newStatus].label}"`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

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
      
      const updatedTemplates = [...templates];
      updatedTemplates.unshift(newTemplate);
      
      setTemplates(updatedTemplates);
      localStorage.setItem('sr_templates', JSON.stringify(updatedTemplates));
      pushGlobalSettings();
      toast.success('Template saved successfully!');
    } catch (error) {
      toast.error('Failed to save template. File might be too large for browser storage.');
      console.error(error);
    }
  };

  const queryClient = useQueryClient();
  
  const handleDeleteReport = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${id}?`)) {
      await supabase.from('receipts').delete().eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['recentReports'] });
      toast.success("Report deleted!");
    }
  };

  const [isCopying, setIsCopying] = useState<string | null>(null);

  const handleCopyReport = async (e: React.MouseEvent, report: { id: string; type: string; [key: string]: unknown }) => {
    e.stopPropagation();
    if (isCopying) return;

    setIsCopying(report.id);
    const toastId = toast.loading(`Duplicating ${report.id}...`);

    try {
      const { data: original, error: fetchErr } = await supabase
        .from('receipts')
        .select('*')
        .eq('id', report.id)
        .single();

      if (fetchErr || !original) {
        toast.error("Could not load original file to copy", { id: toastId });
        setIsCopying(null);
        return;
      }

      // Generate a brand new unique ID
      let newId = '';
      let isUnique = false;
      const type = (original.data?.type || report.type || 'report').toLowerCase();

      for (let attempts = 0; attempts < 10; attempts++) {
        const random6 = Math.floor(100000 + Math.random() * 900000);
        if (type === 'invoice' || String(report.id).startsWith('pqs-')) {
          const d = new Date();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yy = String(d.getFullYear()).slice(-2);
          newId = `pqs-${mm}${yy}-${random6}`;
        } else if (type === 'letterhead' || String(report.id).toLowerCase().includes('letth')) {
          newId = `letth-${random6}`;
        } else {
          newId = String(random6);
        }

        const { data: existing } = await supabase
          .from('receipts')
          .select('id')
          .eq('id', newId)
          .maybeSingle();

        if (!existing) {
          isUnique = true;
          break;
        }
      }

      if (!isUnique || !newId) {
        toast.error("Failed to generate a unique file number. Try again.", { id: toastId });
        setIsCopying(null);
        return;
      }

      const isInvoice = type === 'invoice' || String(report.id).startsWith('pqs-');
      const newPassword = isInvoice ? '' : newId.slice(-4);

      // Deep clone data and update the ID fields
      const duplicatedData = JSON.parse(JSON.stringify(original.data || {}));
      if (duplicatedData.formData) {
        if (duplicatedData.formData.reportNo !== undefined) {
          duplicatedData.formData.reportNo = newId;
        }
        if (duplicatedData.formData.invoiceNo !== undefined) {
          duplicatedData.formData.invoiceNo = newId;
        }
        if (Array.isArray(duplicatedData.formData.dynamicFields)) {
          duplicatedData.formData.dynamicFields.forEach((f: any) => {
            const lbl = (f?.label || '').toUpperCase();
            if (lbl.includes('REPORT NO') || lbl.includes('REPORT #') || lbl.includes('INVOICE NO') || lbl.includes('INVOICE #')) {
              f.value = newId;
            }
          });
        }
      }

      const { error: insertErr } = await supabase.from('receipts').insert({
        id: newId,
        password: newPassword,
        data: duplicatedData,
        created_at: new Date().toISOString()
      });

      if (insertErr) {
        toast.error(`Failed to duplicate: ${insertErr.message}`, { id: toastId });
      } else {
        queryClient.invalidateQueries({ queryKey: ['recentReports'] });
        if (isInvoice) {
          toast.success(`Duplicated as ${newId}!`, { id: toastId });
        } else {
          toast.success(`Duplicated as ${newId}! (Password: ${newPassword})`, { id: toastId });
        }
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to duplicate file", { id: toastId });
    } finally {
      setIsCopying(null);
    }
  };

  const handleRenameReport = async (e: React.MouseEvent, oldId: string) => {
    e.stopPropagation();
    const newId = prompt(`Rename ${oldId} to:`, oldId);
    if (newId && newId !== oldId) {
      const { data } = await supabase.from('receipts').select('*').eq('id', oldId).single();
      if (data) {
        data.id = newId;
        const { error } = await supabase.from('receipts').insert(data);
        if (!error) {
          await supabase.from('receipts').delete().eq('id', oldId);
          queryClient.invalidateQueries({ queryKey: ['recentReports'] });
          toast.success("Report renamed!");
        } else {
          toast.error("Failed to rename. Name might already exist.");
        }
      }
    }
  };

  const handleNewReport = () => {
    window.location.href = '/pas-report/';
  };

  const handleOpenTemplate = (template: Template) => {
    if (template.id === 'pqs-letterhead') {
      window.location.href = '/pqs-letterhead/';
      return;
    }
    if (template.id === 'pqs-invoice' || template.id === 'pas-invoice') {
      window.location.href = '/invoice/';
      return;
    }
    // All report templates use the modern PQS Report engine (/pas-report/)
    sessionStorage.setItem('sr_template_data', JSON.stringify(template));
    window.location.href = '/pas-report/?template=' + template.id;
  };

  const handleOpenReport = (report: Record<string, unknown>) => {
    if (report.type === 'invoice') {
      window.location.href = '/invoice/?id=' + report.reportNo;
    } else if (report.type === 'letterhead') {
      window.location.href = '/pqs-letterhead/?id=' + report.reportNo;
    } else {
      window.location.href = '/pas-report/?id=' + report.reportNo;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-sans">
      
      {/* Top Bar */}
      <div className="bg-white px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Typographic Logo */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-[#2b579a]">
            <img src="/pqs-logo.png" alt="PQS Logo" className="w-10 h-10 sm:w-16 sm:h-16 object-contain shrink-0" />
            <div className="flex flex-col justify-center gap-0.5 mt-0.5">
              <img src="/pqs-wordmark.png" alt="PQS Wordmark" className="h-4 sm:h-6 object-contain origin-left" style={{ objectPosition: 'left center' }} />
              <span className="text-[8.5px] sm:text-[10.5px] font-semibold text-gray-500 uppercase tracking-wider sm:tracking-widest leading-none">
                Laboratory Information Management System
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PWAInstallPrompt variant="button" />
          <button
            onClick={() => window.location.href = '/settings/'}
            className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 hover:bg-gray-200 px-3 sm:px-4 py-2 rounded-lg transition-all text-xs sm:text-sm text-gray-700"
          >
            <Settings size={15} />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">

        {/* NEW REPORT Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">New</h2>
          <div className="flex gap-5 flex-wrap">
            
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
                    ) : template.thumbnail === 'pqs-letterhead' ? (
                      <div className="absolute inset-0 bg-white opacity-80 group-hover:opacity-100 transition-opacity flex flex-col items-start justify-start border border-gray-200 rounded p-4 pt-6">
                        <PQSWordmark style={{ height: '12px', width: 'auto' }} className="mb-2 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="w-full h-0.5 bg-[#071b3d] rounded mb-2"></div>
                        <div className="w-full h-[1px] bg-gray-200 mb-1 mt-4"></div>
                        <div className="w-3/4 h-[1px] bg-gray-200 mb-1"></div>
                        <div className="w-5/6 h-[1px] bg-gray-200 mb-1"></div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} />
                Recent Files
              </h2>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                {filteredReports.length}
              </span>
            </div>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by date, file #, applicant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2b579a] transition-shadow bg-white"
              />
            </div>
          </div>

          {/* Status Pipeline Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 ${statusFilter === 'All' ? 'bg-[#2b579a] text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              All Files ({recentReports.length})
            </button>
            {(['Received', 'In Testing', 'Draft', 'Reviewed', 'Approved', 'Dispatched'] as ReportStatus[]).map((st) => {
              const count = recentReports.filter(r => r.status === st).length;
              const conf = REPORT_STATUS_CONFIG[st];
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
                    isActive 
                      ? `${conf.bg} ${conf.text} ${conf.border} ring-2 ring-offset-1 ring-blue-400 shadow-xs` 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                  {conf.label}
                  <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg p-10 text-center text-gray-400 text-sm">Loading...</div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-400">
              <FileText size={40} className="mx-auto mb-3 text-gray-300" />
              {recentReports.length === 0 ? (
                <p className="text-sm">No reports yet. Click a template above to create one.</p>
              ) : (
                <p className="text-sm">No reports match your filter criteria.</p>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Cards View (screens < 768px, eliminates horizontal scroll) */}
              <div className="block md:hidden space-y-3">
                {filteredReports.map((report) => {
                  const conf = REPORT_STATUS_CONFIG[report.status] || REPORT_STATUS_CONFIG['Approved'];
                  return (
                    <div
                      key={`mobile-${report.id}`}
                      onClick={() => handleOpenReport(report)}
                      className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs active:bg-blue-50/50 transition-all flex flex-col gap-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#2b579a]">{report.reportNo}</span>
                          <span className="text-[10px] font-semibold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{report.type}</span>
                        </div>
                        
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setActiveStatusDropdown(activeStatusDropdown === `m-${report.id}` ? null : `m-${report.id}`)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${conf.bg} ${conf.text} ${conf.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                            <span>{conf.label}</span>
                            <ChevronDown size={11} className="opacity-60" />
                          </button>
                          {activeStatusDropdown === `m-${report.id}` && (
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 text-xs">
                              <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">Update Status</div>
                              {(['Received', 'In Testing', 'Draft', 'Reviewed', 'Approved', 'Dispatched'] as ReportStatus[]).map((st) => {
                                const sConf = REPORT_STATUS_CONFIG[st];
                                const isCurrent = report.status === st;
                                return (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={(e) => {
                                      handleUpdateStatus(e, report.id, st, report.rawData);
                                      setActiveStatusDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between transition-colors ${isCurrent ? 'font-bold text-[#2b579a] bg-blue-50/50' : 'text-gray-700'}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`w-1.5 h-1.5 rounded-full ${sConf.dot}`} />
                                      <span>{sConf.label}</span>
                                    </div>
                                    {isCurrent && <Check size={12} className="text-[#2b579a]" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">{report.applicant || 'No applicant name'}</h4>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                          <span>📅 {report.date}</span>
                          {report.password && report.password !== '-' && (
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-gray-600">🔑 {report.password}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 mt-0.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleCopyReport(e, report)}
                            disabled={isCopying === report.id}
                            className="p-1.5 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Duplicate File"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={(e) => handleRenameReport(e, report.id)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Rename"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteReport(e, report.id)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleOpenReport(report)}
                          className="text-xs font-bold text-[#2b579a] flex items-center gap-1 hover:underline"
                        >
                          <span>Open</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Structured Table View (screens >= 768px) */}
              <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3 font-semibold">File #</th>
                      <th className="px-6 py-3 font-semibold">File Type</th>
                      <th className="px-6 py-3 font-semibold">Applicant</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Date</th>
                      <th className="px-6 py-3 font-semibold">Password</th>
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
                        <td className="px-6 py-4 text-gray-500 capitalize">{report.type}</td>
                        <td className="px-6 py-4 text-gray-700">{report.applicant}</td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block">
                            {(() => {
                              const conf = REPORT_STATUS_CONFIG[report.status] || REPORT_STATUS_CONFIG['Approved'];
                              return (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setActiveStatusDropdown(activeStatusDropdown === report.id ? null : report.id)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.bg} ${conf.text} ${conf.border} hover:shadow-xs transition-all`}
                                    title="Click to update sample status"
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                                    <span>{conf.label}</span>
                                    <ChevronDown size={11} className="opacity-60" />
                                  </button>
                                  {activeStatusDropdown === report.id && (
                                    <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 text-xs">
                                      <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">Update Status</div>
                                      {(['Received', 'In Testing', 'Draft', 'Reviewed', 'Approved', 'Dispatched'] as ReportStatus[]).map((st) => {
                                        const sConf = REPORT_STATUS_CONFIG[st];
                                        const isCurrent = report.status === st;
                                        return (
                                          <button
                                            key={st}
                                            type="button"
                                            onClick={(e) => handleUpdateStatus(e, report.id, st, report.rawData)}
                                            className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between transition-colors ${isCurrent ? 'font-bold text-[#2b579a] bg-blue-50/50' : 'text-gray-700'}`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className={`w-1.5 h-1.5 rounded-full ${sConf.dot}`} />
                                              <span>{sConf.label}</span>
                                            </div>
                                            {isCurrent && <Check size={12} className="text-[#2b579a]" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{report.date}</td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{report.password || '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={(e) => handleCopyReport(e, report)} disabled={isCopying === report.id} className="text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50" title="Duplicate File"><Copy size={16} /></button>
                            <button onClick={(e) => handleRenameReport(e, report.id)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Rename"><Edit2 size={16} /></button>
                            <button onClick={(e) => handleDeleteReport(e, report.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={16} /></button>
                            <ChevronRight size={16} className="text-gray-400 inline" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <div className="mt-8 mb-4 text-center flex flex-col items-center justify-center gap-1 text-[10px] text-gray-400">
          <span>v{appVersion}</span>
          <span>
            Powered by <a href="https://www.linkedin.com/in/areeb-iqbal-63b444247/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2b579a] hover:underline font-medium transition-colors">Areeb Iqbal</a>
          </span>
        </div>
      </div>
    </div>
  );
}
