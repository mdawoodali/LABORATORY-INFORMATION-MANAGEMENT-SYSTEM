const fs = require('fs');

const path = 'src/components/form/DropdownInput.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\} else if \(defaultOptions\) \{/, 
`} else {
      setOptions(defaultOptions || []);
    } else if (false) {`); // Just a hack to make the replace work if there's multiple, let's do it cleanly

fs.writeFileSync(path, code);
console.log('Fixed DropdownInput');
