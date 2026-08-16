'use client';

import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { toast } from 'react-hot-toast';

export default function Updater() {
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check on mount
    checkForUpdates(false);

    // Listen for Ctrl+R
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'r') {
        e.preventDefault(); // Prevent default browser reload
        checkForUpdates(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkForUpdates = async (manual: boolean) => {
    if (isChecking) return;
    
    // Ensure we only run this in Tauri context
    if (typeof window !== 'undefined' && !(window as any).__TAURI_INTERNALS__) return;

    try {
      setIsChecking(true);
      if (manual) {
        toast.loading("Checking for updates...", { id: 'update-check' });
      }

      const update = await check();
      
      if (update) {
        toast.success(`Update v${update.version} available! Downloading...`, { id: 'update-check', duration: 4000 });
        
        let downloaded = 0;
        let contentLength = 0;
        
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started':
              contentLength = event.data.contentLength || 0;
              toast.loading(`Downloading update...`, { id: 'update-progress' });
              break;
            case 'Progress':
              downloaded += event.data.chunkLength;
              if (contentLength > 0) {
                const percent = Math.round((downloaded / contentLength) * 100);
                toast.loading(`Downloading update... ${percent}%`, { id: 'update-progress' });
              }
              break;
            case 'Finished':
              toast.success('Update downloaded. Restarting app...', { id: 'update-progress', duration: 4000 });
              break;
          }
        });
        
        // Restart the app after install
        await relaunch();
      } else {
        if (manual) {
          toast.success("You are on the latest version!", { id: 'update-check' });
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      if (manual) {
        toast.error("Failed to check for updates.", { id: 'update-check' });
      }
    } finally {
      setIsChecking(false);
    }
  };

  return null; // This is a logic-only component
}
