import { supabase } from '@/lib/supabase';
import { ensureBackupFolder } from './backupValidator';
import { saveSilentBackup } from './exportManager';
import { createDocumentPdf } from './pdfGenerator';
import toast from 'react-hot-toast';

let isSyncRunning = false;
let lastSyncTimestamp = 0;

/**
 * Checks if running inside Tauri desktop environment
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
}

/**
 * Converts a date string or timestamp to a validated Date object
 */
function parseReceiptDate(dateStr?: string, createdAt?: string): Date {
  if (dateStr) {
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        const date = new Date(y, m, d);
        if (!isNaN(date.getTime())) return date;
      }
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) return date;
        } else {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2], 10);
          const date = new Date(y, m, d);
          if (!isNaN(date.getTime())) return date;
        }
      }
    }
  }

  if (createdAt) {
    const cd = new Date(createdAt);
    if (!isNaN(cd.getTime())) return cd;
  }

  return new Date();
}

/**
 * Generates an offscreen DOM element representing the document for PDF generation
 */
function buildOffscreenDocumentDOM(receipt: any): HTMLElement {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0px';
  container.style.width = '794px';
  container.style.zIndex = '-9999';
  container.style.background = '#ffffff';
  container.style.pointerEvents = 'none';

  const type = receipt.data?.type || 'report';
  const formData = receipt.data?.formData || {};
  const items = receipt.data?.items || [];
  const tests = receipt.data?.tests || [];

  if (type === 'invoice') {
    const page = document.createElement('div');
    page.className = 'report-a4-page';
    page.style.width = '794px';
    page.style.height = '1123px';
    page.style.padding = '32px 40px';
    page.style.backgroundColor = '#ffffff';
    page.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    page.style.position = 'relative';
    page.style.boxSizing = 'border-box';

    const subtotal = items.reduce((acc: number, item: any) => acc + (parseFloat(item.total) || 0), 0);
    const discount = parseFloat(formData.discount) || 0;
    const discountAmount = (subtotal * discount) / 100;
    const taxable = subtotal - discountAmount;
    const tax = parseFloat(formData.tax) || 0;
    const taxAmount = (taxable * tax) / 100;
    const grandTotal = taxable + taxAmount;

    page.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; border-bottom:2px solid #1f2937; padding-bottom:16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="/pqs-logo.png" style="width:80px; height:80px; object-fit:contain;" />
          <div>
            <div style="font-weight:900; font-size:18px; color:#1e3a8a; letter-spacing:0.5px;">PRECISION QUALITY SERVICES</div>
            <div style="font-size:11px; color:#6b7280; margin-top:4px;">R-332/9, Dastagir, F.B Area, Karachi, 75950.</div>
            <div style="font-size:11px; color:#6b7280;">Contact: 03322673373</div>
            <div style="font-size:11px; color:#6b7280;">Email: precisionqualityserviceslabs@gmail.com</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:22px; font-weight:bold; letter-spacing:2px; color:#1f2937; border:1px solid #1f2937; padding:4px 16px; margin-bottom:12px; display:inline-block;">INVOICE</div>
          <div style="font-size:13px;"><span style="font-weight:bold;">Inv #: </span><span>${receipt.id}</span></div>
          <div style="font-size:13px; margin-top:4px;"><span style="font-weight:bold;">Date: </span><span>${formData.invoiceDate || '-'}</span></div>
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <div style="font-size:14px; font-weight:bold; color:#1f2937; border-bottom:1px solid #9ca3af; padding-bottom:4px; margin-bottom:8px; width:120px;">Client details:</div>
        <table style="width:100%; font-size:13px; border-collapse:collapse;">
          <tr><td style="font-weight:600; color:#374151; width:140px; padding:2px 0;">Company Name:</td><td style="font-weight:bold; color:#111827; border-bottom:1px solid #e5e7eb;">${formData.applicantName || formData.customerName || '-'}</td></tr>
          <tr><td style="font-weight:600; color:#374151; padding:2px 0;">Company Address:</td><td style="color:#111827; border-bottom:1px solid #e5e7eb;">${formData.applicantAddress || formData.companyAddress || '-'}</td></tr>
          <tr><td style="font-weight:600; color:#374151; padding:2px 0;">Contact Person:</td><td style="color:#111827; border-bottom:1px solid #e5e7eb;">${formData.contactPerson || formData.responsiblePerson || '-'}</td></tr>
          <tr><td style="font-weight:600; color:#374151; padding:2px 0;">Contact detail:</td><td style="color:#111827; border-bottom:1px solid #e5e7eb;">${formData.contactDetail || '-'}</td></tr>
          <tr><td style="font-weight:600; color:#374151; padding:2px 0;">Email:</td><td style="color:#111827; border-bottom:1px solid #e5e7eb;">${formData.email || '-'}</td></tr>
          <tr><td style="font-weight:600; color:#374151; padding:2px 0;">NTN #:</td><td style="color:#111827; border-bottom:1px solid #e5e7eb;">${formData.ntn || '-'}</td></tr>
        </table>
      </div>

      <table style="width:100%; border-collapse:collapse; border:1px solid #1f2937; font-size:13px; margin-bottom:24px;">
        <thead>
          <tr style="background-color:#f1f5f9; color:#1f2937; font-weight:bold; border-bottom:1px solid #1f2937;">
            <th style="border-right:1px solid #1f2937; padding:8px 12px; text-align:left; width:35%;">TEST</th>
            <th style="border-right:1px solid #1f2937; padding:8px 12px; text-align:center; width:25%;">METHOD</th>
            <th style="border-right:1px solid #1f2937; padding:8px 12px; text-align:right;">PRICE (PKR)</th>
            <th style="border-right:1px solid #1f2937; padding:8px 12px; text-align:center;">SAMPLES</th>
            <th style="padding:8px 12px; text-align:right;">TOTAL (PKR)</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it: any) => `
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="border-right:1px solid #1f2937; padding:8px 12px; font-weight:600;">${it.testName || it.test || '-'}</td>
              <td style="border-right:1px solid #1f2937; padding:8px 12px; text-align:center; color:#4b5563;">${it.testMethod || it.method || '-'}</td>
              <td style="border-right:1px solid #1f2937; padding:8px 12px; text-align:right;">${Number(it.price || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
              <td style="border-right:1px solid #1f2937; padding:8px 12px; text-align:center;">${it.noOfSample || 1}</td>
              <td style="padding:8px 12px; text-align:right; font-weight:bold;">${Number(it.total || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            </tr>
          `).join('')}
          <tr style="border-top:2px solid #1f2937; background-color:#f8fafc; font-weight:bold;">
            <td colspan="4" style="border-right:1px solid #1f2937; padding:8px 12px; text-align:right;">Subtotal:</td>
            <td style="padding:8px 12px; text-align:right;">${subtotal.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
          </tr>
          ${discount > 0 ? `
            <tr style="border-top:1px solid #9ca3af; background-color:#f8fafc;">
              <td colspan="4" style="border-right:1px solid #1f2937; padding:6px 12px; text-align:right;">Discount (${discount}%):</td>
              <td style="padding:6px 12px; text-align:right; color:#dc2626;">-${discountAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            </tr>
          ` : ''}
          ${tax > 0 ? `
            <tr style="border-top:1px solid #9ca3af; background-color:#f8fafc;">
              <td colspan="4" style="border-right:1px solid #1f2937; padding:6px 12px; text-align:right;">Tax (${tax}%):</td>
              <td style="padding:6px 12px; text-align:right; color:#15803d;">+${taxAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            </tr>
          ` : ''}
          <tr style="border-top:2px solid #1f2937; background-color:#f1f5f9; font-weight:900; font-size:15px;">
            <td colspan="4" style="border-right:1px solid #1f2937; padding:10px 12px; text-align:right;">Grand Total:</td>
            <td style="padding:10px 12px; text-align:right; color:#1e40af;">${grandTotal.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
          </tr>
        </tbody>
      </table>

      <div style="position:absolute; bottom:30px; left:0; width:100%; display:flex; justify-content:center;">
        <div style="width:80%; display:flex; justify-content:space-between; border-top:1px solid #9ca3af; padding-top:8px; font-size:11px; color:#6b7280;">
          <span style="font-style:italic;">This is a computer generated document and doesn't need a signature.</span>
          <span style="font-weight:bold;">Page 1/1</span>
        </div>
      </div>
    `;

    container.appendChild(page);
  } else {
    // Standard Laboratory Test Report
    const page = document.createElement('div');
    page.className = 'report-a4-page';
    page.style.width = '794px';
    page.style.height = '1123px';
    page.style.padding = '32px 40px';
    page.style.backgroundColor = '#ffffff';
    page.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    page.style.position = 'relative';
    page.style.boxSizing = 'border-box';

    const dynFields = formData.dynamicFields || [];
    const applicantVal = dynFields.find((f: any) => f.label === 'APPLICANT')?.value || formData.applicant || '-';
    const sampleDesc = dynFields.find((f: any) => f.label?.includes('SAMPLE'))?.value || formData.sampleDescription || '-';

    page.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; border-bottom:2px solid #1f2937; padding-bottom:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="/pqs-logo.png" style="width:80px; height:80px; object-fit:contain;" />
          <div>
            <div style="font-weight:900; font-size:18px; color:#1e3a8a; letter-spacing:0.5px;">PRECISION QUALITY SERVICES</div>
            <div style="font-size:11px; color:#6b7280; margin-top:2px;">Laboratory Information Management System</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:14px; font-weight:bold; color:#1e3a8a;">TEST REPORT</div>
          <div style="font-size:13px; font-weight:bold; margin-top:4px;">Report #: ${receipt.id}</div>
          <div style="font-size:12px; color:#4b5563;">Date: ${formData.reportDate || '-'}</div>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <div style="font-size:13px; font-weight:bold; color:#1f2937; border-bottom:1px solid #d1d5db; padding-bottom:4px; margin-bottom:8px;">Sample & Client Information:</div>
        <table style="width:100%; font-size:12px; border-collapse:collapse;">
          <tr><td style="font-weight:600; width:150px; padding:3px 0; color:#374151;">Applicant:</td><td style="font-weight:bold; color:#111827; border-bottom:1px solid #f3f4f6;">${applicantVal}</td></tr>
          <tr><td style="font-weight:600; padding:3px 0; color:#374151;">Sample Description:</td><td style="color:#111827; border-bottom:1px solid #f3f4f6;">${sampleDesc}</td></tr>
          ${dynFields.filter((f: any) => f.label !== 'APPLICANT' && !f.label?.includes('SAMPLE')).slice(0, 4).map((f: any) => `
            <tr><td style="font-weight:600; padding:3px 0; color:#374151;">${f.label}:</td><td style="color:#111827; border-bottom:1px solid #f3f4f6;">${f.value || '-'}</td></tr>
          `).join('')}
        </table>
      </div>

      <table style="width:100%; border-collapse:collapse; border:1px solid #1f2937; font-size:11px; margin-bottom:20px;">
        <thead>
          <tr style="background-color:#f1f5f9; color:#1f2937; font-weight:bold; border-bottom:1px solid #1f2937;">
            <th style="border-right:1px solid #1f2937; padding:6px 8px; text-align:left;">TEST</th>
            <th style="border-right:1px solid #1f2937; padding:6px 8px; text-align:center;">METHOD</th>
            <th style="border-right:1px solid #1f2937; padding:6px 8px; text-align:center;">VALUE</th>
            <th style="border-right:1px solid #1f2937; padding:6px 8px; text-align:center;">UNIT</th>
            <th style="border-right:1px solid #1f2937; padding:6px 8px; text-align:center;">CRITERIA</th>
            <th style="border-right:1px solid #1f2937; padding:6px 8px; text-align:center;">UNIT</th>
            <th style="padding:6px 8px; text-align:center;">RESULT</th>
          </tr>
        </thead>
        <tbody>
          ${tests.map((t: any) => `
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="border-right:1px solid #1f2937; padding:6px 8px; font-weight:600;">${t.test || '-'}</td>
              <td style="border-right:1px solid #1f2937; padding:6px 8px; text-align:center; color:#4b5563;">${t.method || '-'}</td>
              <td style="border-right:1px solid #1f2937; padding:6px 8px; text-align:center;">${t.value || '-'}</td>
              <td style="border-right:1px solid #1f2937; padding:6px 8px; text-align:center;">${t.unit || '-'}</td>
              <td style="border-right:1px solid #1f2937; padding:6px 8px; text-align:center;">${t.criteria || t.peqs || '-'}</td>
              <td style="border-right:1px solid #1f2937; padding:6px 8px; text-align:center;">${t.criteriaUnit || t.unit || '-'}</td>
              <td style="padding:6px 8px; text-align:center; font-weight:bold;">${t.result || 'Pass'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="position:absolute; bottom:30px; left:0; width:100%; display:flex; justify-content:center;">
        <div style="width:85%; display:flex; justify-content:space-between; border-top:1px solid #9ca3af; padding-top:8px; font-size:10px; color:#6b7280;">
          <span style="font-style:italic;">This document is digitally verified. Unauthorized alterations invalidate this certificate.</span>
          <span style="font-weight:bold;">Page 1/1</span>
        </div>
      </div>
    `;

    container.appendChild(page);
  }

  return container;
}

/**
 * Core engine that runs on PC desktop launch and on window focus.
 * Automatically checks Supabase for files created or edited from mobile,
 * and creates the folder-wise backup on the user's decided location (Desktop LIMS BACKUP).
 */
export async function syncCloudFilesToLocalDesktop(): Promise<number> {
  if (!isTauriEnvironment()) {
    return 0;
  }

  // Throttle sync to once every 30 seconds to prevent background loop thrashing
  const now = Date.now();
  if (now - lastSyncTimestamp < 30000) {
    return 0;
  }

  if (isSyncRunning) {
    return 0;
  }

  isSyncRunning = true;
  lastSyncTimestamp = now;

  try {
    const { desktopDir } = await import('@tauri-apps/api/path');
    const { exists, mkdir, writeFile } = await import('@tauri-apps/plugin-fs');

    let basePath = localStorage.getItem('sr_backuppath');
    if (!basePath) {
      try {
        basePath = await desktopDir();
      } catch {
        basePath = 'D:\\';
      }
    }

    const primaryTarget = await ensureBackupFolder(basePath);
    if (!primaryTarget) {
      console.warn('[Cloud Sync Engine] Backup directory inaccessible.');
      return 0;
    }

    const baseValidPath = typeof primaryTarget === 'string' ? primaryTarget : `${basePath}\\LIMS BACKUP`;

    // Query recent receipts from Supabase (top 15 recent files)
    const { data: receipts, error } = await supabase
      .from('receipts')
      .select('id, data, password, created_at')
      .neq('id', 'GLOBAL_SETTINGS')
      .order('created_at', { ascending: false })
      .limit(15);

    if (error || !receipts || receipts.length === 0) {
      return 0;
    }

    // Load ledger of locally synced items
    let syncedLedger: Record<string, string> = {};
    try {
      const raw = localStorage.getItem('sr_synced_receipt_ledger');
      if (raw) syncedLedger = JSON.parse(raw);
    } catch {
      syncedLedger = {};
    }

    let newlySyncedCount = 0;

    for (const receipt of receipts) {
      try {
        const type = receipt.data?.type || 'report';
        const folderCategory = type === 'invoice' ? 'INVOICES' : type === 'letterhead' ? 'Letterhead' : 'REPORTS';
        const rawDate = receipt.data?.formData?.reportDate || receipt.data?.formData?.invoiceDate;
        const targetDate = parseReceiptDate(rawDate, receipt.created_at);

        const d = String(targetDate.getDate()).padStart(2, '0');
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        const y = targetDate.getFullYear();
        const dateStr = `${d}-${m}-${y}`;
        const monthNames = [
          "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
          "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
        ];
        const monthName = monthNames[targetDate.getMonth()];
        const safeId = receipt.id.replace(/[^a-zA-Z0-9-_ \.]/g, '_');

        const reportFolderPath = `${baseValidPath}\\${folderCategory}\\${y}\\${monthName}\\${dateStr}\\${safeId}`;
        const targetPdfPath = `${reportFolderPath}\\${safeId}.pdf`;

        // Check if PDF already exists on disk and is recorded in ledger
        const fileAlreadyExists = await exists(targetPdfPath);
        const recordedTimestamp = syncedLedger[receipt.id];

        if (fileAlreadyExists && recordedTimestamp === (receipt.created_at || 'synced')) {
          continue; // Already safely backed up
        }

        // File needs backup!
        await mkdir(reportFolderPath, { recursive: true });

        // Save raw JSON representation next to PDF for instant local data resilience
        const jsonPath = `${reportFolderPath}\\${safeId}.json`;
        try {
          const jsonStr = JSON.stringify(receipt, null, 2);
          const encoder = new TextEncoder();
          await writeFile(jsonPath, encoder.encode(jsonStr));
        } catch (jsonErr) {
          console.warn(`[Cloud Sync] Could not write JSON backup for ${receipt.id}:`, jsonErr);
        }

        // Render PDF offscreen and save
        const offscreenContainer = buildOffscreenDocumentDOM(receipt);
        document.body.appendChild(offscreenContainer);

        try {
          const pageElements = offscreenContainer.querySelectorAll('.report-a4-page');
          if (pageElements.length > 0) {
            const { blob } = await createDocumentPdf({
              pages: pageElements,
              filename: receipt.id,
              password: receipt.password || undefined,
              type: type as any
            });

            await saveSilentBackup(receipt.id, blob, true, type, targetDate);
            newlySyncedCount++;
            console.log(`[Cloud Sync] Successfully generated and backed up ${receipt.id} to ${targetPdfPath}`);
          }
        } finally {
          if (offscreenContainer.parentNode) {
            offscreenContainer.parentNode.removeChild(offscreenContainer);
          }
        }

        // Update ledger
        syncedLedger[receipt.id] = receipt.created_at || 'synced';
      } catch (itemErr) {
        console.error(`[Cloud Sync] Error processing receipt ${receipt.id}:`, itemErr);
      }
    }

    // Save updated ledger
    localStorage.setItem('sr_synced_receipt_ledger', JSON.stringify(syncedLedger));

    if (newlySyncedCount > 0) {
      toast.success(
        `Cloud Sync: Backed up ${newlySyncedCount} file${newlySyncedCount > 1 ? 's' : ''} from phone to Desktop!`,
        { duration: 5000, icon: '🔄' }
      );
    }

    return newlySyncedCount;
  } catch (err) {
    console.error('[Cloud Sync Engine] Sync run failed:', err);
    return 0;
  } finally {
    isSyncRunning = false;
  }
}
