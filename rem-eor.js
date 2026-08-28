const fs = require('fs');

const removeMarker = (filePath) => {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Remove the component definition
    const regexDef = /const EndOfReportMarker = \(\) => \([\s\S]*?<\/div>\s*<\/div>\s*\);/;
    code = code.replace(regexDef, '');
    
    // Remove the usages
    code = code.replace(/\{!sampleImage && extraPages\.length === 0 && <EndOfReportMarker \/>\}/g, '');
    code = code.replace(/\{extraPages\.length === 0 && <EndOfReportMarker \/>\}/g, '');
    code = code.replace(/\{index === extraPages\.length - 1 && <EndOfReportMarker \/>\}/g, '');

    fs.writeFileSync(filePath, code);
}

removeMarker('src/app/editor/page.tsx');
removeMarker('src/app/pas-report/page.tsx');

console.log('Removed EndOfReportMarker from pages');
