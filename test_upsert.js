
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
env.split('\n').forEach(l => {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);
supabase.from('receipts').upsert({
  id: 'test-invoice-1234',
  password: '123',
  data: { type: 'invoice' }
}).then((res) => console.log('Upsert result:', res));

