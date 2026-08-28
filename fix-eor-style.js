const fs = require('fs');

const oldMarker = `const EndOfReportMarker = () => (
  <div className="w-full flex justify-center mt-8 px-10 mb-4 opacity-90">
    <div className="text-[12px] font-bold text-center w-full overflow-hidden whitespace-nowrap tracking-widest text-slate-800">
      --------------------------------------------------------------------------------xx End of Report xx--------------------------------------------------------------------------------
    </div>
  </div>
);`;

const newMarker = `const EndOfReportMarker = () => (
  <div className="w-full flex items-center mt-6 px-10 mb-4">
    <div className="flex-1 border-b border-black mr-4"></div>
    <div className="font-bold whitespace-nowrap text-[#002f6c]" style={{ fontSize: '13px', fontFamily: 'sans-serif' }}>End of Report</div>
  </div>
);`;

const fixMarker = (filePath) => {
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(oldMarker, newMarker);
    fs.writeFileSync(filePath, code);
}

fixMarker('src/app/editor/page.tsx');
fixMarker('src/app/pas-report/page.tsx');

console.log('Fixed EndOfReportMarker');
