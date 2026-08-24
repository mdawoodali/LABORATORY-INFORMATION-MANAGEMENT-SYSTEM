const fs = require('fs');

const files = [
    'src/app/pas-report/page.tsx',
    'src/app/invoice/page.tsx',
    'src/app/editor/page.tsx'
];

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');

    // Remove ANY "const { error } = await " before supabase
    code = code.replace(/const\s+\{\s*error\s*\}\s*=\s*await\s+supabase/g, 'supabase');
    
    // Some places we have:
    // supabase
    //   .from('receipts')
    //   .upsert({...})
    //   .then(({error}) => {
    
    // Fix syntax issues if any
    
    fs.writeFileSync(file, code);
    console.log('Fixed await in ' + file);
});
