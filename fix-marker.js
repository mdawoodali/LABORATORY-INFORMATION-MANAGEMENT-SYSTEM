const fs = require('fs');

const path = 'src/components/report/TestTable.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldMarker = `{/* End of Report Marker */}
      <div className="w-full text-center mt-12 mb-4">
        <div className="font-bold tracking-widest text-gray-800 whitespace-nowrap overflow-hidden text-[16px]">
          -------------------------------------------------- END OF PAGE --------------------------------------------------
        </div>
      </div>`;

const newMarker = `{/* End of Report Marker */}
      <div className="w-full flex items-center justify-center mt-12 mb-4">
        <div className="flex-1 border-b-[1.5px] border-black mr-4"></div>
        <div className="font-bold tracking-widest text-gray-800 whitespace-nowrap text-[16px]">
          END OF REPORT
        </div>
        <div className="flex-1 border-b-[1.5px] border-black ml-4"></div>
      </div>`;

code = code.replace(oldMarker, newMarker);

fs.writeFileSync(path, code);
console.log('Fixed end of report marker layout');
