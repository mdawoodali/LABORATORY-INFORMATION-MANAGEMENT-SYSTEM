const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

code = code.replace(
  /const handleOpenReport = \(report: Record<string, unknown>\) => \{[\s\S]*?router\.push\('\/pas-report\?id=' \+ report\.reportNo\);\n\s*\}\n\s*\};/,
  `const handleOpenReport = (report: Record<string, unknown>) => {
    if (report.type === 'invoice') {
      router.push('/invoice?id=' + report.reportNo);
    } else if (report.type === 'letterhead') {
      router.push('/pqs-letterhead?id=' + report.reportNo);
    } else if (report.type === 'editor') {
      router.push('/editor?id=' + report.reportNo);
    } else {
      router.push('/pas-report?id=' + report.reportNo);
    }
  };`
);

fs.writeFileSync('src/app/page.tsx', code);
console.log("Patched page.tsx");
