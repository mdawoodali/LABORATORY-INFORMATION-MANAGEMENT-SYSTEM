const fs = require('fs');
let content = fs.readFileSync('src/app/verify/receipt/page.tsx', 'utf8');
content = content.replace(/\.a4-page/g, '.report-a4-page');
fs.writeFileSync('src/app/verify/receipt/page.tsx', content);
