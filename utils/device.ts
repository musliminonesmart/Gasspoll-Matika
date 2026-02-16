export const DEVICE_KEY = "gpm_device_id_v1";

export function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto?.randomUUID ? crypto.randomUUID() : `dev_${Date.now()}_${Math.random()}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    // fallback kalau storage diblok
    return `dev_${Date.now()}_${Math.random()}`;
  }
}