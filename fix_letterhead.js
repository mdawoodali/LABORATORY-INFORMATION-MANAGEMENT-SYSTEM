const fs = require('fs');
let code = fs.readFileSync('src/app/pqs-letterhead/page.tsx', 'utf8');

// Remove the one I added at the bottom
code = code.replace(/export default function PQSLetterhead\(\) \{\n\s*return \(\n\s*<React\.Suspense[\s\S]*?<\/React\.Suspense>\n\s*\);\n\}\n?/g, '');

// Rename PQSLetterheadPage to LetterheadContent and remove 'export default'
code = code.replace(/export default function PQSLetterheadPage\(\) \{/g, 'function LetterheadContent() {');

// Add the wrapper at the bottom
code += `\nexport default function PQSLetterheadPage() {
  return (
    <React.Suspense fallback={<div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>}>
      <LetterheadContent />
    </React.Suspense>
  );
}
`;

fs.writeFileSync('src/app/pqs-letterhead/page.tsx', code);
console.log("Fixed PQSLetterheadPage exports.");
