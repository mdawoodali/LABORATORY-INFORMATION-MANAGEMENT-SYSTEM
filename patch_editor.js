const fs = require('fs');

let data = fs.readFileSync('src/app/editor/page.tsx', 'utf8');

const target1 = `  const handlePrint = async (password?: string, isSilent: boolean = false) => {
    if (!password && !isSilent) {
      toast.error("Please enter a password to lock the PDF.");
      return;
    }`;
const repl1 = `  const handlePrint = async (password?: string, isSilent: boolean = false) => {
    const isDefaultPassword = reportId && password === reportId.slice(-4);
    const effectivePassword = (!password || isDefaultPassword) ? (formData.reportNo?.slice(-4) || '1234') : password;
    
    if (!effectivePassword && !isSilent) {
      toast.error("Please enter a password to lock the PDF.");
      return;
    }`;

const target2 = `password: password || formData.reportNo.slice(-4) || '1234',`;
const repl2 = `password: effectivePassword,`;

const target3 = `        if (password) {
          jsPdfOptions.encryption = {
            userPassword: password,
            ownerPassword: password,`;
const repl3 = `        if (effectivePassword) {
          jsPdfOptions.encryption = {
            userPassword: effectivePassword,
            ownerPassword: effectivePassword,`;

const target4 = `        try {
          const reportPassword = password || formData.reportNo?.slice(-4) || '1234';
            
          supabase.from('receipts').upsert({
              id: formData.reportNo,
              password: reportPassword,`;
const repl4 = `        try {
          const isDefaultPassword = reportId && password === reportId.slice(-4);
          const reportPassword = (!password || isDefaultPassword) ? (formData.reportNo?.slice(-4) || '1234') : password;
            
          supabase.from('receipts').upsert({
              id: formData.reportNo,
              password: reportPassword,`;

if (data.includes(target1)) data = data.replace(target1, repl1);
else console.log("target1 not found");

if (data.includes(target2)) data = data.replace(target2, repl2);
else console.log("target2 not found");

if (data.includes(target3)) data = data.replace(target3, repl3);
else console.log("target3 not found");

if (data.includes(target4)) data = data.replace(target4, repl4);
else console.log("target4 not found");

fs.writeFileSync('src/app/editor/page.tsx', data, 'utf8');
console.log("editor patched");
