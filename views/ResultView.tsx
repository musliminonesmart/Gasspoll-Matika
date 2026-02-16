
import React from 'react';
import { PracticeSession, StudentProfile, AppState } from '../types';
import { Award, Target, Clock, RefreshCw, ChevronLeft, Printer, Share2 } from 'lucide-react';

interface ResultViewProps {
  session: PracticeSession | null;
  theme: any;
  profile: StudentProfile;
  navigate: (view: AppState['view']) => void;
}

const ResultView: React.FC<ResultViewProps> = ({ session, theme, profile, navigate }) => {
  if (!session) return null;

  const total = session.questions.length;
  const correct = session.results.correct.length;
  const score = Math.round((correct / total) * 100);
  const timeSec = session.results.endTime ? Math.floor((session.results.endTime - session.results.startTime) / 1000) : 0;
  
  const getPredikat = (s: number) => {
    if (s >= 90) return { text: 'Sangat Baik', color: 'text-green-600', bg: 'bg-green-100' };
    if (s >= 75) return { text: 'Baik', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (s >= 60) return { text: 'Cukup', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Perlu Latihan Lagi', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const predikat = getPredikat(score);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
         <div className="inline-block p-4 rounded-full bg-yellow-100 text-yellow-500 mb-2">
           <Award size={64} />
         </div>
         <h2 className={`text-4xl font-black ${theme.text}`}>Hasil Belajarmu!</h2>
         <p className="text-gray-500 max-w-md mx-auto">Selamat {profile.name || 'Siswa Berprestasi'}! Kamu baru saja menyelesaikan sesi belajar matematika.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className={`${theme.card} p-6 rounded-3xl border shadow-sm text-center space-y-2`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
               <Target size={24} />
            </div>
            <p className="text-3xl font-black text-gray-800">{score}</p>
            <p className="text-xs font-bold text-gray-400 uppercase">Skor Akhir</p>
         </div>
         <div className={`${theme.card} p-6 rounded-3xl border shadow-sm text-center space-y-2`}>
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center mx-auto">
               <Award size={24} />
            </div>
            <p className={`text-xl font-black ${predikat.color}`}>{predikat.text}</p>
            <p className="text-xs font-bold text-gray-400 uppercase">Predikat</p>
         </div>
         <div className={`${theme.card} p-6 rounded-3xl border shadow-sm text-center space-y-2`}>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mx-auto">
               <Clock size={24} />
            </div>
            <p className="text-3xl font-black text-gray-800">{Math.floor(timeSec / 60)}m {timeSec % 60}d</p>
            <p className="text-xs font-bold text-gray-400 uppercase">Durasi</p>
         </div>
      </div>

      <div className={`${theme.card} p-8 rounded-[2.5rem] border-2 shadow-sm space-y-6`}>
         <h3 className="text-xl font-bold text-gray-800">Ringkasan Pengerjaan</h3>
         <div className="space-y-3">
            {session.questions.map((q, idx) => {
               const isCorrect = session.results.correct.includes(q.id);
               return (
                  <div key={q.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-white border font-bold flex items-center justify-center text-xs">{idx + 1}</span>
                        <p className="text-sm font-medium text-gray-700 truncate max-w-[200px] md:max-w-md">{q.text}</p>
                     </div>
                     <span className={`font-black uppercase text-[10px] px-3 py-1 rounded-full ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {isCorrect ? 'Benar' : 'Salah'}
                     </span>
                  </div>
               );
            })}
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
         <button 
           onClick={() => navigate('practice')}
           className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
         >
            <RefreshCw size={20} />
            Latihan Lagi
         </button>
         <button 
           onClick={() => navigate('print')}
           className={`flex-1 py-4 px-6 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 ${theme.button}`}
         >
            <Printer size={20} />
            Cetak Hasil
         </button>
         {score >= 70 && (
            <button 
               onClick={() => navigate('certificate')}
               className="flex-1 py-4 px-6 bg-yellow-400 text-white rounded-2xl font-bold shadow-lg hover:bg-yellow-500 flex items-center justify-center gap-2"
            >
               <Award size={20} />
               Lihat Sertifikat
            </button>
         )}
      </div>
    </div>
  );
};

export default ResultView;
