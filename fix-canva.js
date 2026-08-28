const fs = require('fs');

['src/app/editor/page.tsx', 'src/app/pas-report/page.tsx'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Fix the old CanvaImage block that wasn't replaced
    content = content.replace(/<div className="flex-1 flex justify-center items-start">\s*<CanvaImage[\s\S]*?src=\{sampleImage\}[\s\S]*?className="border border-gray-200 shadow-sm bg-white p-2" \/>\s*<\/div>/, `<div className="flex-1 w-full relative">
                        {sampleImages.map(img => (
                          <CanvaImage 
                            key={img.id}
                            src={img.src} 
                            defaultWidth={400} 
                            defaultHeight={400} 
                            className="border border-gray-200 shadow-sm bg-white p-2 absolute" 
                          />
                        ))}
                      </div>`);
                      
    // And for pas-report/page.tsx which has:
    content = content.replace(/setSampleImage\(reader\.result as string\);/g, "setSampleImages(prev => [...prev, { id: Date.now().toString() + Math.random(), src: reader.result as string }]);");

    fs.writeFileSync(file, content);
});

console.log('Fixed CanvaImage');
