const fs = require('fs');

let editorCode = fs.readFileSync('src/app/editor/page.tsx', 'utf8');
editorCode = editorCode.replace(/setFormData\(reportData\.formData\);/g, 'setFormData(reportData.formData as any); /* eslint-disable-line @typescript-eslint/no-explicit-any */');
editorCode = editorCode.replace(/setTests\(reportData\.tests\);/g, 'setTests(reportData.tests as any[]); /* eslint-disable-line @typescript-eslint/no-explicit-any */');
editorCode = editorCode.replace(/setExtraPages\(reportData\.extraPages\);/g, 'setExtraPages(reportData.extraPages as any[]); /* eslint-disable-line @typescript-eslint/no-explicit-any */');
editorCode = editorCode.replace(/setSampleImage\(reportData\.sampleImage\);/g, 'setSampleImage(reportData.sampleImage as any); /* eslint-disable-line @typescript-eslint/no-explicit-any */');
fs.writeFileSync('src/app/editor/page.tsx', editorCode);
