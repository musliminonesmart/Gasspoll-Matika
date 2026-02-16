import { LICENSE_CONFIG } from "../constants";
import { getOrCreateDeviceId } from "./device";

// key storage
const LICENSE_KEY = "gpm_license_v1";

export type LicenseState = {
  isActive: boolean;
  codeHash: string | null;
  boundDeviceId: string | null;
  activatedAt: number | null;
  expiresAt: number | null;
  plan: string | null; // opsional (K4/K5/K6/FAMILY)
};

export const defaultLicense: LicenseState = {
  isActive: false,
  codeHash: null,
  boundDeviceId: null,
  activatedAt: null,
  expiresAt: null,
  plan: null,
};

function simpleHash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return `h${Math.abs(h)}`;
}

export function loadLicense(): LicenseState {
  try {
    const raw = localStorage.getItem(LICENSE_KEY);
    if (!raw) return defaultLicense;
    return JSON.parse(raw) as LicenseState;
  } catch {
    return defaultLicense;
  }
}

export function saveLicense(state: LicenseState) {
  localStorage.setItem(LICENSE_KEY, JSON.stringify(state));
}

export function isExpired(license: LicenseState) {
  if (!license.expiresAt) return false;
  return Date.now() > license.expiresAt;
}

/**
 * Opsi B (offline): validasi format minimal + prefix.
 * Karena tanpa server, "valid" berarti format benar.
 * Anti-bajak utama dilakukan lewat device binding.
 */
export function validateCodeFormat(code: string) {
  const c = code.trim().toUpperCase();
  if (!c.startsWith(LICENSE_CONFIG.prefix + "-")) return { ok: false, reason: "Kode harus diawali GPM-" };
  if (c.length < LICENSE_CONFIG.codeMinLength) return { ok: false, reason: "Kode terlalu pendek." };
  return { ok: true, reason: "" };
}

export function activateLicense(code: string): { ok: boolean; reason?: string } {
  const deviceId = getOrCreateDeviceId();
  const current = loadLicense();

  // kalau sudah aktif dan device lock, cek device sama
  if (current.isActive && LICENSE_CONFIG.deviceLock) {
    if (current.boundDeviceId && current.boundDeviceId !== deviceId) {
      return { ok: false, reason: "Kode sudah terikat ke perangkat lain. Hubungi admin untuk reset." };
    }
    return { ok: true };
  }

  const check = validateCodeFormat(code);
  if (!check.ok) return { ok: false, reason: check.reason };

  const now = Date.now();
  const expiresAt =
    LICENSE_CONFIG.expiryDays && LICENSE_CONFIG.expiryDays > 0
      ? now + LICENSE_CONFIG.expiryDays * 24 * 60 * 60 * 1000
      : null;

  const planGuess = code.toUpperCase().includes("-K4-")
    ? "K4"
    : code.toUpperCase().includes("-K5-")
    ? "K5"
    : code.toUpperCase().includes("-K6-")
    ? "K6"
    : code.toUpperCase().includes("FAMILY")
    ? "FAMILY"
    : null;

  const next: LicenseState = {
    isActive: true,
    codeHash: simpleHash(code.trim().toUpperCase()),
    boundDeviceId: LICENSE_CONFIG.deviceLock ? deviceId : null,
    activatedAt: now,
    expiresAt,
    plan: planGuess,
  };

  saveLicense(next);
  return { ok: true };
}

export function deactivateLicense() {
  saveLicense(defaultLicense);
}