const fs = require('fs');

const run = (file) => {
    let data = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

    // 1. handlePrint top
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

    // 2. jsPdfOptions
    const target3 = `        if (password) {
          jsPdfOptions.encryption = {
            userPassword: password,
            ownerPassword: password,`;
    const repl3 = `        if (effectivePassword) {
          jsPdfOptions.encryption = {
            userPassword: effectivePassword,
            ownerPassword: effectivePassword,`;

    // 3. supabase upsert handlePrint
    const target2 = `            supabase.from('receipts').upsert({
              id: formData.reportNo,
              password: password || formData.reportNo.slice(-4) || '1234',`;
    const repl2 = `            supabase.from('receipts').upsert({
              id: formData.reportNo,
              password: effectivePassword,`;

    // 4. supabase upsert autosave
    const target4 = `        // Use explicitly set password, or default to last 4 digits of report number
        const reportPassword = password || formData.reportNo.slice(-4) || '1234';
          
        supabase.from('receipts').upsert({
            id: formData.reportNo,
            password: reportPassword,`;
    const repl4 = `        // Use explicitly set password, or default to last 4 digits of report number
        const isDefaultPassword = reportId && password === reportId.slice(-4);
        const reportPassword = (!password || isDefaultPassword) ? (formData.reportNo?.slice(-4) || '1234') : password;
          
        supabase.from('receipts').upsert({
            id: formData.reportNo,
            password: reportPassword,`;

    if (data.includes(target1)) data = data.replace(target1, repl1); else console.log("target1 not found in", file);
    if (data.includes(target2)) data = data.replace(target2, repl2); else console.log("target2 not found in", file);
    if (data.includes(target3)) data = data.replace(target3, repl3); else console.log("target3 not found in", file);
    if (data.includes(target4)) data = data.replace(target4, repl4); else console.log("target4 not found in", file);

    fs.writeFileSync(file, data, 'utf8');
    console.log(file, "patched");
};

run('src/app/pas-report/page.tsx');
