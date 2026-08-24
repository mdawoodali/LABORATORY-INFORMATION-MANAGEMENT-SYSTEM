const fs = require('fs');

const files = [
    'src/app/pas-report/page.tsx',
    'src/app/invoice/page.tsx',
    'src/app/editor/page.tsx'
];

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace html2canvas with html-to-image
    const oldBlock = `        const html2canvas = (await import('html2canvas-pro')).default;
        // Scale lowered to 1.5 to prevent memory exhaustion and hanging during pdf generation
        const canvas = await html2canvas(pages[i] as HTMLElement, { scale: 1.5, useCORS: true });
        // Use PNG to prevent JPEG compression ringing artifacts around text and logos
        const imgData = canvas.toDataURL('image/png');`;
        
    const oldBlock2 = `        const html2canvas = (await import('html2canvas-pro')).default;
        const canvas = await html2canvas(pages[i] as HTMLElement, { scale: 1.5, useCORS: true });
        const imgData = canvas.toDataURL('image/png');`;

    const newBlock = `        const { toPng } = await import('html-to-image');
        const pageEl = pages[i] as HTMLElement;
        const imgData = await toPng(pageEl, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          style: {
            transform: 'none',
            transformOrigin: 'top left',
            margin: '0',
            position: 'relative',
          }
        });`;

    if (code.includes(oldBlock)) {
        code = code.replace(oldBlock, newBlock);
    } else if (code.includes(oldBlock2)) {
        code = code.replace(oldBlock2, newBlock);
    } else {
        // use regex just in case
        const regex = /const html2canvas = \(await import\('html2canvas-pro'\)\)\.default;[\s\S]*?const imgData = canvas\.toDataURL\('image\/png'\);/g;
        code = code.replace(regex, newBlock);
    }

    fs.writeFileSync(file, code);
    console.log('Fixed ' + file);
});
