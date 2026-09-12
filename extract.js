const fs = require('fs');
const code = fs.readFileSync('src/components/report/PQSWordmark.tsx', 'utf8');
const match = code.match(/data:image\/[^"']+/);
if (match) {
  const base64 = match[0].split(',')[1];
  fs.writeFileSync('C:/Users/ESHOP/.gemini/antigravity/brain/04956be2-e595-4f72-99f2-3056a11fb70c/wordmark.png', Buffer.from(base64, 'base64'));
  console.log('Saved wordmark.png');
} else {
  console.log('No match found');
}
