const fs = require('fs');
const path = require('path');

const typesPath = path.join('src', 'types', 'index.ts');
let typesCode = fs.readFileSync(typesPath, 'utf8');

typesCode = typesCode.replace(/sampleDetails: string;/, 'sampleDetails: string;\n  remarks?: string;');
typesCode = typesCode.replace(/sampleDetails: 'Please specify',/, "sampleDetails: 'Please specify',\n  remarks: '',");

fs.writeFileSync(typesPath, typesCode);
console.log('Added remarks to types');
