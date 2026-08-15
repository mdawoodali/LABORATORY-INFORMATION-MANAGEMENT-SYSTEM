import React from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  onClose: () => void;
  brandSettings: { logoBase64: string; companyName: string };
  setBrandSettings: (settings: { logoBase64: string; companyName: string }) => void;
}

export default function SettingsModal({ onClose, brandSettings, setBrandSettings }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = React.useState(brandSettings);
  const [autoBackup, setAutoBackup] = React.useState(true);
  const [defaultPassword, setDefaultPassword] = React.useState('1234');

  React.useEffect(() => {
    const saved = localStorage.getItem('sr_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.autoBackup !== undefined) setAutoBackup(parsed.autoBackup);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.defaultPassword) setDefaultPassword(parsed.defaultPassword);
      } catch {}
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({ ...localSettings, logoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setBrandSettings(localSettings);
    localStorage.setItem('sr_brand_settings', JSON.stringify(localSettings));
    localStorage.setItem('sr_settings', JSON.stringify({ autoBackup, defaultPassword }));
    toast.success("Settings saved successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-[95%] md:w-full md:max-w-md overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800">Website Branding</h2>
          <button onClick={onClose} className="text-slate-500 hover:bg-slate-200 p-1.5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Company Logo</label>
            <div className="flex flex-col gap-3">
              {localSettings.logoBase64 ? (
                <div className="relative group w-full h-32 border rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden p-2">
                  <img src={localSettings.logoBase64} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                  <button 
                    onClick={() => setLocalSettings({ ...localSettings, logoBase64: '' })}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors">
                  <Upload size={24} className="text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-600">Upload Logo (PNG/JPG)</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">This logo will appear on the header of all generated PDF reports.</p>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name (Footer Text)</label>
            <input 
              type="text"
              value={localSettings.companyName}
              onChange={e => setLocalSettings({ ...localSettings, companyName: e.target.value })}
              placeholder="e.g. S.R. LABORATORIES"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-2">This text will appear in the footer copyright notice.</p>
          </div>

          {/* Cloud Auto Backup */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoBackup}
                onChange={e => setAutoBackup(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-slate-700">Enable Cloud Auto Backup</span>
            </label>
            <p className="text-[11px] text-slate-500 mt-1 pl-6">Automatically save encrypted backups to Supabase when you click Make Template or Generate PDF.</p>
          </div>

          {/* Default Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Default PDF Lock Password</label>
            <input 
              type="text"
              value={defaultPassword}
              onChange={e => setDefaultPassword(e.target.value)}
              placeholder="e.g. 1234"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-2">This password is used to encrypt local PDFs during silent auto-backups.</p>
          </div>

          {/* Auto Backup Path */}
          {typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window) ? (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Auto Backup Folder (Desktop App)</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  readOnly
                  value={localStorage.getItem('sr_backuppath') || 'Default Desktop'}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 text-slate-500 outline-none"
                />
                <button 
                  onClick={async () => {
                    try {
                      const { open } = await import('@tauri-apps/plugin-dialog');
                      const selected = await open({ directory: true, multiple: false });
                      if (selected && typeof selected === 'string') {
                        localStorage.setItem('sr_backuppath', selected);
                        toast.success(`Backup folder set to: ${selected}`);
                        // Force re-render of this input
                        setLocalSettings({...localSettings});
                      }
                    } catch {
                      toast.error("Failed to open folder picker.");
                    }
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 rounded-lg font-medium text-sm transition-colors"
                >
                  Change
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Reports are automatically saved to LIMS_BACKUP inside this folder every 15 seconds after changes.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Auto Backup Folder (Desktop App)</label>
              <div className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100 text-slate-500 italic text-center">
                Backup folder can be decided on .exe only
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
