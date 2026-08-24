const fs = require('fs');

const files = [
    'src/app/pas-report/page.tsx',
    'src/app/invoice/page.tsx',
    'src/app/editor/page.tsx'
];

files.forEach(f => {
    let code = fs.readFileSync(f, 'utf8');

    // Remove `const { error } = await supabase` and replace with a Promise chain
    
    // Instead of doing block replacement, I can just do:
    code = code.replace(/const \{ error \} = await supabase\s*\n\s*\.from\('receipts'\)\s*\n\s*\.upsert\(\{([\s\S]*?)\}\);/g, 
      `supabase.from('receipts').upsert({$1}).then(({error}) => { if (error) console.error("Supabase Error:", error); });`);
    
    // Remove the trailing `if (error) { ... }` block that was left behind
    code = code.replace(/if \(error\) \{\s*console\.error\("Supabase Error:", error\);\s*if \(error\.message\.includes\('row-level security'\)\) \{\s*toast\.error\("Cloud Backup Failed: Row Level Security is enabled.", \{ duration: 6000 \}\);\s*\} else \{\s*toast\.error\("Database save failed: " \+ error\.message\);\s*\}\s*\}/g, '');

    fs.writeFileSync(f, code);
    console.log('Fixed supabase in ' + f);
});
