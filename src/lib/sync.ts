import { supabase } from './supabase';

export async function pullGlobalSettings() {
  if (typeof window === 'undefined') return;
  
  try {
    const { data, error } = await supabase
      .from('receipts')
      .select('data')
      .eq('id', 'GLOBAL_SETTINGS')
      .single();
      
    if (data?.data && !error) {
      const cloudData = data.data as Record<string, any>;
      let hasChanges = false;
      
      for (const [key, cloudValue] of Object.entries(cloudData)) {
        if (key.startsWith('sr_')) {
          const localValue = localStorage.getItem(key);
          
          if (key.startsWith('sr_options_')) {
            try {
              const cloudArr = typeof cloudValue === 'string' ? JSON.parse(cloudValue) : cloudValue;
              const localArr = localValue ? JSON.parse(localValue) : [];
              const mergedArr = Array.from(new Set([...localArr, ...(Array.isArray(cloudArr) ? cloudArr : [])]));
              const mergedStr = JSON.stringify(mergedArr);
              if (mergedStr !== localValue) {
                localStorage.setItem(key, mergedStr);
                hasChanges = true;
              }
            } catch (e) {
              // ignore parse errors
            }
          } else {
            if (!localValue && typeof cloudValue === 'string') {
              localStorage.setItem(key, cloudValue);
              hasChanges = true;
            }
          }
        }
      }
      
      if (hasChanges) {
        window.dispatchEvent(new Event('local-storage-synced'));
      }
    }
  } catch (err) {
    console.error("Failed to pull global settings", err);
  }
}

export async function pushGlobalSettings() {
  if (typeof window === 'undefined') return;
  
  try {
    const dump: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Exclude backuppath as it's device-specific
      if (key && key.startsWith('sr_') && key !== 'sr_backuppath') {
        dump[key] = localStorage.getItem(key) || '';
      }
    }
    
    const { data } = await supabase
      .from('receipts')
      .select('data')
      .eq('id', 'GLOBAL_SETTINGS')
      .single();
      
    let mergedDump: Record<string, any> = { ...dump };
    
    if (data?.data) {
      const cloudData = data.data as Record<string, any>;
      mergedDump = { ...cloudData, ...dump };
      
      for (const [key, cloudValue] of Object.entries(cloudData)) {
        if (key.startsWith('sr_options_')) {
          try {
             const cloudArr = typeof cloudValue === 'string' ? JSON.parse(cloudValue) : cloudValue;
             const localArr = dump[key] ? JSON.parse(dump[key]) : [];
             const mergedArr = Array.from(new Set([...(Array.isArray(cloudArr) ? cloudArr : []), ...localArr]));
             mergedDump[key] = JSON.stringify(mergedArr);
          } catch {}
        }
      }
    }

    await supabase.from('receipts').upsert({
      id: 'GLOBAL_SETTINGS',
      password: 'admin',
      data: mergedDump
    });
    
  } catch (err) {
    console.error("Failed to push global settings", err);
  }
}
