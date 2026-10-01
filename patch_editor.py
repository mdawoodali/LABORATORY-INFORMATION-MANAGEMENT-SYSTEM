import os

with open('src/app/editor/page.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

target1 = """  const handlePrint = async (password?: string, isSilent: boolean = false) => {
    if (!password && !isSilent) {
      toast.error("Please enter a password to lock the PDF.");
      return;
    }"""
repl1 = """  const handlePrint = async (password?: string, isSilent: boolean = false) => {
    const isDefaultPassword = reportId && password === reportId.slice(-4);
    const effectivePassword = (!password || isDefaultPassword) ? (formData.reportNo?.slice(-4) || '1234') : password;
    
    if (!effectivePassword && !isSilent) {
      toast.error("Please enter a password to lock the PDF.");
      return;
    }"""

target2 = "password: password || formData.reportNo.slice(-4) || '1234',"
repl2 = "password: effectivePassword,"

target3 = """        if (password) {
          jsPdfOptions.encryption = {
            userPassword: password,
            ownerPassword: password,"""
repl3 = """        if (effectivePassword) {
          jsPdfOptions.encryption = {
            userPassword: effectivePassword,
            ownerPassword: effectivePassword,"""

target4 = """        try {
          const reportPassword = password || formData.reportNo?.slice(-4) || '1234';
            
          supabase.from('receipts').upsert({
              id: formData.reportNo,
              password: reportPassword,"""
repl4 = """        try {
          const isDefaultPassword = reportId && password === reportId.slice(-4);
          const reportPassword = (!password || isDefaultPassword) ? (formData.reportNo?.slice(-4) || '1234') : password;
            
          supabase.from('receipts').upsert({
              id: formData.reportNo,
              password: reportPassword,"""

if target1 in data: data = data.replace(target1, repl1)
else: print("target1 not found")

if target2 in data: data = data.replace(target2, repl2)
else: print("target2 not found")

if target3 in data: data = data.replace(target3, repl3)
else: print("target3 not found")

if target4 in data: data = data.replace(target4, repl4)
else: print("target4 not found")

with open('src/app/editor/page.tsx', 'w', encoding='utf-8') as f:
    f.write(data)

print("editor patched")
