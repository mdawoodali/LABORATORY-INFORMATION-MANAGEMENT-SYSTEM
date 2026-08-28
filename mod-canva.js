const fs = require('fs');

const path = 'src/components/report/CanvaImage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /className="relative w-full h-full flex items-center justify-center canva-wrapper"/,
  'className="absolute inset-0 pointer-events-none canva-wrapper"'
);

code = code.replace(
  /className=\{`group \$\{isHovered \? 'z-50' : 'z-10'\}`\}/,
  'className={`group pointer-events-auto ${isHovered ? \'z-50\' : \'z-10\'}`}'
);

fs.writeFileSync(path, code);
console.log('Modified CanvaImage');
