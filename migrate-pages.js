const fs = require('fs');

function migratePage(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');

    // State declaration
    code = code.replace(
        /const \[sampleImage, setSampleImage\] = useState<string \| null>\(null\);/,
        'const [sampleImages, setSampleImages] = useState<{id: string, src: string}[]>([]);'
    );

    // Initial load
    code = code.replace(
        /if \(reportData\.sampleImage\) setSampleImage\(reportData\.sampleImage as any\); \/\* eslint-disable-line @typescript-eslint\/no-explicit-any \*\//,
        `if (reportData.sampleImages) {
            setSampleImages(reportData.sampleImages as any[]);
          } else if (reportData.sampleImage) {
            setSampleImages([{ id: '1', src: reportData.sampleImage as string }]);
          }`
    );

    // totalPages calculation
    code = code.replace(
        /const totalPages = \(sampleImage \? 3 : 2\) \+ extraPages\.length;/,
        'const totalPages = (sampleImages.length > 0 ? 3 : 2) + extraPages.length;'
    );
    code = code.replace(
        /const totalPages = \(sampleImage \? 2 : 1\) \+ extraPages\.length;/, // fallback if different logic
        'const totalPages = (sampleImages.length > 0 ? 2 : 1) + extraPages.length;'
    );

    // data saving
    code = code.replace(/sampleImage,/g, 'sampleImages,');

    // dependencies array in useEffect
    code = code.replace(/sampleImage\]\)/g, 'sampleImages])');

    // file upload handler
    const uploadRegex = /const handleImageUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?reader\.readAsDataURL\(file\);\s*\}/;
    const newUpload = `const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        Array.from(e.target.files).forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setSampleImages(prev => [...prev, { id: Date.now().toString() + Math.random(), src: reader.result as string }]);
          };
          reader.readAsDataURL(file);
        });
      }
    }`;
    code = code.replace(uploadRegex, newUpload);

    // Component props
    code = code.replace(/sampleImage=\{sampleImages\}/, 'sampleImages={sampleImages}');
    code = code.replace(/removeImage=\{\(\) => setSampleImage\(null\)\}/, "removeImage={(id) => setSampleImages(prev => prev.filter(img => img.id !== id))}");

    // Render PAGE 3
    const renderRegex = /\{\/\* PAGE 3 - Sample Image \*\/\}\s*\{sampleImages && \([\s\S]*?<CanvaImage[\s\S]*?className="border border-gray-200 shadow-sm bg-white p-2" \/>\s*<\/div>\s*<\/div>\s*<div className="pb-\[55px\] relative">\s*<Signature companyName=\{brandSettings\.companyName\} \/>\s*<div className="absolute bottom-2 left-0 w-full text-center text-\[8px\] text-gray-400 font-sans tracking-wide">\s*This document was generated digitally and doesn&apos;t require a signature\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;
    
    // Let's replace the whole Page 3 rendering block safely
    fs.writeFileSync(filePath, code);
}

migratePage('src/app/editor/page.tsx');
migratePage('src/app/pas-report/page.tsx');

console.log('Migrated state for pages');
