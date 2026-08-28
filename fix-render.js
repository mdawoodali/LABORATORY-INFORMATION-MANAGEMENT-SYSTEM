const fs = require('fs');

function fixRender(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');

    // Replace the boolean check for Page 3
    code = code.replace(/\{sampleImage && \(/g, '{sampleImages.length > 0 && (');

    // Replace CanvaImage block
    const oldCanva = /<div className="flex-1 flex justify-center items-start">\s*<CanvaImage[\s\S]*?className="border border-gray-200 shadow-sm bg-white p-2" \/>\s*<\/div>/;
    
    const newCanva = `<div className="flex-1 w-full relative">
                      {sampleImages.map(img => (
                        <div key={img.id} className="absolute inset-0 pointer-events-none">
                          <div className="w-full h-full pointer-events-auto">
                            <CanvaImage 
                              src={img.src} 
                              defaultWidth={400} 
                              defaultHeight={400} 
                              className="border border-gray-200 shadow-sm bg-white p-2" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>`;

    code = code.replace(oldCanva, newCanva);

    // Also fix pageNum in extraPages mapping
    code = code.replace(/const pageNum = \(sampleImage \? 4 : 3\) \+ index;/g, 'const pageNum = (sampleImages.length > 0 ? 4 : 3) + index;');

    fs.writeFileSync(filePath, code);
}

fixRender('src/app/editor/page.tsx');
fixRender('src/app/pas-report/page.tsx');

console.log('Fixed render block');
