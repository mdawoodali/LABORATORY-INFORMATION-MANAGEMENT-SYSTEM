const fs = require('fs');

const files = [
    'src/app/pas-report/page.tsx',
    'src/app/invoice/page.tsx',
    'src/app/editor/page.tsx'
];

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');

    // Replace everything from `const content = [];` down to `});` at the end of saveSilentBackup
    // Since the structure varies, let's use a regex that grabs everything from `const pages = document.querySelectorAll('.a4-page');`
    // to the end of the `try` block.

    const regex = /const pages = document\.querySelectorAll\('\.a4-page'\);[\s\S]*?(?=\} catch \(e\))/;
    
    const replacement = `const pages = document.querySelectorAll('.a4-page');
        if (pages.length === 0) throw new Error("No pages found");

        const { toPng } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();

        for (let i = 0; i < pages.length; i++) {
          const pageEl = pages[i] as HTMLElement;
          const imgData = await toPng(pageEl, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            width: pageEl.offsetWidth,
            height: pageEl.offsetHeight,
            style: {
              transform: 'none',
              transformOrigin: 'top left',
              margin: '0',
              position: 'relative',
            }
          });
          
          if (i > 0) pdf.addPage();
          
          const imgProps = pdf.getImageProperties(imgData);
          const calculatedHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, calculatedHeight);
        }

        const blob = pdf.output('blob');
        
        // Save using Tauri natively, or fallback to browser download
        const { saveSilentBackup } = await import('@/utils/exportManager');
        const backupType = window.location.pathname.includes('invoice') ? 'invoice' : 'report';
        const docId = formData.invoiceNo || formData.reportNo || 'document';
        
        try {
          await saveSilentBackup(docId, blob, false, backupType);
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 5000);
          toast.success(backupType === 'invoice' ? "Invoice PDF generated and secured successfully!" : "Report PDF generated and secured successfully!");
        } finally {
          setIsGenerating(false);
        }
        `;

    code = code.replace(regex, replacement);

    fs.writeFileSync(file, code);
    console.log('Migrated to jsPDF in ' + file);
});
