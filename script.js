const fs = require('fs');
const html = fs.readFileSync('original_letterhead.html', 'utf8');
console.log(html.replace(/src=[^\s>]+/g, 'src="REDACTED"').replace(/url\([^)]+\)/g, 'url(REDACTED)'));
