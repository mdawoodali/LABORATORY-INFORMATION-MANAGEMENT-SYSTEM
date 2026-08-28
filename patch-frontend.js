const fs = require('fs');

const files = ['src/app/editor/page.tsx', 'src/app/pas-report/page.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Fix reportId extraction
  content = content.replace(
    "const reportId = searchParams.get('report');",
    "const reportId = searchParams.get('report') || searchParams.get('id');"
  );

  // 2. Fix the useEffect race condition. We will just use regex to wrap the loadReport in an async IIFE and await it
  // Actually regex might be tricky, let's just do precise replacement.
  
  const oldUseEffectStart = `useEffect(() => {
    if (templateId) {`;
    
  if (content.includes(oldUseEffectStart)) {
      // Find the end of this useEffect
      // We know it ends with:
      //     } else if (reportId) {
      //       loadReport(reportId);
      //     }
      //     // eslint-disable-next-line react-hooks/set-state-in-effect
      //     setIsLoaded(true);
      //   }, [templateId, reportId]);
      
      const targetChunk = `} else if (reportId) {
      loadReport(reportId);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, [templateId, reportId]);`;
      
      const replacementChunk = `} else if (reportId) {
        await loadReport(reportId);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoaded(true);
    };
    init();
  }, [templateId, reportId]);`;
  
      content = content.replace(oldUseEffectStart, `useEffect(() => {\n    const init = async () => {\n      if (templateId) {`);
      content = content.replace(targetChunk, replacementChunk);
  }

  // 3. Set the default password dynamically if none is provided
  // In pas-report and editor, password logic is:
  // password: password || '1234',
  // Let's change it to:
  // password: password || formData.reportNo.slice(-4),
  content = content.replace(/password: password \|\| '1234',/g, "password: password || formData.reportNo.slice(-4) || '1234',");
  // Also fix the other instance if it has defaultPwd logic
  content = content.replace(/password \|\| defaultPwd \|\| '1234'/g, "password || formData.reportNo.slice(-4)");

  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}

// 4. Also fix invoice/page.tsx for the password default
let invContent = fs.readFileSync('src/app/invoice/page.tsx', 'utf8');
invContent = invContent.replace(/password: password \|\| defaultPwd \|\| '1234'/g, "password: password || formData.invoiceNo.slice(-4) || '1234'");
fs.writeFileSync('src/app/invoice/page.tsx', invContent);
console.log('Patched invoice');

