const fs = require('fs');

const file = 'src/app/pas-report/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/if \(reportData\.sampleImage\) setSampleImage\(reportData\.sampleImage as string\);/, `if (reportData.sampleImages) {
            setSampleImages(reportData.sampleImages as any[]);
          } else if (reportData.sampleImage) {
            setSampleImages([{ id: '1', src: reportData.sampleImage as string }]);
          }`);

fs.writeFileSync(file, content);
console.log('Fixed line 176');
