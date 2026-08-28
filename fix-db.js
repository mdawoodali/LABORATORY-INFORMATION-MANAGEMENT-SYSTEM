const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://mrskydxtqadibddtvkrk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yc2t5ZHh0cWFkaWJkZHR2a3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTg1ODUsImV4cCI6MjEwMjI5NDU4NX0.tHoRJg1FOYFDUNA0rPivEhhD2dXAKqyql_e16TQkG70"
);

async function run() {
  const { data: reports, error } = await supabase.from('receipts').select('id, data, password').neq('id', 'GLOBAL_SETTINGS');
  
  if (error) {
    console.error("Error fetching", error);
    return;
  }
  
  console.log(`Found ${reports.length} reports to check...`);
  
  for (const report of reports) {
    let changed = false;
    let newData = { ...report.data };
    
    // Fix password
    let newPassword = report.password;
    if (report.id && report.id.length >= 4) {
      const expectedPassword = report.id.slice(-4);
      if (newPassword !== expectedPassword) {
        newPassword = expectedPassword;
        changed = true;
      }
    }
    
    // Fix formData reportNo/invoiceNo
    if (newData.formData) {
      if (newData.type === 'invoice' || newData.formData.invoiceNo !== undefined) {
        if (newData.formData.invoiceNo !== report.id) {
          newData.formData.invoiceNo = report.id;
          changed = true;
        }
      } else {
        if (newData.formData.reportNo !== report.id) {
          newData.formData.reportNo = report.id;
          changed = true;
        }
      }
    }
    
    if (changed) {
      console.log(`Fixing report ${report.id}...`);
      await supabase.from('receipts').update({
        password: newPassword,
        data: newData
      }).eq('id', report.id);
    }
  }
  console.log("Migration complete.");
}

run();
