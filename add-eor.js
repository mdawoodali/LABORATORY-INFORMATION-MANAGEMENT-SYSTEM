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

const processPage = (filePath, isPas) => {
    let code = fs.readFileSync(filePath, 'utf8');

    if (code.includes('EndOfReportMarker')) return;

    // Add marker component right after the imports
    code = code.replace(/import {.*?}.*?;\n/, match => match + markerComponent + '\n');

    // Page 2
    if (isPas) {
        code = code.replace(/<TestTable tests=\{tests\} data=\{formData\} \/>\s*<\/div>\s*<PASFooter pageNum=\{2\}/,
            `<TestTable tests={tests} data={formData} />
              {!sampleImage && extraPages.length === 0 && <EndOfReportMarker />}
            </div>
            <PASFooter pageNum={2}`);
    } else {
        code = code.replace(/<TestTable tests=\{tests\} data=\{formData\} \/>\s*<div className="flex-1"><\/div>/,
            `<TestTable tests={tests} data={formData} />
                {!sampleImage && extraPages.length === 0 && <EndOfReportMarker />}
                <div className="flex-1"></div>`);
    }

    // Page 3
    if (isPas) {
        code = code.replace(/<div className="flex-1 flex justify-center items-start px-10">\s*<CanvaImage([\s\S]*?)className="border border-gray-200 shadow-sm bg-white p-2"\s*\/>\s*<\/div>\s*<PASFooter pageNum=\{3\}/,
            `<div className="flex-1 flex flex-col px-10">
                <div className="flex-1 flex justify-center items-start">
                  <CanvaImage$1className="border border-gray-200 shadow-sm bg-white p-2" />
                </div>
                {extraPages.length === 0 && <EndOfReportMarker />}
              </div>
              <PASFooter pageNum={3}`);
    } else {
        code = code.replace(/<div className="pt-\[175px\] flex-1 flex justify-center items-start px-10 relative">\s*<CanvaImage([\s\S]*?)className="border border-gray-200 shadow-sm bg-white p-2"\s*\/>\s*<\/div>\s*<div className="pb-\[55px\] relative">/,
            `<div className="pt-[175px] flex-1 flex flex-col px-10 relative">
                  <div className="flex-1 flex justify-center items-start">
                    <CanvaImage$1className="border border-gray-200 shadow-sm bg-white p-2" />
                  </div>
                  {extraPages.length === 0 && <EndOfReportMarker />}
                </div>
                <div className="pb-[55px] relative">`);
    }

    // Extra Pages
    if (isPas) {
        code = code.replace(/<div className="flex-1 flex justify-center items-start mb-4">\s*<CanvaImage([\s\S]*?)className="max-w-full max-h-\[850px\] object-contain"\s*\/>\s*<\/div>\s*\)\}\s*<\/div>\s*<PASFooter pageNum=\{pageNum\}/,
            `<div className="flex-1 flex justify-center items-start mb-4">
                      <CanvaImage$1className="max-w-full max-h-[850px] object-contain" />
                    </div>
                  )}
                  {index === extraPages.length - 1 && <EndOfReportMarker />}
                </div>
                <PASFooter pageNum={pageNum}`);
    } else {
        code = code.replace(/<div className="flex-1 flex justify-center items-start mb-4">\s*<CanvaImage([\s\S]*?)className="max-w-full max-h-\[850px\] object-contain"\s*\/>\s*<\/div>\s*\)\}\s*<\/div>\s*<div className="pb-\[55px\] relative">/,
            `<div className="flex-1 flex justify-center items-start mb-4">
                        <CanvaImage$1className="max-w-full max-h-[850px] object-contain" />
                      </div>
                    )}
                    {index === extraPages.length - 1 && <EndOfReportMarker />}
                  </div>
                  <div className="pb-[55px] relative">`);
    }

    fs.writeFileSync(filePath, code);
}

processPage('src/app/editor/page.tsx', false);
processPage('src/app/pas-report/page.tsx', true);

console.log('Added EndOfReportMarker');
