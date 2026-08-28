const fs = require('fs');

['src/app/editor/page.tsx', 'src/app/pas-report/page.tsx'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Fix setSampleImage in handleImageUpload
    content = content.replace(/setSampleImage\(reader\.result as string\);/g, "setSampleImages(prev => [...prev, { id: Date.now().toString() + Math.random(), src: reader.result as string }]);");
    
    // Fix any stray sampleImage references
    content = content.replace(/sampleImage=\{sampleImages\}/g, 'sampleImages={sampleImages}');
    
    fs.writeFileSync(file, content);
});

console.log('Fixed strays');
