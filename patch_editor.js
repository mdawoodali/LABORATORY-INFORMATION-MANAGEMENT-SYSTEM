const fs = require('fs');
const file = 'src/app/editor/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /const \{ toPng \} = await import\('html-to-image'\);[\s\S]*?\]\);/g,
  \const html2canvas = (await import('html2canvas-pro')).default;
        const pageEl = pages[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');\
);

fs.writeFileSync(file, data);
