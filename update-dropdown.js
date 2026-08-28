const fs = require('fs');

const path = 'src/components/form/DropdownInput.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace localStorage.getItem(`sr_options_${fieldKey}`)
// with localStorage.getItem(`sr_options_${fieldKey.trim().toLowerCase()}`)
code = code.replace(/localStorage\.getItem\(\`sr_options_\$\{fieldKey\}\`\)/g, 'localStorage.getItem(`sr_options_${fieldKey.trim().toLowerCase()}`)');

// Replace localStorage.setItem(`sr_options_${fieldKey}`
// with localStorage.setItem(`sr_options_${fieldKey.trim().toLowerCase()}`
code = code.replace(/localStorage\.setItem\(\`sr_options_\$\{fieldKey\}\`/g, 'localStorage.setItem(`sr_options_${fieldKey.trim().toLowerCase()}`');

fs.writeFileSync(path, code);
console.log('Fixed DropdownInput');
