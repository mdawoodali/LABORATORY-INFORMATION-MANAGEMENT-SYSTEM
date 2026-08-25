'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Updater() {
  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdates = async (manual: boolean) => {
    if (isChecking) return;
    
    setIsChecking(true);
    let checkToast;
    if (manual) checkToast = toast.loading('Checking for updates...');
    
    try {
      const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
      if (!isTauri) {
        if (checkToast) toast.dismiss(checkToast);
        return;
      }

      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();
      
      if (update) {
        if (checkToast) toast.dismiss(checkToast);
        
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Update Available ({update.version})</span>
            <span className="text-sm">A new version is available. Would you like to install it now?</span>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={async () => {
                  toast.dismiss(t.id);
                  const installToast = toast.loading('Downloading update...');
                  let downloaded = 0;
                  let contentLength = 0;
                  
                  await update.downloadAndInstall((event) => {
                    switch (event.event) {
                      case 'Started':
                        contentLength = event.data.contentLength || 0;
                        toast.loading(`Downloading update...`, { id: installToast });
                        break;
                      case 'Progress':
                        downloaded += event.data.chunkLength;
                        if (contentLength > 0) {
                          const percent = Math.round((downloaded / contentLength) * 100);
                          toast.loading(`Downloading... ${percent}%`, { id: installToast });
                        }
                        break;
                      case 'Finished':
                        toast.success('Update installed! Restarting...', { id: installToast });
                        break;
                    }
                  });
                  
                  const { relaunch } = await import('@tauri-apps/plugin-process');
                  await relaunch();
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Install & Restart
              </button>
              <button 
                onClick={() => toast.dismiss(t.id)}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
              >
                Later
              </button>
            </div>
          </div>
        ), { duration: Infinity });
      } else {
        if (checkToast) {
          toast.success('You are on the latest version!', { id: checkToast });
        }
      }
    } catch (e: unknown) {
      console.error('Failed to check for updates:', e);
      if (checkToast) {
        const msg = e instanceof Error ? e.message : String(e);
        toast.error(`Update check failed: ${msg}`, { id: checkToast });
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check on mount
    setTimeout(() => checkForUpdates(false), 1000);
    
    // Listen for Ctrl+R
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault(); // Prevent standard browser reload
        checkForUpdates(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // This is a logic-only component
}
