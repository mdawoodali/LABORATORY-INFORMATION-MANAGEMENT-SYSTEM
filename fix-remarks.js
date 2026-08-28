const fs = require('fs');
let file = 'src/components/report/TestTable.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<span className="font-bold underline decoration-dotted">{data.remarks}</span>',
  '<span className="font-bold underline underline-offset-[3px] decoration-solid">{data.remarks}</span>'
);

fs.writeFileSync(file, content);
console.log('Fixed remarks underline');
