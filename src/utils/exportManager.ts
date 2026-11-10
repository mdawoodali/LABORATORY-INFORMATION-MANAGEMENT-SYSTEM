import React from 'react';
import toast from 'react-hot-toast';
import { ensureBackupFolder } from './backupValidator';
import SavedPathToast from '@/components/SavedPathToast';

export const saveSilentBackup = async (
  reportNo: string,
  pdfBlob: Blob,
  isSilent: boolean = true,
  type: 'report' | 'invoice' | 'letterhead' = 'report',
  targetDate?: Date
): Promise<string | null> => {
  const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

  try {
    const dateObj = (targetDate && !isNaN(targetDate.getTime())) ? targetDate : new Date();
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    const dateStr = `${d}-${m}-${y}`;
    const monthNames = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
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
      const folderCategory = type === 'invoice' ? 'INVOICES' : type === 'letterhead' ? 'Letterhead' : 'REPORTS';
      const reportFolderPath = `${baseValidPath}\\${folderCategory}\\${y}\\${monthName}\\${dateStr}\\${safeReportNo}`;
      
      await mkdir(reportFolderPath, { recursive: true });

      const pdfBuffer = await pdfBlob.arrayBuffer();
      const uint8 = new Uint8Array(pdfBuffer);

      let finalPath = `${reportFolderPath}\\${safeReportNo}.pdf`;
      let isDuplicate = false;
      let writeSuccess = false;

      // 1. First attempt: overwrite the already existing PDF with new changes
      try {
        await writeFile(finalPath, uint8);
        writeSuccess = true;
        console.log(`Replaced existing PDF backup successfully at: ${finalPath}`);
      } catch (err: unknown) {
        console.warn(`Could not overwrite ${finalPath} (file is likely open in a PDF viewer):`, err);

        // 2. Fallback: if open/locked, create duplicate with (1), (2), etc.
        let counter = 1;
        while (!writeSuccess && counter <= 99) {
          const duplicatePath = `${reportFolderPath}\\${safeReportNo} (${counter}).pdf`;
          try {
            await writeFile(duplicatePath, uint8);
            finalPath = duplicatePath;
            isDuplicate = true;
            writeSuccess = true;
            console.log(`Saved duplicate PDF backup at: ${duplicatePath}`);
          } catch {
            counter++;
          }
        }

        if (!writeSuccess) {
          throw new Error(`Failed to save PDF. File and its duplicates are locked by another open program.`);
        }
      }

      if (!isSilent) {
        // Automatically open the PDF
        try {
          const { open } = await import('@tauri-apps/plugin-shell');
          await open(finalPath);
        } catch (e) {
          console.error("Failed to open PDF automatically:", e);
        }

        // Show toast with actual address and Copy Path button
        toast.custom(
          (t) =>
            React.createElement(SavedPathToast, {
              t,
              savedPath: finalPath,
              type,
              isDuplicate
            }),
          { duration: 6000, position: 'bottom-right' }
        );
      }

      return finalPath;
    } else {
      // Web Fallback: Try to use File System Access API for silent backup
      let savedSilently = false;
      let webSavedPath: string | null = null;
      let isDuplicate = false;
      const safeReportNo = reportNo.replace(/[^a-zA-Z0-9-_ \.]/g, '_');
      const folderCategory = type === 'invoice' ? 'INVOICES' : type === 'letterhead' ? 'Letterhead' : 'REPORTS';

      try {
        const { get } = await import('idb-keyval');
        const dirHandle = await get('backup_dir_handle');
        if (dirHandle && 'getFileHandle' in dirHandle) {
          const opts = { mode: 'readwrite' as const };
          if (await dirHandle.queryPermission(opts) === 'granted' || await dirHandle.requestPermission(opts) === 'granted') {
            let currentDir = dirHandle;
            const pathParts = ['LIMS BACKUP', folderCategory, String(y), monthName, dateStr, safeReportNo];
            
            for (const part of pathParts) {
              currentDir = await currentDir.getDirectoryHandle(part, { create: true });
            }
            
            try {
              const fileHandle = await currentDir.getFileHandle(`${safeReportNo}.pdf`, { create: true });
              const writable = await fileHandle.createWritable();
              await writable.write(pdfBlob);
              await writable.close();
              savedSilently = true;
              webSavedPath = `LIMS BACKUP/${folderCategory}/${y}/${monthName}/${dateStr}/${safeReportNo}/${safeReportNo}.pdf`;
            } catch {
              // Duplicate fallback
              let counter = 1;
              while (!savedSilently && counter <= 99) {
                try {
                  const dupHandle = await currentDir.getFileHandle(`${safeReportNo} (${counter}).pdf`, { create: true });
                  const writable = await dupHandle.createWritable();
                  await writable.write(pdfBlob);
                  await writable.close();
                  savedSilently = true;
                  isDuplicate = true;
                  webSavedPath = `LIMS BACKUP/${folderCategory}/${y}/${monthName}/${dateStr}/${safeReportNo}/${safeReportNo} (${counter}).pdf`;
                } catch {
                  counter++;
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Web auto-backup using File System Access API failed:', err);
      }

      const defaultDownloadName = type === 'invoice' 
        ? `Invoice_${reportNo}.pdf` 
        : type === 'letterhead' 
        ? `Letterhead_${reportNo}.pdf` 
        : `Report_${reportNo}.pdf`;

      if (!isSilent) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultDownloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const displayedPath = webSavedPath || `Downloads/${defaultDownloadName}`;
        toast.custom(
          (t) =>
            React.createElement(SavedPathToast, {
              t,
              savedPath: displayedPath,
              type,
              isDuplicate
            }),
          { duration: 6000, position: 'bottom-right' }
        );
      }

      return webSavedPath || defaultDownloadName;
    }
  } catch (error: unknown) {
    console.error('Failed to save report backup', error);
    const err = error as Error;
    toast.error(`Backup Failed: ${err.message || (typeof err === 'string' ? err : 'Unknown error')}`);
    return null;
  }
};
