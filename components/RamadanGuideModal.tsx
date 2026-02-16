
import React from "react";
import { X, Star, Flame, Trophy, Award, CheckCircle, Book, Target } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RamadanGuideModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-4 border-white">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b bg-gray-50/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Book size={24} />
             </div>
             <div>
                <h2 className="text-xl font-black text-gray-800">Aturan Main Papan Prestasi</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Panduan Anak & Orang Tua</p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto space-y-8 scroll-smooth">

          {/* ANAK SECTION */}
          <section className="rounded-3xl border-2 border-blue-50 p-6 bg-blue-50/30 space-y-4">
            <h3 className="font-black text-blue-800 text-lg flex items-center gap-2">
               <Star size={20} className="fill-yellow-400 text-yellow-400" /> Versi Anak (Biar Semangat!)
            </h3>
            <p className="text-blue-900 font-medium text-sm">
              Papan Prestasi adalah jurnal kebaikanmu. Kamu bisa pantau:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-2xl flex items-center gap-2 text-xs font-bold text-gray-700 shadow-sm">
                 <Trophy size={14} className="text-yellow-500" /> Total Poin
              </div>
              <div className="p-3 bg-white rounded-2xl flex items-center gap-2 text-xs font-bold text-gray-700 shadow-sm">
                 <Flame size={14} className="text-red-500" /> Streak Harian
              </div>
              <div className="p-3 bg-white rounded-2xl flex items-center gap-2 text-xs font-bold text-gray-700 shadow-sm">
                 <Star size={14} className="text-blue-500" /> Level Juara
              </div>
              <div className="p-3 bg-white rounded-2xl flex items-center gap-2 text-xs font-bold text-gray-700 shadow-sm">
                 <Award size={14} className="text-purple-500" /> Koleksi Badge
              </div>
            </div>
          </section>

          {/* POINTS SYSTEM */}
          <section className="space-y-4">
            <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
               <Target size={20} className="text-green-500" /> Cara Mendapatkan Poin
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <span className="font-bold text-gray-700 text-sm">Checklist <b className="text-purple-600">WAJIB</b> Selesai</span>
                 <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-black text-xs">+20 Poin</span>
              </li>
              <li className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <span className="font-bold text-gray-700 text-sm">Target <b className="text-blue-600">TAMBAHAN</b> Selesai</span>
                 <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-black text-xs">+10 Poin</span>
              </li>
              <li className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                 <span className="font-bold text-green-800 text-sm">Semua Kegiatan 100% Selesai</span>
                 <span className="bg-green-500 text-white px-3 py-1 rounded-lg font-black text-xs">Bonus +30</span>
              </li>
              <li className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                 <span className="font-bold text-red-800 text-sm">Konsisten 3 Hari (Streak)</span>
                 <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-black text-xs">Bonus +25</span>
              </li>
            </ul>
          </section>

          {/* STREAK & LEVEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-2">
              <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest flex items-center gap-2">
                 <Flame size={16} className="text-red-500" /> Apa itu Streak?
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                <b>Streak</b> bertambah jika kamu menyelesaikan minimal <b>70% kegiatan wajib</b>. Kalau kurang, streak akan kembali ke <b>0</b>. Jangan menyerah ya!
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest flex items-center gap-2">
                 <Trophy size={16} className="text-yellow-500" /> Sistem Level
              </h3>
              <ul className="text-xs space-y-1 font-bold">
                <li className="flex justify-between"><span className="text-green-500">0–150</span> <span>Pemula</span></li>
                <li className="flex justify-between"><span className="text-blue-500">151–300</span> <span>Pejuang</span></li>
                <li className="flex justify-between"><span className="text-purple-500">301–500</span> <span>Bintang</span></li>
                <li className="flex justify-between"><span className="text-yellow-500">501+</span> <span>Juara</span></li>
              </ul>
            </section>
          </div>

          {/* PARENT SECTION */}
          <section className="rounded-3xl border-2 border-dashed border-gray-200 p-6 bg-gray-50/50 space-y-3">
            <h3 className="font-black text-gray-800 text-base flex items-center gap-2">
               <CheckCircle size={18} className="text-gray-400" /> Untuk Orang Tua
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed italic">
              "Sistem ini dirancang untuk membangun kebiasaan baik (habit building) secara positif. Gunakan poin sebagai apresiasi, bukan alat tekanan."
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            Siap, Ayo GassPoll! ✨
          </button>
        </div>
      </div>
    </div>
  );
}
