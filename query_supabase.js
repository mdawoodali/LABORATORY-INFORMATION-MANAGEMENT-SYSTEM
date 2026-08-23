
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
env.split('\n').forEach(l => {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);
supabase.from('receipts').select('*').order('created_at', { ascending: false }).limit(20).then(({ data, error }) => {
  if (error) console.error(error);
  else {
    const invoices = data.filter(d => d.data && d.data.type === 'invoice');
    console.log(JSON.stringify(invoices, null, 2));
  }
});

