const fs = require('fs');

let data = fs.readFileSync('src/app/invoice/page.tsx', 'utf8');

data = data.replace(
  /const reportPassword = password \|\| formData\.invoiceNo\?\.slice\(-4\) \|\| '1234';/g,
  "const isDefaultPassword = id && password === id.slice(-4);\n          const reportPassword = (!password || isDefaultPassword) ? (formData.invoiceNo?.slice(-4) || '1234') : password;"
);

data = data.replace(
  /password: password \|\| formData\.invoiceNo\.slice\(-4\) \|\| '1234', \/\/ use the explicitly entered password/g,
  "password: (!password || (id && password === id.slice(-4))) ? (formData.invoiceNo?.slice(-4) || '1234') : password,"
);

data = data.replace(
  /if \(\!password\) \{\n\s*toast\.error\("Please enter a password to lock the PDF\."\);\n\s*return;\n\s*\}/g,
  `const effectivePassword = (!password || (id && password === id.slice(-4))) ? (formData.invoiceNo?.slice(-4) || '1234') : password;
    if (!effectivePassword) {
      toast.error("Please enter a password to lock the PDF.");
      return;
    }`
);

fs.writeFileSync('src/app/invoice/page.tsx', data, 'utf8');
console.log("patched invoice");
