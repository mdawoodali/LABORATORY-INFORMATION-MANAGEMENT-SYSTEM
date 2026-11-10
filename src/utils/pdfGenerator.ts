export interface GeneratePdfOptions {
  pages: HTMLElement[] | NodeListOf<Element>;
  filename: string;
  password?: string | null;
  type?: 'report' | 'invoice' | 'letterhead';
}

/**
 * Injects an invisible vector text layer matching exact DOM coordinates and font sizes.
 * Using PDF rendering mode 3 Tr ('neither fill nor stroke text'), the text is 100% invisible
 * to the eye (avoiding layout collision with the rendered canvas), but is completely selectable,
 * copyable with Ctrl+C, searchable with Ctrl+F, and recognized by all standard PDF readers (Acrobat, PDFgear, etc.).
 */
export function injectSelectableTextLayer(
  pdf: any,
  pageEl: HTMLElement,
  pdfWidth: number,
  pdfHeight: number
) {
  const pageRect = pageEl.getBoundingClientRect();
  if (pageRect.width === 0 || pageRect.height === 0) return;

  const scaleX = pdfWidth / pageRect.width;
  const scaleY = pdfHeight / pageRect.height;

  // Set text rendering mode to 3 (invisible text)
  pdf.internal.write('3 Tr');

  // 1. Collect all visible text nodes in the page
  const walker = document.createTreeWalker(
    pageEl,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const text = node.textContent?.trim();
        if (!text) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (
          parent.closest('[data-html2canvas-ignore="true"]') ||
          parent.closest('.no-print')
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        const style = window.getComputedStyle(parent);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const range = document.createRange();
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent) continue;

    const rawText = node.textContent;
    if (!rawText || !rawText.trim()) continue;

    try {
      const style = window.getComputedStyle(parent);
      const fontSizePx = parseFloat(style.fontSize) || 12;
      const fontSizePt = Math.max(5, Math.min(60, fontSizePx * 0.75));
      const isBold = parseInt(style.fontWeight, 10) >= 600 || style.fontWeight === 'bold';
      
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setFontSize(fontSizePt);

      // Measure and place words with exact bounding rectangles
      const wordRegex = /\S+/g;
      let match: RegExpExecArray | null;
      while ((match = wordRegex.exec(rawText)) !== null) {
        const word = match[0];
        const start = match.index;
        const end = start + word.length;
        range.setStart(node, start);
        range.setEnd(node, end);
        const r = range.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          const x = (r.left - pageRect.left) * scaleX;
          const y = (r.top - pageRect.top) * scaleY;
          const safeText = word
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\u2013\u2014]/g, '-')
            .replace(/[^\x00-\xFF]/g, '');
          if (safeText) {
            pdf.text(safeText, x, y, { baseline: 'top' });
          }
        }
      }
    } catch {
      // Ignore isolated range errors on detached nodes
    }
  }

  // 2. Also capture values from input / textarea elements
  const inputs = pageEl.querySelectorAll('input, textarea');
  inputs.forEach((inputEl) => {
    const input = inputEl as HTMLInputElement | HTMLTextAreaElement;
    const val = input.value?.trim();
    if (!val) return;
    if (input.closest('[data-html2canvas-ignore="true"]') || input.closest('.no-print')) return;

    try {
      const r = input.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        const style = window.getComputedStyle(input);
        const fontSizePx = parseFloat(style.fontSize) || 12;
        const fontSizePt = Math.max(5, Math.min(60, fontSizePx * 0.75));
        const isBold = parseInt(style.fontWeight, 10) >= 600 || style.fontWeight === 'bold';

        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setFontSize(fontSizePt);
        const x = (r.left - pageRect.left + 4) * scaleX;
        const y = (r.top - pageRect.top + 2) * scaleY;
        const safeText = val
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/[\u2013\u2014]/g, '-')
          .replace(/[^\x00-\xFF]/g, '');
        if (safeText) {
          pdf.text(safeText, x, y, { baseline: 'top' });
        }
      }
    } catch {}
  });

  // Reset text rendering mode back to normal (0 Tr = fill text)
  pdf.internal.write('0 Tr');
}

/**
 * Creates high-fidelity, high-DPI PDFs with an embedded selectable vector text layer.
 * - Renders at scale: 3.5 (~330+ DPI print standard) to prevent blur when zooming in.
 * - Uses lossless PNG to eliminate JPEG edge distortion.
 * - Embeds selectable text coordinates for full highlight, search, and copy-paste support.
 */
export async function createDocumentPdf(options: GeneratePdfOptions): Promise<{ pdf: any; blob: Blob }> {
  const { pages, password } = options;
  if (!pages || pages.length === 0) {
    throw new Error('No printable pages found.');
  }

  const html2canvasModule = await import('html2canvas-pro');
  const html2canvas = html2canvasModule.default || html2canvasModule;
  const { jsPDF } = await import('jspdf');

  const jsPdfOptions: any = {
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  };

  if (password) {
    jsPdfOptions.encryption = {
      userPassword: password,
      ownerPassword: password,
      userPermissions: ['print']
    };
  }

  const pdf = new jsPDF(jsPdfOptions);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Set standard ISO document metadata
  const docTitle = options.filename || 'Document';
  const docSubject = options.type === 'invoice' 
    ? 'Official Laboratory Service Invoice' 
    : options.type === 'letterhead' 
      ? 'Official Precision Quality Services Letter' 
      : 'Official Laboratory Test Certificate';

  pdf.setProperties({
    title: docTitle,
    subject: docSubject,
    author: 'Precision Quality Services (PQS)',
    keywords: 'PQS, Laboratory, Testing, LIMS, Report, Certificate, ISO 17025',
    creator: 'Precision Quality Services LIMS Engine v6.6.0'
  });

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i] as HTMLElement;
    if (i > 0) pdf.addPage();

    await new Promise((r) => setTimeout(r, 100));

    // High resolution capture (scale: 3.5 = 330+ DPI print standard)
    const canvas = await html2canvas(pageEl, {
      scale: 3.5,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: pageEl.offsetWidth,
      height: pageEl.offsetHeight
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    // Embed selectable, searchable vector text layer
    injectSelectableTextLayer(pdf, pageEl, pdfWidth, pdfHeight);

    // Memory hygiene: zero canvas dimensions to allow immediate garbage collection
    canvas.width = 0;
    canvas.height = 0;
  }

  const blob = pdf.output('blob');
  return { pdf, blob };
}
