const fs = require('fs'); 
const b1 = fs.readFileSync('public/logo.png'); 
fs.writeFileSync('src/components/report/PQSLogoBase64.ts', 'export const PQSLogoBase64 = "data:image/png;base64,' + b1.toString('base64') + '";', 'utf8'); 
const b2 = fs.readFileSync('public/banner.png'); 
fs.writeFileSync('src/components/report/PQSWordmarkBase64.ts', 'export const PQSWordmarkBase64 = "data:image/png;base64,' + b2.toString('base64') + '";', 'utf8');
