import React, { useMemo, useState } from "react";
import { getOrCreateDeviceId } from "../utils/device";
import { activateLicense, loadLicense, isExpired } from "../utils/license";
import { SUPER_ADMIN } from "../constants";

type Props = {
  theme: any;
  onActivated: () => void;
};

export default function LicenseGateView({ theme, onActivated }: Props) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const deviceId = useMemo(() => getOrCreateDeviceId(), []);
  const lic = loadLicense();
  const expired = isExpired(lic);

  function submit() {
    setMsg(null);
    const res = activateLicense(code);
    if (!res.ok) {
      setMsg(res.reason || "Kode tidak valid. Coba cek lagi ya.");
      return;
    }
    onActivated();
  }

  async function copyDeviceId() {
    try {
      await navigator.clipboard.writeText(deviceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert("Gagal copy. Silakan blok Device ID lalu copy manual.");
    }
  }

  function openWhatsApp() {
    const wa = SUPER_ADMIN?.waNumber || "6289670335578";
    const text =
      `Assalamu’alaikum Kak Mus, saya mau aktivasi GassPoll Matika.%0A%0A` +
      `Device ID saya:%0A${deviceId}%0A%0A` +
      `Nama: ____%0AKelas: ____%0ASekolah: ____`;
    window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* LEFT: Hero Image + Value */}
          <div className="space-y-6">
            
            {/* HEADLINE & HOOK */}
            <div className="space-y-3 pb-2">
               <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
                 GASSPOLL <span className="text-blue-600">MATIKA</span>
               </h1>
               <p className="text-lg md:text-2xl font-bold text-gray-600 leading-snug">
                 "Rahasia Anak Pintar Matematika Tanpa Les Mahal! 🚀 Bikin Belajar Jadi Seru, Nilai Ujian Langsung Melesat."
               </p>
            </div>

            <div className="rounded-[2.5rem] overflow-hidden border bg-white shadow-sm relative group">
               {/* Decorative Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop"
                alt="GassPoll Matika - Kids Style"
                className="w-full h-64 md:h-80 object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-8 text-white z-20">
                 <p className="text-sm font-bold opacity-90 uppercase tracking-widest mb-1 shadow-black/20 drop-shadow-md">Premium Access</p>
                 <p className="text-3xl font-black shadow-black/20 drop-shadow-md">Belajar Makin Seru!</p>
              </div>
            </div>

            <div className="rounded-[2.5rem] border bg-white p-6 md:p-7 shadow-sm">
              <div className="text-sm md:text-base font-black text-gray-900">
                Yang kamu dapat di Premium:
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 font-medium flex items-center gap-2">
                  <span>✅</span> Materi Kelas 4–6 SD
                </div>
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 font-medium flex items-center gap-2">
                  <span>🧩</span> Latihan Santai (Soal PG)
                </div>
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 font-medium flex items-center gap-2">
                  <span>🏁</span> Try Out TKA + Nilai
                </div>
                <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4 font-medium flex items-center gap-2">
                  <span>⏱️</span> Timer Latihan Disiplin
                </div>
                <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 font-medium flex items-center gap-2">
                  <span>📌</span> Rumus Praktis (Print A4)
                </div>
                <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4 font-medium flex items-center gap-2">
                  <span>🌙</span> To Do Ramadan + Sertifikat
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200">
                🔒 Lisensi terikat 1 perangkat untuk keamanan & kualitas akses.
              </div>
            </div>
          </div>

          {/* RIGHT: Activation Card */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-6 md:p-8 space-y-6 top-10 sticky">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shadow-sm">
                🔐
              </div>
              <h2 className={`text-2xl md:text-3xl font-black ${theme?.text || "text-gray-900"}`}>
                Aktivasi Member
              </h2>
              <p className="text-sm text-gray-500 px-4">
                Masukkan <b>Kode Member</b> untuk membuka semua fitur Premium GassPoll Matika.
              </p>
            </div>

            {(lic?.isActive && !expired) && (
              <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-green-800 text-sm font-bold text-center">
                ✅ Akun ini sudah aktif. Selamat belajar ya!
              </div>
            )}

            {expired && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800 text-sm font-bold text-center">
                ⛔ Masa aktif habis. Hubungi admin untuk perpanjang.
              </div>
            )}

            {msg && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 text-sm font-bold text-center animate-pulse">
                {msg}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                 <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Kode Member</label>
                 <input
                   value={code}
                   onChange={(e) => setCode(e.target.value.toUpperCase())}
                   placeholder="GPM-XXXX-XXXX-XXXX"
                   className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-center font-mono font-bold text-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-gray-300"
                 />
              </div>

              <button
                onClick={submit}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-blue-300 transform transition-all active:scale-95"
              >
                🚀 Aktifkan Sekarang
              </button>

              <p className="text-xs text-center text-gray-400">
                Belum punya kode? Kirim <b>Device ID</b> ke admin.
              </p>
            </div>

            {/* Device ID Box */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="overflow-hidden">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Device ID Anda</div>
                  <div className="text-sm font-mono font-bold text-gray-700 break-all mt-1 leading-tight">{deviceId}</div>
                </div>

                <button
                  onClick={copyDeviceId}
                  className={`shrink-0 px-4 py-2 rounded-xl border text-xs font-black transition-all ${copied ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                  {copied ? "✅ Copied" : "📋 Copy"}
                </button>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <button
              onClick={openWhatsApp}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all"
            >
              💬 Beli Kode via WhatsApp
            </button>

            {/* Trust / Footer */}
            <div className="pt-6 border-t border-gray-100 text-center space-y-1">
              <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                GassPoll Matika • Made with ❤️ by Kak Mus
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}