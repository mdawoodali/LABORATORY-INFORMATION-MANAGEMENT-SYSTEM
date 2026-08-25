import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { ensureBackupFolder } from './backupValidator';

export const saveSilentBackup = async (reportNo: string, pdfBlob: Blob, isSilent: boolean = true, type: 'report' | 'invoice' = 'report') => {
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
      
      const safeReportNo = reportNo.replace(/[^a-zA-Z0-9-_ \.]/g, '_');
      
      const folderCategory = type === 'invoice' ? 'INVOICES' : 'REPORTS';
      const reportFolderPath = `${baseValidPath}\\${folderCategory}\\${y}\\${monthName}\\${dateStr}\\${safeReportNo}`;
      await mkdir(reportFolderPath, { recursive: true });

      const pdfBuffer = await pdfBlob.arrayBuffer();
      const finalPath = `${reportFolderPath}\\${safeReportNo}.pdf`;
      await writeFile(finalPath, new Uint8Array(pdfBuffer));
      
      console.log(`Auto-saved backup strictly to: ${reportFolderPath}`);
      
      if (!isSilent) {
        try {
          const { open } = await import('@tauri-apps/plugin-shell');
          await open(finalPath);
        } catch (e) {
          console.error("Failed to open PDF automatically:", e);
        }
      }
      return finalPath;
    } else {
      // Web Fallback: Only download if it's NOT a silent auto-backup (which happens every 15s)
      if (!isSilent) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = type === 'invoice' ? `Invoice_${reportNo}.pdf` : `Report_${reportNo}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      return null;
    }
  } catch (error: unknown) {
    console.error('Failed to save report backup', error);
    const err = error as Error;
    toast.error(`Backup Failed: ${err.message || (typeof err === 'string' ? err : 'Unknown error')}`);
    return false;
  }
};
