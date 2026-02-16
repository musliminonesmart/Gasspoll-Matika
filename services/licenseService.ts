
import { LICENSE_CONFIG, getOrCreateDeviceId } from '../constants';

const STORAGE_KEY = 'gpm_license_data';
const ATTEMPT_KEY = 'gpm_license_attempts';

interface LicenseData {
  code: string;
  deviceId: string;
  activatedAt: number;
}

interface AttemptData {
  count: number;
  lockUntil: number;
}

export const licenseService = {
  getDeviceId: () => getOrCreateDeviceId(),

  verifyLicense: (): boolean => {
    if (!LICENSE_CONFIG.enabled) return true;

    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);
      if (!dataStr) return false;

      const data: LicenseData = JSON.parse(dataStr);
      
      // Check Device Lock
      if (LICENSE_CONFIG.deviceLock) {
        const currentDeviceId = getOrCreateDeviceId();
        if (data.deviceId !== currentDeviceId) return false;
      }

      // Check Expiry (if enabled)
      if (LICENSE_CONFIG.expiryDays > 0) {
        const expiryTime = data.activatedAt + (LICENSE_CONFIG.expiryDays * 24 * 60 * 60 * 1000);
        if (Date.now() > expiryTime) return false;
      }

      return true;
    } catch {
      return false;
    }
  },

  // Mock server validation
  activateLicense: async (code: string): Promise<{ success: boolean; message: string }> => {
    // Simulate network delay for realistic effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    const cleanCode = code.trim().toUpperCase();

    // Basic Format Validation
    if (!cleanCode.startsWith(LICENSE_CONFIG.prefix)) {
        return { success: false, message: `Format salah. Kode harus diawali "${LICENSE_CONFIG.prefix}"` };
    }

    if (cleanCode.length < LICENSE_CONFIG.codeMinLength) {
        return { success: false, message: 'Kode terlalu pendek. Periksa kembali.' };
    }

    // SIMULATED VALIDATION LOGIC:
    // In a real app, this would call an API. 
    // Here we assume any code matching the format is valid for the "AI App" demo purposes,
    // unless you want a specific "master key".
    // Let's add a simple check: Valid codes must contain at least one number and one dash.
    if (!/\d/.test(cleanCode) || !/-/.test(cleanCode)) {
       return { success: false, message: 'Kode tidak valid. Pastikan format benar (contoh: GPM-XXXX-XXXX).' };
    }
    
    const data: LicenseData = {
        code: cleanCode,
        deviceId: getOrCreateDeviceId(),
        activatedAt: Date.now()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Reset attempts on success
    localStorage.removeItem(ATTEMPT_KEY);
    
    return { success: true, message: 'Lisensi berhasil diaktifkan! Selamat belajar.' };
  },

  getAttempts: (): AttemptData => {
    const str = localStorage.getItem(ATTEMPT_KEY);
    if(!str) return { count: 0, lockUntil: 0 };
    return JSON.parse(str);
  },

  recordFailedAttempt: (): AttemptData => {
    const current = licenseService.getAttempts();
    const now = Date.now();
    
    // If lock expired, reset
    if (current.lockUntil > 0 && now > current.lockUntil) {
       const newData = { count: 1, lockUntil: 0 };
       localStorage.setItem(ATTEMPT_KEY, JSON.stringify(newData));
       return newData;
    }

    const newCount = current.count + 1;
    let lockUntil = current.lockUntil;

    if (newCount >= LICENSE_CONFIG.maxAttempts) {
       lockUntil = now + (LICENSE_CONFIG.lockSeconds * 1000);
    }

    const newData = { count: newCount, lockUntil };
    localStorage.setItem(ATTEMPT_KEY, JSON.stringify(newData));
    return newData;
  }
}
