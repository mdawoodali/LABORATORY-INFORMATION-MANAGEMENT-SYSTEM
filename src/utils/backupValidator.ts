export const ensureBackupFolder = async (basePath: string) => {
  if (!('__TAURI_INTERNALS__' in window) && !('__TAURI__' in window)) {
    return true; 
  }

  if (!basePath || basePath.trim() === '') {
    return false;
  }

  try {
    const cleanPath = basePath.trim();
    const { exists, mkdir } = await import('@tauri-apps/plugin-fs');
    
    const baseExists = await exists(cleanPath);
    if (!baseExists) {
      console.warn(`[Backup Validator] Base path does not exist: ${cleanPath}`);
      return false;
    }

    const srPath = `${cleanPath}\\LIMS BACKUP`;
    
    const srExists = await exists(srPath);
    if (!srExists) {
      console.log(`[Backup Validator] Creating missing directory: ${srPath}`);
      await mkdir(srPath, { recursive: true });
    }

    return srPath; 
  } catch (err) {
    console.error(`[Backup Validator] Critical failure creating folder at ${basePath}:`, err);
    return null; 
  }
};
