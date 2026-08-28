const fs = require('fs');

const path = 'src/app/invoice/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\\n                  <DropdownInput/g, '\n                  <DropdownInput');
code = code.replace(/<div>\\n                        <input/g, '<div>\n                        <input');
code = code.replace(/\\n                        <DropdownInput/g, '\n                        <DropdownInput');

fs.writeFileSync(path, code);
console.log('Fixed literal newlines');
