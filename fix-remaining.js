const fs = require('fs');

function replaceExact(file, search, replace) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
}

let f = 'src/app/editor/page.tsx';
replaceExact(f, 'setSampleImage(null)', 'setSampleImages([])');
replaceExact(f, 'sampleImage:', 'sampleImages:');
replaceExact(f, 'sampleImage ', 'sampleImages ');
replaceExact(f, 'const pageNum = (sampleImage ? 4 : 3) + index;', 'const pageNum = (sampleImages.length > 0 ? 4 : 3) + index;');
replaceExact(f, 'const pageNum = (sampleImage ? 5 : 4) + index;', 'const pageNum = (sampleImages.length > 0 ? 5 : 4) + index;');

f = 'src/app/pas-report/page.tsx';
replaceExact(f, 'setSampleImage(null)', 'setSampleImages([])');
replaceExact(f, 'sampleImage:', 'sampleImages:');
replaceExact(f, 'sampleImage ', 'sampleImages ');
replaceExact(f, 'const pageNum = (sampleImage ? 4 : 3) + index;', 'const pageNum = (sampleImages.length > 0 ? 4 : 3) + index;');
replaceExact(f, 'const pageNum = (sampleImage ? 5 : 4) + index;', 'const pageNum = (sampleImages.length > 0 ? 5 : 4) + index;');
replaceExact(f, 'if (reportData.sampleImage) setSampleImage(reportData.sampleImage as any); /* eslint-disable-line @typescript-eslint/no-explicit-any */', `if (reportData.sampleImages) {
            setSampleImages(reportData.sampleImages as any[]);
          } else if (reportData.sampleImage) {
            setSampleImages([{ id: '1', src: reportData.sampleImage as string }]);
          }`);

f = 'src/components/form/ReportForm.tsx';
replaceExact(f, 'onClick={removeImage}', 'onClick={() => removeImage("legacy")}'); // Wait, earlier I replaced the whole group, why is it complaining about line 284?
replaceExact(f, 'sampleImage', 'sampleImages');

console.log('Fixed remaining');
