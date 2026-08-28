const fs = require('fs');

function replaceExact(file, search, replace) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
}

let f = 'src/app/editor/page.tsx';
replaceExact(f, 'setSampleImage(null)', 'setSampleImages([])');
replaceExact(f, 'const pageNum = (sampleImage ? 4 : 3) + index;', 'const pageNum = (sampleImages.length > 0 ? 4 : 3) + index;');
replaceExact(f, 'const pageNum = (sampleImage ? 5 : 4) + index;', 'const pageNum = (sampleImages.length > 0 ? 5 : 4) + index;');
replaceExact(f, 'const pageNum = (sampleImage ? 4 : 3) + index;', 'const pageNum = (sampleImages.length > 0 ? 4 : 3) + index;');

f = 'src/app/pas-report/page.tsx';
replaceExact(f, 'setSampleImage(null)', 'setSampleImages([])');
replaceExact(f, 'const pageNum = (sampleImage ? 4 : 3) + index;', 'const pageNum = (sampleImages.length > 0 ? 4 : 3) + index;');
replaceExact(f, 'const pageNum = (sampleImage ? 5 : 4) + index;', 'const pageNum = (sampleImages.length > 0 ? 5 : 4) + index;');
replaceExact(f, 'if (reportData.sampleImage) setSampleImage(reportData.sampleImage as any); /* eslint-disable-line @typescript-eslint/no-explicit-any */', `if (reportData.sampleImages) {
            setSampleImages(reportData.sampleImages as any[]);
          } else if (reportData.sampleImage) {
            setSampleImages([{ id: '1', src: reportData.sampleImage as string }]);
          }`);

f = 'src/components/form/ReportForm.tsx';
replaceExact(f, 'onClick={removeImage}', 'onClick={() => removeImage("legacy")}'); 
replaceExact(f, 'sampleImage={sampleImage}', 'sampleImages={sampleImages}'); 
replaceExact(f, 'removeImage={() => setSampleImage(null)}', 'removeImage={(id) => setSampleImages(prev => prev.filter(img => img.id !== id))}');
replaceExact(f, '<img src={sampleImage} alt="Sample" className="w-full h-40 object-cover rounded-lg border shadow-sm" />', '<img src={sampleImages && sampleImages[0] ? sampleImages[0].src : ""} alt="Sample" className="w-full h-40 object-cover rounded-lg border shadow-sm" />');

console.log('Fixed final');
