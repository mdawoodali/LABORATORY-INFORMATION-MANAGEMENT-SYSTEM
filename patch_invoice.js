const fs = require('fs');

const run = (file) => {
    let data = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

    const target1 = `  const handlePrint = async () => {
    if (!password) {
      toast.error("Please enter a password to lock the PDF.");
      return;
    }`;
    const repl1 = `  const handlePrint = async () => {
    const isDefaultPassword = id && password === id.slice(-4);
    const effectivePassword = (!password || isDefaultPassword) ? (formData.invoiceNo?.slice(-4) || '1234') : password;
    
    if (!effectivePassword) {
      toast.error("Please enter a password to lock the PDF.");
      return;
    }`;

    const target2 = `            supabase.from('receipts').upsert({
              id: formData.invoiceNo,
              password: password || formData.invoiceNo.slice(-4) || '1234', // use the explicitly entered password`;
    const repl2 = `            supabase.from('receipts').upsert({
              id: formData.invoiceNo,
              password: effectivePassword,`;

    const target4 = `      const timer = setTimeout(async () => {
        try {
          const reportPassword = password || formData.invoiceNo?.slice(-4) || '1234';
            
          const { supabase } = await import('@/lib/supabase');
          extractAndSaveOptions(formData, 'invoice');
          supabase.from('receipts').upsert({
              id: formData.invoiceNo,
              password: reportPassword,`;
    const repl4 = `      const timer = setTimeout(async () => {
        try {
          const isDefaultPassword = id && password === id.slice(-4);
          const reportPassword = (!password || isDefaultPassword) ? (formData.invoiceNo?.slice(-4) || '1234') : password;
            
          const { supabase } = await import('@/lib/supabase');
          extractAndSaveOptions(formData, 'invoice');
          supabase.from('receipts').upsert({
              id: formData.invoiceNo,
              password: reportPassword,`;

    if (data.includes(target1)) data = data.replace(target1, repl1); else console.log("target1 not found in", file);
    if (data.includes(target2)) data = data.replace(target2, repl2); else console.log("target2 not found in", file);
    if (data.includes(target4)) data = data.replace(target4, repl4); else console.log("target4 not found in", file);

    fs.writeFileSync(file, data, 'utf8');
    console.log(file, "patched");
};

run('src/app/invoice/page.tsx');
