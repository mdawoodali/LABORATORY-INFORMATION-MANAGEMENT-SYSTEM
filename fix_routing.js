const fs = require('fs');
const files = [
  'src/app/editor/page.tsx',
  'src/app/invoice/page.tsx',
  'src/app/pas-report/page.tsx',
  'src/app/pqs-letterhead/page.tsx',
  'src/app/settings/page.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const pattern = /router\.push\('\/'\)/g;
  const count = (content.match(pattern) || []).length;
  content = content.replaceAll("router.push('/')", "window.location.href = '/'");
  fs.writeFileSync(f, content);
  console.log(f + ': replaced ' + count + ' occurrences');
});
