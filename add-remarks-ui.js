const fs = require('fs');

const path = 'src/components/report/TestTable.tsx';
let code = fs.readFileSync(path, 'utf8');

const remarksUI = `
      {/* Remarks */}
      {data.remarks && (
        <div className="mt-4 text-[13px]">
          <span className="font-bold mr-2">Remarks:</span>
          <span className="font-bold underline decoration-dotted">{data.remarks}</span>
        </div>
      )}
`;

code = code.replace(/<\/table>/, '</table>\n' + remarksUI);

fs.writeFileSync(path, code);
console.log('Added Remarks to TestTable');
