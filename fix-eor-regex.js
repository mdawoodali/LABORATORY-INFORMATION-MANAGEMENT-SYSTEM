const fs = require('fs');

const fixMarker = (filePath) => {
    let code = fs.readFileSync(filePath, 'utf8');
    
    const regex = /const EndOfReportMarker = \(\) => \([\s\S]*?<\div>\s*<\/div>\s*\);/;
    
    const newMarker = `const EndOfReportMarker = () => (
  <div className="w-full flex items-center mt-6 px-10 mb-4">
    <div className="flex-1 border-b-[1.5px] border-black mr-4"></div>
    <div className="font-bold whitespace-nowrap text-[#002f6c]" style={{ fontSize: '14px', fontFamily: 'sans-serif' }}>End of Report</div>
  </div>
);`;

    code = code.replace(regex, newMarker);
    fs.writeFileSync(filePath, code);
}

fixMarker('src/app/editor/page.tsx');
fixMarker('src/app/pas-report/page.tsx');

console.log('Fixed EndOfReportMarker regex');
