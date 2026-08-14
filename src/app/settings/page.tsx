"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppSettings, DEFAULT_SETTINGS } from '@/types';
import { ArrowLeft, Download, Upload, Shield, Database, Save, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('sr_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('sr_settings', JSON.stringify(settings));
    setSaved(true);
    toast.success("Settings saved successfully!");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const { data: reports } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false });

      const templates = localStorage.getItem('sr_templates');
      const settingsData = localStorage.getItem('sr_settings');

      const backup = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        reports: reports || [],
        templates: templates ? JSON.parse(templates) : [],
        settings: settingsData ? JSON.parse(settingsData) : DEFAULT_SETTINGS,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SR_Labs_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exported successfully!");
    } catch (e) {
      toast.error('Export failed. Check console for details.');
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Reading file...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        
        // Import reports
        if (backup.reports && backup.reports.length > 0) {
          setImportStatus(`Importing ${backup.reports.length} reports...`);
          for (const report of backup.reports) {
            await supabase.from('receipts').upsert(report);
          }
        }

        // Import templates
        if (backup.templates && backup.templates.length > 0) {
          localStorage.setItem('sr_templates', JSON.stringify(backup.templates));
        }

        // Import settings
        if (backup.settings) {
          localStorage.setItem('sr_settings', JSON.stringify(backup.settings));
          setSettings(backup.settings);
        }

        setImportStatus(`✅ Imported ${backup.reports?.length || 0} reports, ${backup.templates?.length || 0} templates successfully!`);
        setTimeout(() => setImportStatus(''), 5000);
      } catch (err) {
        setImportStatus('❌ Import failed — invalid file format.');
        console.error(err);
        setTimeout(() => setImportStatus(''), 5000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-sans">
      
      {/* Top Bar */}
      <div className="bg-white px-8 py-4 flex items-center gap-4 shadow-sm border-b border-gray-200">
        <button
          onClick={() => router.push('/')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold tracking-wide text-[#2b579a]">Settings</h1>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">

        {/* General Settings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Shield size={18} className="text-[#2b579a]" />
            <h2 className="font-bold text-gray-700">General</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={e => setSettings(s => ({ ...s, companyName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#2b579a] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Default PDF Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={settings.defaultPassword}
                  onChange={e => setSettings(s => ({ ...s, defaultPassword: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 pr-12 text-sm font-mono focus:ring-2 focus:ring-[#2b579a] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-700">Auto Cloud Backup</div>
                  <div className="text-xs text-gray-400 mt-0.5">Automatically save every report to Supabase when generating PDF</div>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, autoBackup: !s.autoBackup }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.autoBackup ? 'bg-[#2b579a]' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${settings.autoBackup ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Signature Photo Picker */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Custom Signature</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-12 border border-gray-200 rounded flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                    {settings.signatureImage ? (
                      <img src={settings.signatureImage} alt="Signature" className="object-contain w-full h-full" />
                    ) : (
                      <span className="text-xs text-gray-400">Default</span>
                    )}
                  </div>
                  <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors border border-gray-200">
                    Upload Signature
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setSettings(s => ({ ...s, signatureImage: reader.result as string }));
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {settings.signatureImage && (
                    <button 
                      onClick={() => setSettings(s => ({ ...s, signatureImage: undefined }))}
                      className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Reset Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Backup & Restore */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Database size={18} className="text-[#2b579a]" />
            <h2 className="font-bold text-gray-700">Backup & Restore</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Backup Location</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.backupLocation}
                  onChange={e => setSettings(s => ({ ...s, backupLocation: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#2b579a] outline-none transition-all bg-gray-50"
                  placeholder="Select a folder..."
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      // @ts-ignore
                      const dirHandle = await window.showDirectoryPicker();
                      setSettings(s => ({ ...s, backupLocation: dirHandle.name }));
                    } catch (err) {
                      console.error("Folder selection cancelled or not supported", err);
                    }
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 rounded-lg transition-colors text-sm border border-gray-300"
                >
                  Browse...
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExportAll}
                disabled={isExporting}
                className="flex-1 bg-[#2b579a] hover:bg-[#1e4178] disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Download size={16} />
                {isExporting ? 'Exporting...' : 'Export All Data (.json)'}
              </button>

              <label className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow transition-all flex items-center justify-center gap-2 text-sm cursor-pointer">
                <Upload size={16} />
                Import Backup
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            {importStatus && (
              <div className="text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-lg shadow font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            saved 
              ? 'bg-emerald-600 text-white' 
              : 'bg-[#2b579a] hover:bg-[#1e4178] text-white'
          }`}
        >
          {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>

      </div>
    </div>
  );
}
