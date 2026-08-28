const fs = require('fs');

const path = 'src/components/form/ReportForm.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/sampleImage: string \| null;/g, 'sampleImages: {id: string, src: string}[];');
code = code.replace(/removeImage: \(\) => void;/g, 'removeImage: (id: string) => void;');
code = code.replace(/sampleImage,/g, 'sampleImages,');
code = code.replace(/\{sampleImage && \(/, '{sampleImages && sampleImages.length > 0 && (');
code = code.replace(
  /<div className="mt-4 relative group">[\s\S]*?<\/div>/,
  `<div className="mt-4 grid grid-cols-2 gap-2">
              {sampleImages.map(img => (
                <div key={img.id} className="relative group">
                  <img src={img.src} alt="Sample" className="w-full h-32 object-cover rounded-lg border shadow-sm" />
                  <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 bg-slate-900 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><X size={14}/></button>
                </div>
              ))}
            </div>`
);
code = code.replace(/sampleImage \? 4 \+ index : 3 \+ index/g, '(sampleImages && sampleImages.length > 0) ? 4 + index : 3 + index');

// allow multiple select
code = code.replace(/<input type='file' className="hidden" accept="image\/\*" onChange=\{handleImageUpload\} \/>/, "<input type='file' multiple className=\"hidden\" accept=\"image/*\" onChange={handleImageUpload} />");

fs.writeFileSync(path, code);
console.log('Modified ReportForm for multiple images');
