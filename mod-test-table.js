const fs = require('fs');

const path = 'src/components/report/TestTable.tsx';
let code = fs.readFileSync(path, 'utf8');

// Increase table font size and padding
code = code.replace(/<table className="w-full border-collapse text-center" style=\{\{ fontSize: '12px' \}\}>/, '<table className="w-full border-collapse text-center mt-2" style={{ fontSize: \'14px\' }}>');
code = code.replace(/px-1\.5 py-1/g, 'px-2 py-4');

// Add END OF REPORT marker right after the remarks
const endOfReport = `
      {/* End of Report Marker */}
      <div className="w-full text-center mt-12 mb-4">
        <div className="font-bold tracking-widest text-gray-800 whitespace-nowrap overflow-hidden text-[16px]">
          -------------------------------------------------- END OF REPORT --------------------------------------------------
        </div>
      </div>
`;

code = code.replace(/<\/div>\s*\)\}\s*<\/div>/, '</div>\n      )}\n' + endOfReport + '\n    </div>');

fs.writeFileSync(path, code);
console.log('Modified TestTable');
