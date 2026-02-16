
import React, { useState } from "react";
import { LICENSE_CONFIG, SUPER_ADMIN } from "../constants";
import { activateLicense, loadLicense, isExpired } from "../utils/license";
import { getOrCreateDeviceId } from "../utils/device";
import { Lock, Unlock, MessageCircle, Copy, Check, ShieldAlert } from 'lucide-react';

type Props = {
  theme: any;
  onActivated: () => void;
};

export default function LicenseGateView({ theme, onActivated }: Props) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const lic = loadLicense();
  const expired = isExpired(lic);
  const deviceId = getOrCreateDeviceId();

  function onSubmit() {
    setMsg(null);
    const res = activateLicense(code);
    if (!res.ok) {
      setMsg(res.reason || "Kode tidak valid.");
      return;
    }
    onActivated();
  }

  const handleCopyDevice = () => {
    navigator.clipboard.writeText(deviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContactAdmin = () => {
    const text = `Halo Admin GassPoll Matika, saya ingin aktivasi.\n\nDevice ID Saya: ${deviceId}\n\nMohon info paketnya.`;
    window.open(`https://wa.me/${SUPER_ADMIN.waNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white p-8 space-y-8">

        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm transform -rotate-3">
             <Lock size={40} />
          </div>
          <div>
            <h1 className={`text-3xl font-black ${theme.text}`}>Aktivasi Member</h1>
            <p className="text-gray-500 text-sm mt-1">
              Masukkan kode lisensi untuk mengakses materi.
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {(lic.isActive && !expired) && (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-green-800 text-sm flex items-center gap-3">
            <Unlock size={20} />
            <span className="font-bold">Akun Aktif! Mengalihkan...</span>
          </div>
        )}

        {expired && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800 text-sm flex items-center gap-3">
            <ShieldAlert size={20} />
            <span className="font-bold">Masa aktif habis. Silakan perpanjang.</span>
          </div>
        )}

        {msg && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 text-sm font-bold text-center animate-pulse">
            {msg}
          </div>
        )}

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kode Lisensi</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={`${LICENSE_CONFIG.prefix}-XXXX-XXXX`}
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-center font-mono text-xl font-bold tracking-widest focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-gray-300"
            />
          </div>
          <button
            onClick={onSubmit}
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-lg hover:bg-blue-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Unlock size={20} />
            Aktifkan Sekarang
          </button>
        </div>

        {/* Device ID Section */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
           <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Device ID Anda</label>
              {copied && <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><Check size={10} /> Tersalin</span>}
           </div>
           <div className="flex gap-2">
              <code className="flex-1 bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono text-gray-600 flex items-center truncate">
                 {deviceId}
              </code>
              <button 
                onClick={handleCopyDevice} 
                className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
                title="Salin ID"
              >
                 <Copy size={16} />
              </button>
           </div>
           <p className="text-[10px] text-gray-400 leading-tight">
              *Berikan Device ID ini kepada admin saat membeli lisensi.
           </p>
        </div>

        {/* Contact Admin */}
        <div className="pt-6 border-t border-gray-100 space-y-3">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Belum punya kode?</p>
          <button 
            onClick={handleContactAdmin}
            className="w-full py-3 rounded-2xl bg-green-500 text-white font-bold shadow-md hover:bg-green-600 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Hubungi Admin via WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
}
