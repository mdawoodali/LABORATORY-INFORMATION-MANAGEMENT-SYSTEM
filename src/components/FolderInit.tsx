'use client';

import { useEffect } from 'react';
import { ensureBackupFolder } from '@/utils/backupValidator';

export default function FolderInit() {
  useEffect(() => {
    const initFolder = async () => {
      const isTauri = '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
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
        }
      } catch (e) {
        console.error('Failed to init backup folder on launch', e);
      }
    };
    initFolder();
  }, []);
  return null;
} 
