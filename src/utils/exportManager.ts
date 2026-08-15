import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { ensureBackupFolder } from './backupValidator';

export const saveSilentBackup = async (reportNo: string, pdfBlob: Blob) => {
  const isTauri = '__TAURI_INTERNALS__' in window || '__TAURI__' in window;

  try {
    const dateObj = new Date();
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    const dateStr = `${d}-${m}-${y}`;
    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const monthName = monthNames[dateObj.getMonth()];

    if (isTauri) {
      const { desktopDir } = await import('@tauri-apps/api/path');
      const { mkdir, writeFile } = await import('@tauri-apps/plugin-fs');
      
      let basePath = localStorage.getItem('sr_backuppath');
      if (!basePath) {
        try { basePath = await desktopDir(); } catch { basePath = 'D:\\'; }
      }
      
      const primaryTarget = await ensureBackupFolder(basePath, false); 
      if (!primaryTarget) {
        throw new Error("Primary backup location is inaccessible. Backup aborted.");
      }

      const baseValidPath = typeof primaryTarget === 'string' ? primaryTarget : `${basePath}\\SR_LAB_BACKUP`;
      
      const reportFolderPath = `${baseValidPath}\\REPORTS\\${y}\\${monthName}\\${dateStr}\\${reportNo}`;
      await mkdir(reportFolderPath, { recursive: true });

      const pdfBuffer = await pdfBlob.arrayBuffer();
      await writeFile(`${reportFolderPath}\\${reportNo}.pdf`, new Uint8Array(pdfBuffer));
      
      console.log(`Auto-saved backup strictly to: ${reportFolderPath}`);
    } else {
      // Web Fallback
      saveAs(pdfBlob, `Report_${reportNo}.pdf`);
    }

    return true;
  } catch (error: any) {
    console.error('Failed to save report backup', error);
    toast.error(`Backup Failed: ${error.message || (typeof error === 'string' ? error : 'Unknown error')}`);
    return false;
  }
};
