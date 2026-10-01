const fs = require('fs');
let code = fs.readFileSync('src/app/pqs-letterhead/page.tsx', 'utf8');

if (!code.includes('Suspense fallback')) {
  // Find "export default function PQSLetterhead() {"
  code = code.replace(
    /export default function PQSLetterhead\(\) \{/g,
    `function LetterheadContent() {`
  );
  
  // Find the last "}" and append the wrapper
  code += `
export default function PQSLetterhead() {
  return (
    <React.Suspense fallback={<div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>}>
      <LetterheadContent />
    </React.Suspense>
  );
}
`;
  fs.writeFileSync('src/app/pqs-letterhead/page.tsx', code);
  console.log("Patched pqs-letterhead/page.tsx");
} else {
  console.log("Already patched.");
}
