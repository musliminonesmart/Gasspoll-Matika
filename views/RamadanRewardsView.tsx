import React, { useState } from 'react';
import { Badge, StudentProfile, PrintType } from '../types';
import { getLevelByPoints, RAMADAN_LEVELS, getMotivationalMessage } from '../constants';
import { Trophy, Flame, Star, Award, Printer, CheckCircle } from 'lucide-react';
import RamadanGuideModal from '../components/RamadanGuideModal';

interface RamadanRewardsViewProps {
  points: number;
  streak: number;
  bestStreak: number;
  badges: Badge[];
  profile: StudentProfile;
  theme: any;
  onOpenPrint: (type: PrintType, payload?: any) => void;
}

const RamadanRewardsView: React.FC<RamadanRewardsViewProps> = ({ points, streak, bestStreak, badges, profile, theme, onOpenPrint }) => {
  const [showGuide, setShowGuide] = useState(false);
  const currentLevel = getLevelByPoints(points);
  const nextLevel = RAMADAN_LEVELS.find(l => l.id === currentLevel.id + 1);
  const progressToNext = nextLevel ? Math.round(((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100) : 100;

  const handlePrint = () => {
    onOpenPrint('ramadan_rewards', {
      title: "KARTU PRESTASI RAMADAN",
      subtitle: "GassPoll Matika • by Kak Mus",
      student: { name: profile.name || 'Siswa Berprestasi', class: profile.grade, school: profile.school || 'Sekolah Dasar' },
      summary: { points, level: currentLevel.name, streak, bestStreak },
      topBadges: badges.slice(-6),
      motivation: getMotivationalMessage(profile.grade)
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      <div className="flex flex-col items-center text-center gap-2 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold">✨ Papan Prestasi Ramadan</h1>
          <button
            onClick={() => setShowGuide(true)}
            className="px-4 py-2 rounded-full bg-white border shadow-sm text-sm font-semibold hover:bg-gray-50"
          >
            📘 Aturan Main
          </button>
        </div>
        <p className="text-gray-600">
          Lacak perkembangan poin dan badge kebaikanmu di sini!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white rounded-[2.5rem] p-8 border shadow-sm text-center space-y-3 relative overflow-hidden group">
            <div className="absolute inset-0 bg-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 space-y-2">
              <Trophy size={42} className="text-yellow-500 mx-auto" />
              <p className="text-4xl font-black text-gray-800">{points}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Poin</p>
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-8 border shadow-sm text-center space-y-3 relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 space-y-2">
              <Flame size={42} className="text-red-500 mx-auto" />
              <p className="text-4xl font-black text-gray-800">{streak}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Streak Hari Ini</p>
              <p className="text-[8px] text-gray-300 font-bold uppercase">Rekor: {bestStreak}</p>
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-8 border shadow-sm text-center space-y-3 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 space-y-2">
              <Star size={42} className="text-blue-500 mx-auto" />
              <p className="text-xl font-black text-gray-800 leading-tight">{currentLevel.name}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Level Saat Ini</p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] p-8 md:p-12 border shadow-xl space-y-10">
         <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="space-y-4 flex-1 w-full">
               <h3 className="text-xl font-black text-gray-800">Progres Ke Level Selanjutnya</h3>
               <div className="h-6 bg-gray-50 rounded-full border shadow-inner p-1">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${progressToNext}%` }}></div>
               </div>
               <p className="text-sm font-bold text-gray-400 italic">
                  {nextLevel ? `Kurang ${nextLevel.minPoints - points} poin lagi untuk naik ke level ${nextLevel.name}!` : "Luar biasa! Kamu sudah mencapai level tertinggi! 🏆"}
               </p>
            </div>
            <button 
              onClick={handlePrint}
              className="w-full lg:w-auto px-10 py-5 bg-black text-white rounded-[1.5rem] font-black shadow-2xl hover:bg-gray-800 transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
               <Printer size={22} /> Print Kartu Prestasi
            </button>
         </div>

         <div className="space-y-8">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
               <Award className="text-yellow-500" /> Koleksi Badge ({badges.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {badges.length > 0 ? badges.map(badge => (
                 <div key={badge.id} className="p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-yellow-200 hover:bg-white transition-all text-center space-y-2 group shadow-sm hover:shadow-md">
                    <span className="text-5xl group-hover:scale-110 transition-transform block mb-2">{badge.icon}</span>
                    <p className="text-sm font-black text-gray-800">{badge.title}</p>
                    <p className="text-[9px] text-gray-400 font-bold leading-tight line-clamp-2 uppercase">{badge.desc}</p>
                    <div className="pt-2 flex justify-center"><CheckCircle size={14} className="text-green-500" /></div>
                 </div>
               )) : (
                 <div className="col-span-full py-12 text-center text-gray-400 italic font-medium bg-gray-50/50 rounded-[2rem] border-2 border-dashed">
                    "Ayo kerjakan checklist harianmu untuk mendapatkan badge pertama!"
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Reusable Guide Modal Component */}
      <RamadanGuideModal open={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};

export default RamadanRewardsView;