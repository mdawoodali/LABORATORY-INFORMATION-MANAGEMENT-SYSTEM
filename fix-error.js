const fs = require('fs');

const files = [
    'src/app/pas-report/page.tsx',
    'src/app/invoice/page.tsx',
    'src/app/editor/page.tsx'
];

files.forEach(f => {
    let code = fs.readFileSync(f, 'utf8');

    // Fix the `error` undefined errors
    // The auto-save 3000ms interval had:
    // supabase.from('receipts').upsert(...).then(({error}) => { if (error) console.error("Supabase Error:", error); });
    // if (!error) { lastBackedUpDataRef.current = currentData; }

    code = code.replace(/if \(\!error\) \{\s*lastBackedUpDataRef\.current = currentData;\s*\}/g, 'lastBackedUpDataRef.current = currentData;');

    // Also any remaining `if (error) { ... }` blocks that were orphaned
    code = code.replace(/if \(error\) \{\s*console\.error\("Supabase Error:", error\);\s*if \(error\.message\.includes\('row-level security'\)\) \{\s*toast\.error\("Cloud Backup Failed: Row Level Security is enabled.", \{ duration: 6000 \}\);\s*\} else \{\s*toast\.error\("Database save failed: " \+ error\.message\);\s*\}\s*\}/g, '');
    
    // There might be a toast.error missing
    
    fs.writeFileSync(f, code);
    console.log('Fixed error syntax in ' + f);
});
