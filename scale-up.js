const fs = require('fs');

// 1. Update PageOneData.tsx
let f1 = 'src/components/report/PageOneData.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

c1 = c1.replace(/fontSize: '11\.5px'/g, "fontSize: '13px'");
c1 = c1.replace(/lineHeight: '1\.65'/g, "lineHeight: '2.5'");
fs.writeFileSync(f1, c1);

// 2. Update TestTable.tsx
let f2 = 'src/components/report/TestTable.tsx';
let c2 = fs.readFileSync(f2, 'utf8');

// Increase table text size and padding
c2 = c2.replace(/fontSize: '14px'/g, "fontSize: '15px'");
c2 = c2.replace(/py-4/g, "py-6");

// Make top details slightly bigger
c2 = c2.replace(/fontSize: '12px'/g, "fontSize: '14px'");
c2 = c2.replace(/lineHeight: '1\.6'/g, "lineHeight: '2'");
c2 = c2.replace(/lineHeight: '1\.5'/g, "lineHeight: '2'");

fs.writeFileSync(f2, c2);

console.log('Scaled up both pages');
