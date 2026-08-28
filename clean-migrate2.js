const fs = require('fs');

function migrate() {
    // 1. ReportForm.tsx
    let rf = fs.readFileSync('src/components/form/ReportForm.tsx', 'utf8');
    rf = rf.replace(/sampleImage: string \| null;/g, 'sampleImages: {id: string, src: string}[];');
    rf = rf.replace(/removeImage: \(\) => void;/g, 'removeImage: (id: string) => void;');
    rf = rf.replace(/sampleImage,/g, 'sampleImages,');
    rf = rf.replace(/\{sampleImage && \(/, '{sampleImages && sampleImages.length > 0 && (');
    rf = rf.replace(
      /<div className="mt-4 relative group">[\s\S]*?<\/div>\s*<\/div>/,
      `<div className="mt-4 grid grid-cols-2 gap-2">
              {sampleImages.map(img => (
                <div key={img.id} className="relative group">
                  <img src={img.src} alt="Sample" className="w-full h-32 object-cover rounded-lg border shadow-sm" />
                  <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 bg-slate-900 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">X</button>
                </div>
              ))}
            </div>`
    );
    rf = rf.replace(/sampleImage \? 4 \+ index : 3 \+ index/g, '(sampleImages && sampleImages.length > 0) ? 4 + index : 3 + index');
    rf = rf.replace(/<input type='file' className="hidden" accept="image\/\*" onChange=\{handleImageUpload\} \/>/, "<input type='file' multiple className=\"hidden\" accept=\"image/*\" onChange={handleImageUpload} />");
    fs.writeFileSync('src/components/form/ReportForm.tsx', rf);

    // 2. editor/page.tsx & pas-report/page.tsx
    ['src/app/editor/page.tsx', 'src/app/pas-report/page.tsx'].forEach(file => {
        let code = fs.readFileSync(file, 'utf8');

        // State declaration
        code = code.replace(
            /const \[sampleImage, setSampleImage\] = useState<string \| null>\(null\);/,
            'const [sampleImages, setSampleImages] = useState<{id: string, src: string}[]>([]);'
        );

        // Supabase load
        code = code.replace(
            /if \(reportData\.sampleImage\) setSampleImage\(reportData\.sampleImage as any\); \/\* eslint-disable-line @typescript-eslint\/no-explicit-any \*\//,
            `if (reportData.sampleImages) {
            setSampleImages(reportData.sampleImages as any[]);
          } else if (reportData.sampleImage) {
            setSampleImages([{ id: '1', src: reportData.sampleImage as string }]);
          }`
        );

        // totalPages
        code = code.replace(
            /const totalPages = \(sampleImage \? 3 : 2\) \+ extraPages\.length;/g,
            'const totalPages = (sampleImages.length > 0 ? 3 : 2) + extraPages.length;'
        );
        code = code.replace(
            /const totalPages = \(sampleImage \? 2 : 1\) \+ extraPages\.length;/g,
            'const totalPages = (sampleImages.length > 0 ? 2 : 1) + extraPages.length;'
        );

        // JSON saving
        code = code.replace(/sampleImage,/g, 'sampleImages,');
        
        code = code.replace(/sampleImage: sampleImage,/g, 'sampleImages: sampleImages,');

        // useEffect dependencies
        code = code.replace(/sampleImage\]\)/g, 'sampleImages])');

        // remove marker usages
        code = code.replace(/\{!sampleImage && extraPages\.length === 0 && <EndOfReportMarker \/>\}/g, '');
        code = code.replace(/\{extraPages\.length === 0 && <EndOfReportMarker \/>\}/g, '');
        code = code.replace(/\{index === extraPages\.length - 1 && <EndOfReportMarker \/>\}/g, '');

        // Upload handler
        const uploadRegex = /const handleImageUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?reader\.readAsDataURL\(file\);\s*\}/;
        const newUpload = `const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        Array.from(e.target.files).forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setSampleImages(prev => [...prev, { id: Date.now().toString() + Math.random().toString(), src: reader.result as string }]);
          };
          reader.readAsDataURL(file);
        });
      }
    }`;
        code = code.replace(uploadRegex, newUpload);

        // Form Props
        code = code.replace(/sampleImage=\{sampleImage\}/g, 'sampleImages={sampleImages}');
        code = code.replace(/removeImage=\{\(\) => setSampleImage\(null\)\}/g, "removeImage={(id) => setSampleImages(prev => prev.filter(img => img.id !== id))}");

        // Page 3 rendering
        code = code.replace(/\{sampleImage && \(/g, '{sampleImages.length > 0 && (');
        const canvaReplaceRegex = /<div className="flex-1 flex justify-center items-start">\s*<CanvaImage[\s\S]*?className="border border-gray-200 shadow-sm bg-white p-2" \/>\s*<\/div>/;
        
        const multipleCanva = `<div className="flex-1 w-full relative">
                        {sampleImages.map(img => (
                          <CanvaImage 
                            key={img.id}
                            src={img.src} 
                            defaultWidth={400} 
                            defaultHeight={400} 
                            className="border border-gray-200 shadow-sm bg-white p-2 absolute" 
                          />
                        ))}
                      </div>`;
        code = code.replace(canvaReplaceRegex, multipleCanva);

        code = code.replace(/const pageNum = \(sampleImage \? 4 : 3\) \+ index;/g, 'const pageNum = (sampleImages.length > 0 ? 4 : 3) + index;');

        fs.writeFileSync(file, code);
    });

}

migrate();
console.log('Migration complete');
