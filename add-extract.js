const fs = require('fs');

['src/app/editor/page.tsx', 'src/app/pas-report/page.tsx'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Add import
    if (!content.includes('extractAndSaveOptions')) {
        content = content.replace("import { supabase } from '@/lib/supabase';", "import { supabase } from '@/lib/supabase';\nimport { extractAndSaveOptions } from '@/lib/sync';");
    }

    // Add call in useEffect
    const target = "supabase.from('receipts').upsert({";
    const replacement = "extractAndSaveOptions(formData, 'report');\n          supabase.from('receipts').upsert({";
    content = content.replace(target, replacement);

    fs.writeFileSync(file, content);
});

let inv = 'src/app/invoice/page.tsx';
let content = fs.readFileSync(inv, 'utf8');
if (!content.includes('extractAndSaveOptions')) {
    content = content.replace("import { supabase } from '@/lib/supabase';", "import { supabase } from '@/lib/supabase';\nimport { extractAndSaveOptions } from '@/lib/sync';");
}
content = content.replace("supabase.from('receipts').upsert({", "extractAndSaveOptions(formData, 'invoice');\n        supabase.from('receipts').upsert({");
fs.writeFileSync(inv, content);

console.log('Added extractAndSaveOptions to all pages');
