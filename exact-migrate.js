const fs = require('fs');

function replaceExact(file, search, replace) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
}

// 1. ReportForm.tsx
let f = 'src/components/form/ReportForm.tsx';
replaceExact(f, 'sampleImage: string | null;', 'sampleImages: {id: string, src: string}[];');
replaceExact(f, 'removeImage: () => void;', 'removeImage: (id: string) => void;');
replaceExact(f, 'sampleImage,', 'sampleImages,');
replaceExact(f, '{sampleImage && (', '{sampleImages && sampleImages.length > 0 && (');

let oldGroup = `<div className="mt-4 relative group">
              <img src={sampleImage} alt="Sample" className="w-full h-40 object-cover rounded-lg border shadow-sm" />
              <button onClick={removeImage} className="absolute top-2 right-2 bg-slate-900 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><X size={14}/></button>
            </div>`;
let newGroup = `<div className="mt-4 grid grid-cols-2 gap-2">
              {sampleImages.map(img => (
                <div key={img.id} className="relative group">
                  <img src={img.src} alt="Sample" className="w-full h-32 object-cover rounded-lg border shadow-sm" />
                  <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 bg-slate-900 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><X size={14}/></button>
                </div>
              ))}
            </div>`;
replaceExact(f, oldGroup, newGroup);
replaceExact(f, 'const pageName = `Page ${sampleImage ? 4 + index : 3 + index} Appendix`;', 'const pageName = `Page ${(sampleImages && sampleImages.length > 0) ? 4 + index : 3 + index} Appendix`;');
replaceExact(f, `<input type='file' className="hidden" accept="image/*" onChange={handleImageUpload} />`, `<input type='file' multiple className="hidden" accept="image/*" onChange={handleImageUpload} />`);


// 2. editor/page.tsx
f = 'src/app/editor/page.tsx';
replaceExact(f, 'const [sampleImage, setSampleImage] = useState<string | null>(null);', 'const [sampleImages, setSampleImages] = useState<{id: string, src: string}[]>([]);');
let oldLoad = `if (reportData.sampleImage) setSampleImage(reportData.sampleImage as any); /* eslint-disable-line @typescript-eslint/no-explicit-any */`;
let newLoad = `if (reportData.sampleImages) {
            setSampleImages(reportData.sampleImages as any[]);
          } else if (reportData.sampleImage) {
            setSampleImages([{ id: '1', src: reportData.sampleImage as string }]);
          }`;
replaceExact(f, oldLoad, newLoad);
replaceExact(f, 'const totalPages = (sampleImage ? 3 : 2) + extraPages.length;', 'const totalPages = (sampleImages.length > 0 ? 3 : 2) + extraPages.length;');
replaceExact(f, 'data: { formData, tests, sampleImage, extraPages }', 'data: { formData, tests, sampleImages, extraPages }');
replaceExact(f, '}, [isLoaded, formData, tests, extraPages, sampleImage]);', '}, [isLoaded, formData, tests, extraPages, sampleImages]);');
replaceExact(f, '{!sampleImage && extraPages.length === 0 && <EndOfReportMarker />}', '');
replaceExact(f, '{extraPages.length === 0 && <EndOfReportMarker />}', '');
let oldUpload = `const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSampleImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };`;
let newUpload = `const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSampleImages(prev => [...prev, { id: Date.now().toString() + Math.random(), src: reader.result as string }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };`;
replaceExact(f, oldUpload, newUpload);
replaceExact(f, 'sampleImage={sampleImage}', 'sampleImages={sampleImages}');
replaceExact(f, 'removeImage={() => setSampleImage(null)}', 'removeImage={(id) => setSampleImages(prev => prev.filter(img => img.id !== id))}');
replaceExact(f, '{sampleImage && (', '{sampleImages.length > 0 && (');

let oldCanva = `<div className="flex-1 flex justify-center items-start">
                      <CanvaImage 
                        src={sampleImage} 
                        defaultWidth={400} 
                        defaultHeight={400} 
                        className="border border-gray-200 shadow-sm bg-white p-2" />
                    </div>`;
let newCanva = `<div className="flex-1 w-full relative">
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
replaceExact(f, oldCanva, newCanva);
replaceExact(f, 'const pageNum = (sampleImage ? 4 : 3) + index;', 'const pageNum = (sampleImages.length > 0 ? 4 : 3) + index;');
replaceExact(f, `const EndOfReportMarker = () => (
  <div className="w-full flex items-center mt-6 px-10 mb-4">
    <div className="flex-1 border-b-[1.5px] border-black mr-4"></div>
    <div className="font-bold whitespace-nowrap text-[#002f6c]" style={{ fontSize: '14px', fontFamily: 'sans-serif' }}>End of Report</div>
  </div>
);`, '');


// 3. pas-report/page.tsx
f = 'src/app/pas-report/page.tsx';
replaceExact(f, 'const [sampleImage, setSampleImage] = useState<string | null>(null);', 'const [sampleImages, setSampleImages] = useState<{id: string, src: string}[]>([]);');
replaceExact(f, oldLoad, newLoad);
replaceExact(f, 'const totalPages = (sampleImage ? 3 : 2) + extraPages.length;', 'const totalPages = (sampleImages.length > 0 ? 3 : 2) + extraPages.length;');
replaceExact(f, 'data: { formData, tests, sampleImage, extraPages }', 'data: { formData, tests, sampleImages, extraPages }');
replaceExact(f, '}, [isLoaded, formData, tests, extraPages, sampleImage]);', '}, [isLoaded, formData, tests, extraPages, sampleImages]);');
replaceExact(f, '{!sampleImage && extraPages.length === 0 && <EndOfReportMarker />}', '');
replaceExact(f, '{extraPages.length === 0 && <EndOfReportMarker />}', '');
replaceExact(f, oldUpload, newUpload);
replaceExact(f, 'sampleImage={sampleImage}', 'sampleImages={sampleImages}');
replaceExact(f, 'removeImage={() => setSampleImage(null)}', 'removeImage={(id) => setSampleImages(prev => prev.filter(img => img.id !== id))}');
replaceExact(f, '{sampleImage && (', '{sampleImages.length > 0 && (');
replaceExact(f, oldCanva, newCanva);
replaceExact(f, 'const pageNum = (sampleImage ? 4 : 3) + index;', 'const pageNum = (sampleImages.length > 0 ? 4 : 3) + index;');
replaceExact(f, `const EndOfReportMarker = () => (
  <div className="w-full flex items-center mt-6 px-10 mb-4">
    <div className="flex-1 border-b-[1.5px] border-black mr-4"></div>
    <div className="font-bold whitespace-nowrap text-[#002f6c]" style={{ fontSize: '14px', fontFamily: 'sans-serif' }}>End of Report</div>
  </div>
);`, '');


console.log('Migration exact complete');
