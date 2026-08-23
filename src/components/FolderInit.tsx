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
        let basePath = localStorage.getItem('sr_backuppath');
        if (!basePath) {
          try { basePath = await desktopDir(); } catch { basePath = 'D:\\'; }
        }
        await ensureBackupFolder(basePath);
      } catch (e) {
        console.error('Failed to init backup folder on launch', e);
      }
    };
    initFolder();
  }, []);
  return null;
} 
