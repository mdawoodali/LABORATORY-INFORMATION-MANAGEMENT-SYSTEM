const fs = require('fs');
const file = 'src/components/report/PnacLogo.tsx';
let data = fs.readFileSync(file, 'utf8');
data = data.replace('border-r-[1.5px]', 'border-r-[2px]');
fs.writeFileSync(file, data);
