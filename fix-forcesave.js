const fs = require('fs');

const fixFile = (path) => {
    let code = fs.readFileSync(path, 'utf8');

    // Fix forceSaveOption storage key
    code = code.replace(/const storageKey = \`sr_options_\$\{key\}\`;/g, 'const storageKey = `sr_options_${key.trim().toLowerCase()}`;');

    fs.writeFileSync(path, code);
};

fixFile('src/app/invoice/page.tsx');
fixFile('src/app/pas-report/page.tsx');

console.log('Fixed forceSaveOption');
