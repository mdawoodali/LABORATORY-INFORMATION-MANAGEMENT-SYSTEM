const fs = require('fs');
let c = fs.readFileSync('src/lib/sync.ts','utf8');
c = c.replace(/\\`sr_options_\\\$\{l\}\\`/g, "`sr_options_${l}`");
fs.writeFileSync('src/lib/sync.ts', c);
console.log('Fixed sync');
