const fs = require('fs');

const pathEditor = 'src/app/editor/page.tsx';
let codeEditor = fs.readFileSync(pathEditor, 'utf8');

// For Page 3 in editor
codeEditor = codeEditor.replace(
    /<div className="flex-1 flex justify-center items-start">\s*<CanvaImage/g,
    '<div className="flex justify-center items-start"><CanvaImage'
);
// For extra pages in editor
codeEditor = codeEditor.replace(
    /<div className="flex-1 flex justify-center items-start mb-4">\s*<CanvaImage([\s\S]*?)className="max-w-full max-h-\[850px\] object-contain"/g,
    '<div className="flex justify-center items-start mb-4"><CanvaImage$1className="max-w-full max-h-[850px] object-contain"'
);
fs.writeFileSync(pathEditor, codeEditor);

const pathPas = 'src/app/pas-report/page.tsx';
let codePas = fs.readFileSync(pathPas, 'utf8');

// For Page 3 in pas-report
codePas = codePas.replace(
    /<div className="flex-1 flex justify-center items-start">\s*<CanvaImage/g,
    '<div className="flex justify-center items-start"><CanvaImage'
);
// For extra pages in pas-report
codePas = codePas.replace(
    /<div className="flex-1 flex justify-center items-start mb-4">\s*<CanvaImage([\s\S]*?)className="max-w-full max-h-\[850px\] object-contain"/g,
    '<div className="flex justify-center items-start mb-4"><CanvaImage$1className="max-w-full max-h-[850px] object-contain"'
);
fs.writeFileSync(pathPas, codePas);

console.log('Fixed flex-1 wrapper');
