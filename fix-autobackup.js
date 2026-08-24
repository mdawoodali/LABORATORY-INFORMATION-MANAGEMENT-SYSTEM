const fs = require('fs');

const files = [
    'src/app/pas-report/page.tsx',
    'src/app/invoice/page.tsx',
    'src/app/editor/page.tsx'
];

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');

    // Strip out the entire autoBackup block and replace it correctly
    const autoBackupRegex = /const autoBackup = true;\s*if \(autoBackup\) \{[\s\S]*?toast\.error\("Database save failed: " \+ error\.message\);\s*\}\s*\}\);\s*\}/g;
    
    code = code.replace(autoBackupRegex, `const autoBackup = true;
      if (autoBackup) {
        import('@/lib/supabase').then(({ supabase }) => {
          supabase.from('receipts').upsert({
            id: formData.invoiceNo || formData.reportNo || 'doc',
            password: password,
            data: { formData, items: (typeof items !== 'undefined' ? items : []), tests: (typeof tests !== 'undefined' ? tests : []), extraPages: (typeof extraPages !== 'undefined' ? extraPages : []), type: (typeof items !== 'undefined' ? 'invoice' : 'report') }
          }).then(({error}) => {
            if (error) {
              console.error("Supabase Error:", error);
              // toast.error("Database save failed: " + error.message);
            }
          });
        });
      }`);

    fs.writeFileSync(file, code);
    console.log('Fixed autoBackup syntax in ' + file);
});
