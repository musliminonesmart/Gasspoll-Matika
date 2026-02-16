
import React, { useMemo } from 'react';
import { PracticeSession, StudentProfile, Grade } from '../types';
import { Printer, Award, ShieldCheck, Star, QrCode, CheckCircle2 } from 'lucide-react';

interface CertificateViewProps {
  session?: PracticeSession;
  theme: any;
  profile: StudentProfile;
}

const CertificateView: React.FC<CertificateViewProps> = ({ session, theme, profile }) => {
  const certId = useMemo(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 899999);
    return `GP-TKA-${year}-${profile.grade}-${rand}`;
  }, [profile.grade]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="p-6 rounded-full bg-gray-100 text-gray-400">
          <Award size={64} />
        </div>
        <h2 className="text-2xl font-black text-gray-600">Sertifikat Belum Tersedia</h2>
        <p className="text-gray-500 max-w-sm">Selesaikan Try Out TKA untuk mendapatkan sertifikat prestasimu!</p>
      </div>
    );
  }

  const score = Math.round((session.results.correct.length / session.questions.length) * 100);
  
  const achievement = useMemo(() => {
    if (score >= 90) return { title: 'MASTER MATEMATIKA', stars: 5, color: 'text-yellow-600' };
    if (score >= 80) return { title: 'SANGAT MEMUASKAN', stars: 4, color: 'text-blue-600' };
    if (score >= 70) return { title: 'SANGAT BAIK', stars: 3, color: 'text-green-600' };
    if (score >= 60) return { title: 'BAIK', stars: 2, color: 'text-orange-600' };
    return { title: 'PEJUANG HEBAT', stars: 1, color: 'text-red-500' };
  }, [score]);

  const motivation = useMemo(() => {
    if (profile.grade === Grade.K4) return "Hebat sekali! Terus semangat belajar ya! 😊";
    if (profile.grade === Grade.K5) return "Kamu semakin berkembang! Pertahankan semangatmu! ✨";
    return "Kamu siap melangkah ke jenjang berikutnya. Terus asah kemampuanmu! 🚀";
  }, [profile.grade]);

  // Theme based on grade
  const certTheme = useMemo(() => {
    if (profile.grade === Grade.K4) return { border: 'border-[#769F76]', accent: 'text-[#769F76]', bg: 'bg-[#F0F4F0]' };
    if (profile.grade === Grade.K5) return { border: 'border-[#C5A059]', accent: 'text-[#C5A059]', bg: 'bg-white' };
    return { border: 'border-[#1e3a8a]', accent: 'text-[#1e3a8a]', bg: 'bg-gray-50' };
  }, [profile.grade]);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center no-print px-4">
        <div>
           <h2 className={`text-3xl font-black ${theme.text}`}>Sertifikat Juara TKA</h2>
           <p className="text-gray-500 text-sm">Pratinjau sertifikat resmi kelulusan Try Out.</p>
        </div>
        <button 
           onClick={() => window.print()}
           className={`bg-yellow-400 text-white px-8 py-3 rounded-xl font-black shadow-lg hover:bg-yellow-500 flex items-center gap-2 transition-all transform active:scale-95`}
        >
          <Printer size={20} /> Print Sertifikat (A4)
        </button>
      </div>

      {/* Certificate UI Container (Landscape) */}
      <div className="relative bg-white aspect-[1.414/1] w-full border-[12px] md:border-[20px] border-[#769F76] p-2 md:p-4 shadow-2xl rounded-sm overflow-hidden flex items-center justify-center">
        {/* Secondary Inner Border */}
        <div className={`h-full w-full border-2 md:border-4 ${certTheme.border} p-6 md:p-12 flex flex-col items-center justify-between text-center relative bg-white`}>
          
          {/* Top Header Section */}
          <div className="space-y-2 md:space-y-4 relative z-10 w-full">
            <div className="flex justify-center mb-2">
               <ShieldCheck size={60} className={certTheme.accent} />
            </div>
            <h1 className="text-2xl md:text-5xl font-black uppercase tracking-[0.2em] text-gray-800 font-serif">Sertifikat Prestasi</h1>
            <p className="text-sm md:text-xl font-bold italic text-gray-500 tracking-wider">Diberikan kepada siswa berprestasi:</p>
          </div>

          {/* Student Identity */}
          <div className="space-y-2 md:space-y-4 relative z-10">
            <h2 className={`text-4xl md:text-7xl font-black ${certTheme.accent} font-kids drop-shadow-sm`}>{profile.name || 'Siswa Berprestasi'}</h2>
            <div className={`h-1 w-full max-w-lg mx-auto ${certTheme.bg.replace('bg-', 'bg-opacity-50 bg-')}`}></div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-gray-700 font-bold uppercase tracking-widest text-xs md:text-base">
               <span>Kelas {profile.grade}</span>
               <span className="hidden md:inline">•</span>
               <span>{profile.school || 'Sekolah Dasar'}</span>
            </div>
          </div>

          {/* Achievement Level & Score */}
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col items-center gap-2">
               <div className="flex gap-1">
                 {Array.from({ length: 5 }).map((_, i) => (
                   <Star key={i} size={24} className={i < achievement.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                 ))}
               </div>
               <p className={`text-xl md:text-3xl font-black tracking-widest ${achievement.color}`}>{achievement.title}</p>
            </div>
            <p className="text-xs md:text-lg text-gray-600 max-w-2xl leading-relaxed">
              Telah menyelesaikan simulasi <b>Ujian TKA Matematika</b> dengan skor <b>{score}/100</b>.<br/>
              Akurasi: {score}%, Benar: {session.results.correct.length}, Salah: {session.results.wrong.length}.
            </p>
            <p className="text-sm md:text-xl font-bold italic text-blue-600">{motivation}</p>
          </div>

          {/* Footer with Signatures and QR */}
          <div className="w-full flex justify-between items-end relative z-10 px-4 md:px-10">
            <div className="text-left space-y-1 md:space-y-2">
               <p className="text-[8px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Diterbitkan Pada</p>
               <p className="font-bold text-xs md:text-lg text-gray-800">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
               <p className="text-[8px] md:text-xs text-gray-400 font-mono tracking-tighter">REF ID: {certId}</p>
            </div>

            <div className="flex flex-col items-center">
               <div className={`h-12 md:h-20 w-32 md:w-56 border-b-2 ${certTheme.border} flex items-center justify-center italic text-lg md:text-3xl font-kids text-gray-700 opacity-90`}>
                  Kak Chat Matika
               </div>
               <p className="text-[8px] md:text-xs font-black mt-2 text-gray-500 tracking-[0.3em] uppercase">Konsultan Matematika SD</p>
            </div>

            <div className="flex flex-col items-center gap-1 md:gap-2">
               <div className="p-1 md:p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                 {/* Fixed: Removed non-existent md:size prop and used responsive Tailwind classes instead */}
                 <QrCode className="w-10 h-10 md:w-20 md:h-20 text-gray-800" />
               </div>
               <p className="text-[6px] md:text-[8px] font-bold text-gray-400 text-center uppercase leading-tight">
                 Scan untuk<br/>Verifikasi Resmi
               </p>
            </div>
          </div>

          {/* Background Ornaments */}
          <div className={`absolute top-0 right-0 p-4 opacity-[0.03] ${certTheme.accent}`}>
             <Award size={300} />
          </div>
          <div className={`absolute -bottom-20 -left-20 p-4 opacity-[0.05] ${certTheme.accent}`}>
             <Star size={400} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
