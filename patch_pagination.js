const fs = require('fs');
let content = fs.readFileSync('src/app/editor/page.tsx', 'utf8');

const oldTotalPages = 'const totalPages = (sampleImages.length > 0 ? 3 : 2) + extraPages.length;';
const newTotalPages = `
  // Chunk tests for pagination
  const testChunks = [];
  const testsCopy = [...tests];
  if (testsCopy.length > 7) {
    testChunks.push(testsCopy.splice(0, 7)); // First page: 7 rows
    while (testsCopy.length > 0) {
      testChunks.push(testsCopy.splice(0, 10)); // Subsequent pages: 10 rows
    }
  } else {
    testChunks.push(testsCopy);
  }

  const totalPages = 1 + testChunks.length + (sampleImages.length > 0 ? 1 : 0) + extraPages.length;
`;
content = content.replace(oldTotalPages, newTotalPages);

const oldPage2 = `{/* PAGE 2 */}
        <div className="a4-page relative overflow-hidden flex flex-col bg-white">
          <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" style={{ imageRendering: '-webkit-optimize-contrast', filter: 'contrast(1.02)' }} />
          <div className="relative z-10 w-full h-full flex flex-col">
            <SubHeader reportNo={formData.reportNo} pageNum={2} totalPages={totalPages} />
            <div className="pt-[175px] flex-1 flex flex-col">
              <TestTable tests={tests} data={formData} />
                
                <div className="flex-1"></div>
              <div className="pb-[55px] relative">
                <Signature companyName={brandSettings.companyName} />
                <div className="absolute bottom-2 left-0 w-full text-center text-[8px] text-gray-400 font-sans tracking-wide">
                  This document was generated digitally and doesn&apos;t require a signature
                </div>
              </div>
            </div>
          </div>
        </div>`;

const newPage2 = `{/* PAGE 2 (Chunked Tables) */}
        {testChunks.map((chunk, chunkIdx) => (
          <div key={\`chunk-\${chunkIdx}\`} className="a4-page relative overflow-hidden flex flex-col bg-white shrink-0 mt-8">
            <img src="/frame.png" alt="Frame" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none object-fill" style={{ imageRendering: '-webkit-optimize-contrast', filter: 'contrast(1.02)' }} />
            <div className="relative z-10 w-full h-full flex flex-col">
              <SubHeader reportNo={formData.reportNo} pageNum={2 + chunkIdx} totalPages={totalPages} />
              <div className="pt-[175px] flex-1 flex flex-col">
                <TestTable 
                  tests={chunk} 
                  data={formData} 
                  isFirstPage={chunkIdx === 0}
                  isLastPage={chunkIdx === testChunks.length - 1}
                />
                <div className="flex-1"></div>
                <div className="pb-[55px] relative">
                  {chunkIdx === testChunks.length - 1 && (
                    <Signature companyName={brandSettings.companyName} />
                  )}
                  <div className="absolute bottom-2 left-0 w-full text-center text-[8px] text-gray-400 font-sans tracking-wide">
                    This document was generated digitally and doesn&apos;t require a signature
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}`;

content = content.replace(oldPage2, newPage2);

content = content.replace(
  '<SubHeader reportNo={formData.reportNo} pageNum={3} totalPages={totalPages} />',
  '<SubHeader reportNo={formData.reportNo} pageNum={1 + testChunks.length + 1} totalPages={totalPages} />'
);

content = content.replace(
  'const pageNum = (sampleImages.length > 0 ? 4 : 3) + index;',
  'const pageNum = 1 + testChunks.length + (sampleImages.length > 0 ? 1 : 0) + 1 + index;'
);

fs.writeFileSync('src/app/editor/page.tsx', content, 'utf8');
