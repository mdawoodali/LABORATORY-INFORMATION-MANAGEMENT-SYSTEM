const fs = require('fs'); 
const b1 = fs.readFileSync('public/logo.png'); 
fs.writeFileSync('src/components/report/PQSLogoBase64.ts', 'export const PQSLogoBase64 = "data:image/png;base64,' + b1.toString('base64') + '";', 'utf8');
