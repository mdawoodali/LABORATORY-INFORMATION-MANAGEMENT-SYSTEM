const fs = require('fs');

const files = [
    'src/app/pas-report/page.tsx',
    'src/app/invoice/page.tsx',
    'src/app/editor/page.tsx'
];

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');

    // Restore the supabase upsert syntax accurately
    const fixRegex = /supabase\s*\.from\('receipts'\)\s*\.upsert\(\{([\s\S]*?)\}\)\.then\(\(\{error\}\) => \{\s*if \(error\) \{([\s\S]*?)toast\.error\("Database save failed: " \+ error\.message\);\s*\}\s*\}\);\s*\}/g;
    
    code = code.replace(fixRegex, `supabase
          .from('receipts')
          .upsert({$1}).then(({error}) => {
            if (error) {$2toast.error("Database save failed: " + error.message);
            }
          }
        });
      `);

    // Actually, let's just do a manual string replace to be 100% safe
    
    fs.writeFileSync(file, code);
    console.log('Fixed supabase syntax in ' + file);
});
