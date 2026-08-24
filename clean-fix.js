const fs = require('fs');

const files = [
    {
      path: 'src/app/pas-report/page.tsx',
      type: 'pas-report',
      idField: 'formData.reportNo',
      dataFields: 'formData, tests, extraPages, sampleImage'
    },
    {
      path: 'src/app/invoice/page.tsx',
      type: 'invoice',
      idField: 'formData.invoiceNo',
      dataFields: 'formData, items'
    },
    {
      path: 'src/app/editor/page.tsx',
      type: 'report',
      idField: 'formData.reportNo',
      dataFields: 'formData, tests, extraPages, sampleImage'
    }
];

files.forEach(f => {
    let code = fs.readFileSync(f.path, 'utf8');

    // FIX 1: Non-blocking Supabase upsert in `handlePrint` or `generatePDF` (which ever has the autoBackup block)
    const oldSupabaseBlock = `const autoBackup = true;
      if (autoBackup) {
        // We will need to import supabase, so I'll add it to the top of the file
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase
          .from('receipts')
          .upsert({
            id: ${f.idField},
            password: password, // use the explicitly entered password
            data: { ${f.dataFields}, type: '${f.type}' }
          });
          
        if (error) {
          console.error("Supabase Error:", error);
          if (error.message.includes('row-level security')) {
            toast.error("Cloud Backup Failed: Row Level Security is enabled.", { duration: 6000 });
          } else {
            toast.error("Database save failed: " + error.message);
          }
        }
      }`;

    const newSupabaseBlock = `const autoBackup = true;
      if (autoBackup) {
        import('@/lib/supabase').then(({ supabase }) => {
          supabase.from('receipts').upsert({
            id: ${f.idField},
            password: password,
            data: { ${f.dataFields}, type: '${f.type}' }
          }).then(({error}) => {
            if (error) console.error("Supabase Error:", error);
          });
        });
      }`;

    // Apply Supabase fix
    if (code.includes(oldSupabaseBlock)) {
        code = code.replace(oldSupabaseBlock, newSupabaseBlock);
    }

    // FIX 2: Replace pdfMake with jsPDF
    // We look for everything from `const pages = document.querySelectorAll('.a4-page');` down to the end of the `try` block.
    // The try block ends right before `} catch (e: unknown) {`

    const oldPdfMakeRegex = /const pages = document\.querySelectorAll\('\.a4-page'\);[\s\S]*?(?=\} catch \(e: unknown\) \{)/;

    const newJsPdfBlock = `const pages = document.querySelectorAll('.a4-page');
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
          pixelRatio: 3,
          backgroundColor: '#ffffff',
          width: pageEl.offsetWidth,
          height: pageEl.offsetHeight,
          skipFonts: true,
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
      
      const { saveSilentBackup } = await import('@/utils/exportManager');
      const backupType = '${f.type === 'invoice' ? 'invoice' : 'report'}';
      
      await saveSilentBackup(${f.idField}, blob, false, backupType);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
      toast.success(backupType === 'invoice' ? "Invoice PDF generated successfully!" : "Report PDF generated successfully!");
      setIsGenerating(false);
    `;

    code = code.replace(oldPdfMakeRegex, newJsPdfBlock);

    fs.writeFileSync(f.path, code);
    console.log('Fixed ' + f.path);
});
