const fs = require('fs');

const markerComponent = `
const EndOfReportMarker = () => (
  <div className="w-full flex justify-center mt-8 px-10 mb-4 opacity-90">
    <div className="text-[12px] font-bold text-center w-full overflow-hidden whitespace-nowrap tracking-widest text-slate-800">
      --------------------------------------------------------------------------------xx End of Report xx--------------------------------------------------------------------------------
    </div>
  </div>
);
`;

const processPage = (filePath) => {
    let code = fs.readFileSync(filePath, 'utf8');

    if (!code.includes('EndOfReportMarker = () =>')) {
        code = code.replace(/"use client";/, '"use client";\n' + markerComponent);
        fs.writeFileSync(filePath, code);
    }
}

processPage('src/app/editor/page.tsx');
processPage('src/app/pas-report/page.tsx');

console.log('Fixed imports');
