const fs = require('fs');

const files = [
    'src/app/pas-report/page.tsx',
    'src/app/invoice/page.tsx',
    'src/app/editor/page.tsx'
];

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    
    // Fix html-to-image params
    code = code.replace(
        /const imgData = await toPng\(pageEl, \{\s*cacheBust: true,\s*pixelRatio: 2,\s*backgroundColor: '#ffffff',\s*style: \{/g,
        `const imgData = await toPng(pageEl, {
          cacheBust: true,
          pixelRatio: 3,
          backgroundColor: '#ffffff',
          width: pageEl.offsetWidth,
          height: pageEl.offsetHeight,
          skipFonts: true,
          style: {`
    );

    // Fix Supabase blocking
    const supabaseBlock1 = `const { error } = await supabase
            .from('receipts')
            .upsert({
              id: formData.invoiceNo,
              password: password, // use the explicitly entered password
              data: { formData, items, type: 'invoice' }
            });
            
          if (error) {`;
          
    const supabaseBlock1Fix = `supabase
            .from('receipts')
            .upsert({
              id: formData.invoiceNo,
              password: password, // use the explicitly entered password
              data: { formData, items, type: 'invoice' }
            }).then(({error}) => {
                if (error) {`;

    if (code.includes(supabaseBlock1)) {
        code = code.replace(supabaseBlock1, supabaseBlock1Fix);
        code = code.replace(/toast\.error\("Database save failed: " \+ error\.message\);\n\s*\}\n\s*\}/g, 'toast.error("Database save failed: " + error.message);\n            }\n          });');
    }

    const supabaseBlock2 = `const { error } = await supabase
            .from('receipts')
            .upsert({
              id: formData.reportNo,
              password: password, // use the explicitly entered password
              data: { formData, tests, extraPages, sampleImage, type: 'report' }
            });
            
          if (error) {`;

    const supabaseBlock2Fix = `supabase
            .from('receipts')
            .upsert({
              id: formData.reportNo,
              password: password, // use the explicitly entered password
              data: { formData, tests, extraPages, sampleImage, type: 'report' }
            }).then(({error}) => {
                if (error) {`;

    if (code.includes(supabaseBlock2)) {
        code = code.replace(supabaseBlock2, supabaseBlock2Fix);
        code = code.replace(/toast\.error\("Database save failed: " \+ error\.message\);\n\s*\}\n\s*\}/g, 'toast.error("Database save failed: " + error.message);\n            }\n          });');
    }
    
    // Some files might have `type: 'pas-report'`
    const supabaseBlock3 = `const { error } = await supabase
            .from('receipts')
            .upsert({
              id: formData.reportNo,
              password: password, // use the explicitly entered password
              data: { formData, tests, extraPages, sampleImage, type: 'pas-report' }
            });
            
          if (error) {`;

    const supabaseBlock3Fix = `supabase
            .from('receipts')
            .upsert({
              id: formData.reportNo,
              password: password, // use the explicitly entered password
              data: { formData, tests, extraPages, sampleImage, type: 'pas-report' }
            }).then(({error}) => {
                if (error) {`;

    if (code.includes(supabaseBlock3)) {
        code = code.replace(supabaseBlock3, supabaseBlock3Fix);
        code = code.replace(/toast\.error\("Database save failed: " \+ error\.message\);\n\s*\}\n\s*\}/g, 'toast.error("Database save failed: " + error.message);\n            }\n          });');
    }

    fs.writeFileSync(file, code);
    console.log('Fixed ' + file);
});
