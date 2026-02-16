import React, { useMemo, useState } from "react";
import { getOrCreateDeviceId } from "../utils/device";
import { activateLicense, loadLicense, isExpired } from "../utils/license";
import { SUPER_ADMIN } from "../constants";
import { Check, Copy, CheckCircle2, AlertCircle, MessageCircle, Lock, Sparkles, Brain, Clock, ShieldCheck, Heart, Star, Users } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* LOGO HEADER */}
        <div className="flex items-center gap-3 mb-8 md:mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
            G
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">GassPoll Matika</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: LANDING PAGE CONTENT (Scrollable) */}
          <div className="lg:col-span-7 space-y-12 md:space-y-16 pb-10">
            
            {/* 1. HERO SECTION */}
            <div className="space-y-6 animate-in slide-in-from-left duration-700">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest border border-orange-200">
                  <Heart size={14} className="fill-orange-500 text-orange-500" /> Aplikasi Belajar Bersama Ortu
               </div>
               
               <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                 Bantu Anak Pintar Matematika <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Tanpa Drama</span> & Tanpa Les Mahal.
               </h1>
               
               <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl">
                 "Bingung ngajarin PR anak karena cara hitung beda dengan zaman dulu? GassPoll Matika hadir sebagai <span className="font-bold text-slate-800">Asisten Pribadi Ayah Bunda</span> untuk membimbing anak belajar mandiri."
               </p>

               {/* Hero Image */}
               <div className="rounded-[2rem] overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200 relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                  <img
                    src="https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=2070&auto=format&fit=crop"
                    className="w-full h-auto block max-h-[420px] sm:max-h-[520px] object-cover transform group-hover:scale-105 transition-transform duration-1000"
                    alt="Anak dan Orang Tua Belajar Aplikasi GassPoll Matika"
                  />
                  <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                     <p className="font-bold text-lg mb-1 flex items-center gap-2">⭐ Metode Smart & Fun</p>
                     <p className="text-sm opacity-90">Anak jadi lebih percaya diri menghadapi ulangan harian & ujian sekolah.</p>
                  </div>
               </div>
            </div>

            {/* 2. PAIN POINTS (Why Parents Need This) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-[2px] w-10 bg-slate-200"></div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">KENAPA GASSPOLL?</h3>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-slate-800">Sering Mengalami Ini, Bun?</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                   <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4"><Brain size={20} /></div>
                   <h4 className="font-bold text-slate-800 mb-2">Kurikulum Berubah Terus</h4>
                   <p className="text-sm text-slate-500 leading-relaxed">Bingung cara jelasin materi karena metode di sekolah beda dengan cara kita dulu.</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                   <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-4"><Clock size={20} /></div>
                   <h4 className="font-bold text-slate-800 mb-2">Waktu Terbatas</h4>
                   <p className="text-sm text-slate-500 leading-relaxed">Sibuk kerja atau urus rumah, jadi tidak sempat mendampingi anak belajar full time.</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                   <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4"><Users size={20} /></div>
                   <h4 className="font-bold text-slate-800 mb-2">Biaya Les Mahal</h4>
                   <p className="text-sm text-slate-500 leading-relaxed">Biaya bimbel privat semakin tinggi, tapi hasil nilai anak belum tentu maksimal.</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                   <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 mb-4"><Sparkles size={20} /></div>
                   <h4 className="font-bold text-slate-800 mb-2">Anak Kecanduan HP</h4>
                   <p className="text-sm text-slate-500 leading-relaxed">Susah lepas dari gadget. Solusinya? Ubah gadget jadi alat belajar yang seru!</p>
                </div>
              </div>
            </div>

            {/* 3. PREMIUM FEATURES GRID */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                
                <div className="text-sm sm:text-[15px] font-black text-gray-900 flex items-center gap-2 mb-2">
                   <Sparkles className="text-blue-600" size={18} /> Yang kamu dapat di Premium:
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                   {[
                     { title: "Materi Kelas 4-6 SD Lengkap", icon: "📚", color: "bg-blue-50 text-blue-700" },
                     { title: "Latihan Soal Unlimited", icon: "📝", color: "bg-green-50 text-green-700" },
                     { title: "Chat AI Tutor (24 Jam)", icon: "🤖", color: "bg-purple-50 text-purple-700" },
                     { title: "Try Out & Analisa Nilai", icon: "📊", color: "bg-orange-50 text-orange-700" },
                     { title: "Mode Ramadan & Ibadah", icon: "🌙", color: "bg-teal-50 text-teal-700" },
                     { title: "Cetak Sertifikat & Rapor", icon: "🖨️", color: "bg-red-50 text-red-700" },
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                        <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform`}>
                           {item.icon}
                        </div>
                        <span className="font-bold text-slate-700 leading-tight">{item.title}</span>
                     </div>
                   ))}
                </div>
            </div>

             {/* 4. TESTIMONIAL / TRUST */}
             <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 text-center space-y-4">
                <div className="flex justify-center gap-1">
                   {[1,2,3,4,5].map(i => <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-slate-700 font-medium italic text-lg">
                   "Alhamdulillah sejak pakai GassPoll, saya jadi tenang. Anak belajar mandiri, nilai ujiannya naik drastis. Fitur Chat Matika-nya membantu banget buat jelasin PR!"
                </p>
                <div>
                   <p className="font-black text-slate-900">Bunda Anisa</p>
                   <p className="text-xs font-bold text-slate-500 uppercase">Orang Tua Murid Kelas 5 SD</p>
                </div>
             </div>

          </div>

          {/* RIGHT COLUMN: STICKY ACTIVATION FORM */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-8 space-y-6">
              
              <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-8 md:p-10 space-y-8 relative overflow-hidden ring-1 ring-slate-900/5">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl text-blue-600 mb-2 shadow-inner">
                    <Lock size={28} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-800">Aktivasi Member</h2>
                  <p className="text-slate-500 text-sm px-2 leading-relaxed">
                    Investasi terbaik untuk masa depan anak. Masukkan kode lisensi untuk memulai.
                  </p>
                </div>

                {/* Status Messages */}
                <div className="space-y-4">
                  {(lic?.isActive && !expired) && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} /> Akun Aktif! Selamat Belajar.
                    </div>
                  )}

                  {expired && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-sm font-bold text-center flex items-center justify-center gap-2">
                      <AlertCircle size={18} /> Masa aktif habis. Perpanjang yuk!
                    </div>
                  )}

                  {msg && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 text-sm font-bold text-center animate-pulse flex items-center justify-center gap-2">
                      <AlertCircle size={18} /> {msg}
                    </div>
                  )}
                </div>

                {/* Form Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kode Lisensi</label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="GPM-XXXX-XXXX-XXXX"
                      className="w-full px-4 py-3.5 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-200 text-base border-slate-100 bg-slate-50 text-center font-mono font-bold text-xl placeholder:text-slate-300 text-slate-700"
                    />
                  </div>

                  <button
                    onClick={submit}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-200 hover:shadow-blue-300 transform transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    🚀 Aktifkan Sekarang
                  </button>
                </div>

                {/* Device ID Info - Updated to User Specification */}
                <div className="rounded-2xl border bg-gray-50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-gray-600">Device ID Anda</div>
                      <div className="text-sm font-mono text-gray-900 break-all mt-1">
                        {deviceId}
                      </div>
                    </div>

                    <button
                      onClick={copyDeviceId}
                      className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white border hover:bg-gray-50 text-sm font-black"
                    >
                      {copied ? "✅ Copied" : "📋 Copy"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                     Kirim ID ini ke admin untuk mendapatkan kode aktivasi.
                  </p>
                </div>

                {/* WhatsApp Button */}
                <button
                  onClick={openWhatsApp}
                  className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all"
                >
                  <MessageCircle size={20} /> Beli Lisensi via WhatsApp
                </button>

                {/* Footer */}
                <div className="text-center pt-2 space-y-1">
                   <div className="flex justify-center items-center gap-2 text-slate-400">
                      <ShieldCheck size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Garansi Kepuasan & Keamanan</span>
                   </div>
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">GassPoll Matika • Made with ❤️ by Kak Mus</p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}