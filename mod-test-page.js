const fs = require('fs');

const path = 'src/components/report/TestTable.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/END OF REPORT/g, 'END OF PAGE');

fs.writeFileSync(path, code);
console.log('Modified to END OF PAGE');
