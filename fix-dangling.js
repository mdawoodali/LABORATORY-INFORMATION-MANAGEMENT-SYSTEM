const fs = require('fs');

const files = [
    'src/app/pas-report/page.tsx',
    'src/app/editor/page.tsx'
];

files.forEach(f => {
    let code = fs.readFileSync(f, 'utf8');

    const regexToRemove = /if \(error\) \{\s*console\.error\("Supabase Error:", error\);\s*if \(\!isSilent\) \{\s*if \(error\.message\.includes\('row-level security'\)\) \{\s*toast\.error\([\s\S]*?\}\s*\}\s*\} else \{\s*if \(\!isSilent\) toast\.success\("Saved securely to cloud\."\);\s*\}/g;
    
    code = code.replace(regexToRemove, '');
    
    fs.writeFileSync(f, code);
    console.log('Fixed dangling error in ' + f);
});
