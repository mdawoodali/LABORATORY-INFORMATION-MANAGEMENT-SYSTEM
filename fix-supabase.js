const fs = require('fs');

const files = [
    'src/app/pas-report/page.tsx',
    'src/app/invoice/page.tsx',
    'src/app/editor/page.tsx'
];

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');

    code = code.replace(/const \{ error \} = await supabase\s*\.from\('receipts'\)\s*\.upsert\(\{([\s\S]*?)\}\);\s*if \(error\) \{([\s\S]*?)toast\.error\("Database save failed: " \+ error\.message\);\s*\}\s*\}/g, 
    `supabase.from('receipts').upsert({$1}).then(({error}) => {
        if (error) {$2toast.error("Database save failed: " + error.message);
        }
    });`);

    fs.writeFileSync(file, code);
    console.log('Fixed supabase in ' + file);
});
