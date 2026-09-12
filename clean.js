const fs = require('fs');
const html = fs.readFileSync('original_letterhead.html', 'utf8');
const clean = html.replace(/data:image[^"']+/g, 'BASE64_IMAGE_REDACTED');
fs.writeFileSync('clean.html', clean);
