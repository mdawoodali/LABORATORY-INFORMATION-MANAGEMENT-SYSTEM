const fs = require('fs');

const path = 'src/components/report/TestTable.tsx';
let code = fs.readFileSync(path, 'utf8');

// Remove the End of Report section
code = code.replace(/\{\/\* End of Report \*\/\}\s*<div className="flex items-center w-full mt-8">\s*<div className="border-b border-black flex-1"><\/div>\s*<div className="font-bold pl-3" style=\{\{ fontSize: '12px' \}\}>End of Report<\/div>\s*<\/div>/, '');

fs.writeFileSync(path, code);
console.log('Removed from TestTable');
