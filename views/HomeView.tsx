
import React from 'react';
import { AppState } from '../types';
import { BookOpen, PenTool, ClipboardList, Printer, Award, Moon, Sparkles } from 'lucide-react';

interface HomeViewProps {
  navigate: (view: AppState['view']) => void;
  theme: any;
  profile: any;
}

const HomeView: React.FC<HomeViewProps> = ({ navigate, theme, profile }) => {
  const cards = [
    { id: 'material', title: 'Materi & Rumus Praktis', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Ringkasan materi & cara cepat.' },
    { id: 'practice', title: 'Latihan Interaktif', icon: PenTool, color: 'text-green-500', bg: 'bg-green-50', desc: 'Kerjakan soal dengan bantuan hint.' },
    { id: 'tryout', title: 'Try Out Ujian', icon: ClipboardList, color: 'text-red-500', bg: 'bg-red-50', desc: 'Uji kemampuanmu dengan timer.' },
    { id: 'print', title: 'Print Center', icon: Printer, color: 'text-orange-500', bg: 'bg-orange-50', desc: 'Cetak hasil belajar & sertifikat.' },
    { id: 'certificate', title: 'Sertifikat', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-50', desc: 'Lihat koleksi sertifikatmu.' },
    { id: 'ramadan', title: 'To-Do Ramadan', icon: Moon, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Pantau progres ibadah harianmu.' },
  ];

  return (
    <div className="space-y-8 py-4">
      <section className={`${theme.primary} rounded-3xl p-8 text-white relative overflow-hidden shadow-lg`}>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-black font-kids">Ayo GasPoll Matematika! 🚀</h1>
          <p className="text-white/80 max-w-lg">
            Matematika itu asik kok! Pilih menu di bawah untuk mulai belajar dengan cara yang praktis dan menyenangkan.
          </p>
          <div className="pt-4">
             <button 
                onClick={() => navigate('practice')}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
             >
               <Sparkles size={18} />
               Mulai Latihan Sekarang
             </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Sparkles size={160} />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => navigate(card.id as any)}
            className={`${theme.card} group p-6 rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col gap-4`}
          >
            <div className={`${card.bg} ${card.color} w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <card.icon size={28} />
            </div>
            <div>
              <h3 className={`text-xl font-bold mb-1 ${theme.text}`}>{card.title}</h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </div>
          </button>
        ))}
      </section>

      {!profile.name && (
        <section className="bg-yellow-100 border-2 border-dashed border-yellow-300 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="bg-yellow-400 text-white w-12 h-12 rounded-full flex items-center justify-center shrink-0">
               <Award size={24} />
            </div>
            <p className="text-yellow-800 font-medium">Lengkapi profilmu agar namamu muncul di sertifikat nanti!</p>
          </div>
          <button 
            onClick={() => navigate('profile')}
            className="bg-yellow-400 text-white px-6 py-2 rounded-xl font-bold hover:bg-yellow-500 shrink-0"
          >
            Lengkapi Profil
          </button>
        </section>
      )}
    </div>
  );
};

export default HomeView;
