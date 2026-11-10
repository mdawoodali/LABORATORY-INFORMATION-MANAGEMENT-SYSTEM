'use client';

import { useEffect } from 'react';
import { ensureBackupFolder } from '@/utils/backupValidator';
import { syncCloudFilesToLocalDesktop } from '@/utils/cloudSyncEngine';

export default function FolderInit() {
  useEffect(() => {
    const initFolder = async () => {
      const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
      if (!isTauri) return;
      
      try {
        const { desktopDir } = await import('@tauri-apps/api/path');
        const { mkdir } = await import('@tauri-apps/plugin-fs');
        let basePath = localStorage.getItem('sr_backuppath');
        if (!basePath) {
          try { basePath = await desktopDir(); } catch { basePath = 'D:\\'; }
        }
        const backupPath = await ensureBackupFolder(basePath);
        if (backupPath) {
          try { await mkdir(`${backupPath}\\REPORTS`, { recursive: true }); } catch (e) {}
          try { await mkdir(`${backupPath}\\INVOICES`, { recursive: true }); } catch (e) {}
          try { await mkdir(`${backupPath}\\LETTERHEAD`, { recursive: true }); } catch (e) {}
        }

        // Immediately check and sync files created from mobile
        await syncCloudFilesToLocalDesktop();
      } catch (e) {
        console.error('Failed to init backup folder and cloud sync on launch', e);
      }
    };

    initFolder();

    // Re-check for new mobile-created documents when user brings desktop app into focus
    const handleWindowFocus = () => {
      syncCloudFilesToLocalDesktop().catch(() => {});
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  return null;
} 
