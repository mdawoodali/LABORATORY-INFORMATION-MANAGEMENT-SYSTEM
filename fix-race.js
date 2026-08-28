const fs = require('fs');

const files = ['src/app/editor/page.tsx', 'src/app/pas-report/page.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix reportId extraction
  content = content.replace(
    "const reportId = searchParams.get('report');",
    "const reportId = searchParams.get('report') || searchParams.get('id');"
  );

  const startStr = `  useEffect(() => {\n    if (templateId) {\n      const templateData = sessionStorage.getItem('sr_template_data');`;
  
  if (content.includes(startStr)) {
    const endStr = `  }, [templateId, reportId]);`;
    const startIndex = content.indexOf(startStr);
    const endIndex = content.indexOf(endStr, startIndex) + endStr.length;
    
    if (startIndex !== -1 && endIndex !== -1) {
      const block = content.substring(startIndex, endIndex);
      
      const newBlock = `  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (templateId) {
        const templateData = sessionStorage.getItem('sr_template_data');
        if (templateData) {
          try {
            const template = JSON.parse(templateData);
            const dynamicFields = template.formData.dynamicFields && template.formData.dynamicFields.length > 0 
                ? template.formData.dynamicFields 
                : migrateToDynamicFields(template.formData);
                
            if (!mounted) return;
            setFormData({
              ...template.formData,
              dynamicFields,
              reportNo: String(Math.floor(100000 + Math.random() * 900000)),
            });
            setTests(template.tests);
            if (template.extraPages) setExtraPages(template.extraPages);
            sessionStorage.removeItem('sr_template_data');
          } catch (e) {
            console.error('Failed to load template:', e);
          }
        }
      } else if (reportId) {
        await loadReport(reportId);
      }
      if (mounted) setIsLoaded(true);
    };
    init();
    return () => { mounted = false; };
  }, [templateId, reportId]);`;
      
      content = content.replace(block, newBlock);
    }
  }

  // 3. Set the default password dynamically if none is provided
  // password: password || '1234'
  content = content.replace(/password: password \|\| '1234',/g, "password: password || formData.reportNo.slice(-4) || '1234',");
  // Also fix the other instance if it has defaultPwd logic
  content = content.replace(/password: password \|\| defaultPwd \|\| '1234',/g, "password: password || formData.reportNo.slice(-4) || defaultPwd || '1234',");
  content = content.replace(/password: password,/g, "password: password || formData.reportNo.slice(-4) || '1234',");

  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}

let invContent = fs.readFileSync('src/app/invoice/page.tsx', 'utf8');
invContent = invContent.replace(/password: password \|\| defaultPwd \|\| '1234'/g, "password: password || formData.invoiceNo.slice(-4) || defaultPwd || '1234'");
invContent = invContent.replace(/password: password,/g, "password: password || formData.invoiceNo.slice(-4) || '1234',");
fs.writeFileSync('src/app/invoice/page.tsx', invContent);
console.log('Patched invoice');

