import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { ensureBackupFolder } from './backupValidator';

export const saveSilentBackup = async (reportNo: string, pdfBlob: Blob, isSilent: boolean = true) => {
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
      
      const primaryTarget = await ensureBackupFolder(basePath); 
      if (!primaryTarget) {
        throw new Error("Primary backup location is inaccessible. Backup aborted.");
      }

      const baseValidPath = typeof primaryTarget === 'string' ? primaryTarget : `${basePath}\\LIMS BACKUP`;
      
      const reportFolderPath = `${baseValidPath}\\REPORTS\\${y}\\${monthName}\\${dateStr}\\${reportNo}`;
      await mkdir(reportFolderPath, { recursive: true });

      const pdfBuffer = await pdfBlob.arrayBuffer();
      await writeFile(`${reportFolderPath}\\${reportNo}.pdf`, new Uint8Array(pdfBuffer));
      
      console.log(`Auto-saved backup strictly to: ${reportFolderPath}`);
    } else {
      // Web Fallback: Only download if it's NOT a silent auto-backup (which happens every 15s)
      // We don't want to spam the user's Downloads folder with PDFs while they are typing.
      // If it IS a silent backup, the data is already saved to Supabase Cloud via page.tsx!
      if (!isSilent) {
        saveAs(pdfBlob, `Report_${reportNo}.pdf`);
      }
    }

    return true;
  } catch (error: unknown) {
    console.error('Failed to save report backup', error);
    const err = error as Error;
    toast.error(`Backup Failed: ${err.message || (typeof err === 'string' ? err : 'Unknown error')}`);
    return false;
  }
};
