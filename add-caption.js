const fs = require('fs');

const path = 'src/components/report/CanvaImage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add caption prop
code = code.replace(/className\?: string;\n\}/, "className?: string;\n  caption?: string;\n}");
code = code.replace(/className = '' \}: CanvaImageProps/, "className = '', caption }: CanvaImageProps");

// Update render wrapper to use flex and containerType
let oldRender = `<div className={\`w-full h-full relative transition-all cursor-move \$\{isHovered ? 'ring-2 ring-blue-500' : ''\}\`}>`;
let newRender = `<div className={\`w-full h-full relative flex flex-col transition-all cursor-move \$\{isHovered ? 'ring-2 ring-blue-500' : ''\}\`} style={{ containerType: 'inline-size' }}>`;
code = code.replace(oldRender, newRender);

// Update img and add caption
let oldImg = `<img \n            src=\{src\} \n            alt="Element" \n            className={\`w-full h-full object-contain pointer-events-none \$\{className\}\`}\n            style={{ mixBlendMode: blendMode }}\n          />`;
let newImg = `<img 
            src={src} 
            alt="Element" 
            className={\`w-full flex-1 min-h-0 object-contain pointer-events-none \$\{className\}\`}
            style={{ mixBlendMode: blendMode }}
          />
          {caption && (
            <div className="font-bold text-center w-full pb-2 text-slate-800 tracking-wide pt-2" style={{ fontSize: '4.5cqw' }}>
              {caption}
            </div>
          )}`;
code = code.replace(oldImg, newImg);

fs.writeFileSync(path, code);
console.log('Modified CanvaImage.tsx with caption and cqw');
