const fs = require('fs');

['src/app/editor/page.tsx', 'src/app/pas-report/page.tsx'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add caption to CanvaImage
    content = content.replace(/<CanvaImage \n                            key=\{img\.id\}\n                            src=\{img\.src\}/, 
        `<CanvaImage 
                            key={img.id}
                            src={img.src}
                            caption={sampleImages.length > 1 ? \`Product Picture #\$\{sampleImages.indexOf(img) + 1\}\` : 'Product Picture'}`);

    // 2. Add name to image upload logic
    content = content.replace(/setSampleImages\(prev => \[\.\.\.prev, \{ id: Date\.now\(\)\.toString\(\) \+ Math\.random\(\), src: reader\.result as string \}\]\);/,
        `setSampleImages(prev => [...prev, { id: Date.now().toString() + Math.random(), src: reader.result as string, name: file.name }]);`);
    
    // Also change the state type!
    content = content.replace(/const \[sampleImages, setSampleImages\] = useState<\{id: string, src: string\}\[\]>\(\[\]\);/,
        `const [sampleImages, setSampleImages] = useState<{id: string, src: string, name?: string}[]>([]);`);

    // 3. Update the default password to last 4 digits
    if (file.includes('editor')) {
      content = content.replace(/const defaultPassword = '1234';/, `const defaultPassword = formData.reportNo ? formData.reportNo.slice(-4) : '1234';`);
    } else {
      content = content.replace(/const defaultPassword = '1234';/, `const defaultPassword = formData.reportNo ? formData.reportNo.slice(-4) : '1234';`);
    }

    fs.writeFileSync(file, content);
});

// Update ReportForm.tsx state type and add the name label
let f = 'src/components/form/ReportForm.tsx';
let rfc = fs.readFileSync(f, 'utf8');
rfc = rfc.replace(/sampleImages: \{id: string, src: string\}\[\];/, `sampleImages: {id: string, src: string, name?: string}[];`);

let oldGroup = `<div key={img.id} className="relative group">
                  <img src={img.src} alt="Sample" className="w-full h-32 object-cover rounded-lg border shadow-sm" />
                  <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 bg-slate-900 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><X size={14}/></button>
                </div>`;
let newGroup = `<div key={img.id} className="relative group flex flex-col">
                  <div className="relative">
                    <img src={img.src} alt="Sample" className="w-full h-32 object-cover rounded-lg border shadow-sm" />
                    <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 bg-slate-900 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><X size={14}/></button>
                  </div>
                  <div className="text-xs text-center mt-1 truncate px-1 text-slate-500 font-medium" title={img.name || 'Product Picture'}>{img.name || 'Product Picture'}</div>
                </div>`;
rfc = rfc.replace(oldGroup, newGroup);

fs.writeFileSync(f, rfc);

console.log('Applied caption, sequence, name, and default password');
