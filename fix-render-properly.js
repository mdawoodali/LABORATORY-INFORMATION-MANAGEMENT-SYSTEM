const fs = require('fs');

function fixRenderProperly(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');

    const badCanva = /<div className="flex-1 w-full relative">[\s\S]*?\{sampleImages\.map\(img => \([\s\S]*?<div key=\{img\.id\} className="absolute inset-0 pointer-events-none">[\s\S]*?<div className="w-full h-full pointer-events-auto">[\s\S]*?<CanvaImage[\s\S]*?\/>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\)\}[\s\S]*?<\/div>/;

    const goodCanva = `<div className="flex-1 w-full relative">
                      {sampleImages.map(img => (
                        <CanvaImage 
                          key={img.id}
                          src={img.src} 
                          defaultWidth={400} 
                          defaultHeight={400} 
                          className="border border-gray-200 shadow-sm bg-white p-2" 
                        />
                      ))}
                    </div>`;

    code = code.replace(badCanva, goodCanva);

    fs.writeFileSync(filePath, code);
}

fixRenderProperly('src/app/editor/page.tsx');
fixRenderProperly('src/app/pas-report/page.tsx');

console.log('Fixed render block properly');
