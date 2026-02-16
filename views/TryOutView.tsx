
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Grade, Difficulty, Question, PracticeSession, StudentProfile } from '../types';
import { generateQuestions } from '../services/geminiService';
import { ClipboardList, Clock, AlertCircle, Loader2, ChevronRight, ChevronLeft, Send, CheckCircle2, XCircle, Award, Printer, BookOpen, AlertTriangle } from 'lucide-react';

interface TryOutViewProps {
  grade: Grade;
  profile: StudentProfile;
  onFinish: (session: PracticeSession) => void;
  theme: any;
}

type TryoutStatus = 'intro' | 'in_progress' | 'submitted';

const TryOutView: React.FC<TryOutViewProps> = ({ grade, profile, onFinish, theme }) => {
  const [status, setStatus] = useState<TryoutStatus>('intro');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes default
  const [startTime, setStartTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const startExam = async () => {
    if (!profile.name) {
      alert("Harap isi Nama di menu Profil sebelum memulai Try Out! 😊");
      return;
    }
    
    setLoading(true);
    // Generate 10 exam-level questions
    const qs = await generateQuestions(grade, 'Try Out Campuran TKA', Difficulty.Ujian, 10);
    
    if (qs && qs.length > 0) {
      setQuestions(qs);
      setUserAnswers({});
      setCurrentIdx(0);
      setTimeLeft(25 * 60);
      setStartTime(Date.now());
      setTimerRunning(true);
      setStatus('in_progress');
    } else {
      alert("Gagal mengambil soal. Periksa koneksi internetmu ya!");
    }
    setLoading(false);
  };

  const submitExam = useCallback(() => {
    setTimerRunning(false);
    setShowConfirmSubmit(false);
    
    const results = {
      correct: [] as string[],
      wrong: [] as string[],
      startTime,
      endTime: Date.now()
    };

    questions.forEach(q => {
      const userAns = userAnswers[q.id];
      if (userAns === q.answer) {
        results.correct.push(q.id);
      } else {
        results.wrong.push(q.id);
      }
    });

    const session: PracticeSession = {
      questions,
      currentIdx: questions.length,
      userAnswers,
      results
    };

    // Save result to parent App state so certificate/print can access it
    onFinish(session);
    setStatus('submitted');
  }, [questions, userAnswers, startTime, onFinish]);

  // Timer Effect
  useEffect(() => {
    let timer: any;
    if (timerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerRunning, timeLeft, submitExam]);

  const scoreData = useMemo(() => {
    if (status !== 'submitted') return null;
    const correctCount = questions.filter(q => userAnswers[q.id] === q.answer).length;
    const value = Math.round((correctCount / questions.length) * 100);
    
    let predicate = "Ayo Latihan Lagi";
    if (value >= 90) predicate = "Sangat Baik";
    else if (value >= 75) predicate = "Baik";
    else if (value >= 70) predicate = "Cukup";

    return {
      correct: correctCount,
      wrong: questions.length - correctCount,
      value,
      predicate,
      isQualified: value >= 70
    };
  }, [status, questions, userAnswers]);

  // Helper for Choice selection
  const handleSelectChoice = (letter: string) => {
    const q = questions[currentIdx];
    setUserAnswers(prev => ({
      ...prev,
      [q.id]: letter
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-red-500" size={60} />
        <p className="text-xl font-bold text-gray-600 font-kids">Mempersiapkan Lembar Ujian TKA...</p>
        <p className="text-sm text-gray-400">Menyusun soal pilihan ganda terbaik untukmu.</p>
      </div>
    );
  }

  // SCREEN 1: INTRO
  if (status === 'intro') {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        <div className="text-center space-y-2">
           <h2 className={`text-3xl font-black ${theme.text}`}>Try Out Ujian TKA</h2>
           <p className="text-gray-500">Uji kemampuanmu menghadapi Ujian Sekolah!</p>
        </div>
        
        <div className={`${theme.card} p-10 rounded-[2.5rem] border shadow-xl space-y-8`}>
           <div className="bg-red-50 p-6 rounded-2xl flex items-start gap-4 border border-red-100">
              <AlertCircle className="text-red-500 shrink-0" size={24} />
              <div className="space-y-1">
                 <p className="font-bold text-red-700">Aturan Try Out:</p>
                 <ul className="text-sm text-red-600 space-y-1 list-disc pl-4">
                   <li>Waktu pengerjaan: 25 menit.</li>
                   <li>Format: 10 Soal Pilihan Ganda (A, B, C, D).</li>
                   <li>Nilai minimal Sertifikat: 70.</li>
                   <li>Harap selesaikan semua soal sebelum waktu habis.</li>
                 </ul>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border text-center">
                 <p className="text-xs font-bold text-gray-400 uppercase">Jumlah Soal</p>
                 <p className="text-2xl font-black">10 Soal</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border text-center">
                 <p className="text-xs font-bold text-gray-400 uppercase">Waktu</p>
                 <p className="text-2xl font-black">25 Menit</p>
              </div>
           </div>

           <div className="space-y-4">
              <button 
                onClick={startExam}
                className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-red-600 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Mulai Ujian Sekarang ✍️
              </button>
              
              {/* Debug Info */}
              <div className="text-center text-[10px] text-gray-300 font-mono">
                Status: {status} | Questions: {questions.length} | Timer: {timeLeft}s
              </div>
           </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: IN PROGRESS
  if (status === 'in_progress') {
    const currentQ = questions[currentIdx];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const selected = userAnswers[currentQ.id];
    const isLastQuestion = currentIdx === questions.length - 1;

    return (
      <div className="max-w-4xl mx-auto py-4 space-y-6">
        {/* Exam Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl border shadow-md flex items-center justify-between mb-8 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                 <Clock size={24} />
              </div>
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase">Waktu Tersisa</p>
                 <p className={`text-xl font-black ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                   {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                 </p>
                 <div className="text-[10px] font-bold text-gray-400 tracking-tight">
                    Soal: {currentIdx + 1}/{questions.length} | Terjawab: {Object.keys(userAnswers).length}
                 </div>
              </div>
           </div>

           <div className="hidden md:flex gap-1">
              {questions.map((_, idx) => (
                 <button 
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs border transition-all ${
                    currentIdx === idx ? 'bg-black text-white border-black' : userAnswers[questions[idx].id] ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-300 border-gray-100'
                  }`}
                 >
                   {idx + 1}
                 </button>
              ))}
           </div>

           <button 
             onClick={() => setShowConfirmSubmit(true)}
             className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md active:scale-95"
           >
             <Send size={18} />
             Submit
           </button>
        </div>

        {/* Question Card */}
        <div className={`${theme.card} p-12 rounded-[3rem] border-2 shadow-2xl space-y-10 min-h-[500px] animate-in fade-in zoom-in-95 duration-500`}>
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-red-500 uppercase tracking-widest px-4 py-1 bg-red-50 rounded-full border border-red-100">
                    Soal Nomor {currentIdx + 1}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Topik</p>
                    <p className="text-xs font-bold text-gray-500 uppercase">{currentQ.topic}</p>
                  </div>
               </div>
               <p className="text-3xl font-bold text-gray-800 leading-relaxed font-kids">
                  {currentQ.text}
               </p>
            </div>

            {/* MCQ Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentQ.choices).map(([letter, text]) => (
                <button
                  key={letter}
                  onClick={() => handleSelectChoice(letter)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all font-bold flex gap-4 items-center group ${
                    selected === letter 
                    ? `${theme.primary} text-white border-transparent shadow-lg scale-[1.02]` 
                    : 'bg-gray-50 border-gray-100 hover:border-blue-200 text-gray-700'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    selected === letter ? 'bg-white text-blue-600 border-white' : 'bg-white border-gray-200 text-gray-400 group-hover:border-blue-300'
                  }`}>
                    {letter}
                  </span>
                  <span className="text-base md:text-lg leading-tight">{text}</span>
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-10 border-t border-gray-50">
               <button 
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                className="px-8 py-4 rounded-2xl border-2 font-bold flex items-center gap-2 disabled:opacity-30 hover:bg-gray-50 transition-all active:scale-95"
               >
                  <ChevronLeft size={20} />
                  Kembali
               </button>
               
               {isLastQuestion ? (
                 <button 
                  onClick={() => setShowConfirmSubmit(true)}
                  className={`px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-xl bg-red-500 text-white`}
                 >
                    Selesai & Submit
                    <Send size={20} />
                 </button>
               ) : (
                 <button 
                  onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 ${selected ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                 >
                    Lanjut
                    <ChevronRight size={20} />
                 </button>
               )}
            </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmSubmit && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
                 <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={40} />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-2xl font-black text-gray-800">Yakin Mau Selesai?</h4>
                    <p className="text-gray-500 text-sm">
                       {Object.keys(userAnswers).length < questions.length 
                        ? `Masih ada ${questions.length - Object.keys(userAnswers).length} soal yang belum kamu jawab lho. Yakin mau kirim sekarang? 😊` 
                        : 'Kamu sudah menjawab semua soal! Yakin mau kirim jawabannya?'}
                    </p>
                 </div>
                 <div className="flex flex-col gap-3">
                    <button 
                       onClick={submitExam}
                       className="w-full py-4 bg-red-500 text-white rounded-xl font-black text-lg shadow-lg hover:bg-red-600 transition-all"
                    >
                       Ya, Submit Sekarang!
                    </button>
                    <button 
                       onClick={() => setShowConfirmSubmit(false)}
                       className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                       Lanjut Ngerjain Dulu
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    );
  }

  // SCREEN 3: SUBMITTED / RESULTS
  if (status === 'submitted' && scoreData) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4">
           <div className={`inline-block p-6 rounded-full ${scoreData.isQualified ? 'bg-yellow-100 text-yellow-500' : 'bg-blue-100 text-blue-500'} mb-2`}>
             <Award size={80} />
           </div>
           <h2 className={`text-4xl font-black ${theme.text}`}>Hasil Try Out TKA</h2>
           <p className="text-gray-500 max-w-lg mx-auto">
             Luar biasa {profile.name}! Kamu telah menyelesaikan simulasi ujian dengan penuh semangat.
           </p>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className={`${theme.card} p-8 rounded-3xl border shadow-md text-center bg-blue-50/50`}>
              <p className="text-4xl font-black text-gray-800">{scoreData.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skor Akhir</p>
           </div>
           <div className={`${theme.card} p-8 rounded-3xl border shadow-md text-center bg-green-50/50`}>
              <p className="text-4xl font-black text-green-600">{scoreData.correct}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Benar</p>
           </div>
           <div className={`${theme.card} p-8 rounded-3xl border shadow-md text-center bg-red-50/50`}>
              <p className="text-4xl font-black text-red-500">{scoreData.wrong}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Salah</p>
           </div>
           <div className={`${theme.card} p-8 rounded-3xl border shadow-md text-center bg-purple-50/50`}>
              <p className="text-xl font-black text-gray-800">{scoreData.predicate}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Predikat</p>
           </div>
        </div>

        {/* Qualification Message */}
        {scoreData.isQualified ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
             <div className="flex gap-5 items-center">
                <div className="bg-green-500 text-white w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-lg">
                   <Award size={32} />
                </div>
                <div>
                   <h4 className="text-xl font-black text-green-800">Selamat! Kamu Lulus!</h4>
                   <p className="text-green-700">Sertifikat prestasimu sudah aktif dan siap dicetak.</p>
                </div>
             </div>
             <div className="flex gap-2">
               <button 
                 onClick={() => window.print()}
                 className="bg-white text-green-600 border-2 border-green-200 px-6 py-3 rounded-2xl font-black shadow-sm flex items-center gap-2 hover:bg-green-100 transition-all"
               >
                  <Printer size={20} />
                  Print Sertifikat
               </button>
             </div>
          </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-[2.5rem] p-8 text-center space-y-4">
             <p className="text-blue-800 font-bold text-lg italic">"Sedikit lagi! Nilai kamu sudah bagus, yuk belajar lagi materi yang salah biar dapat skor minimal 70 untuk sertifikat 😊"</p>
             <button onClick={() => setStatus('intro')} className="text-blue-600 font-black underline">Coba Try Out Lagi</button>
          </div>
        )}

        {/* Detailed Question Review */}
        <div className="space-y-6">
           <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <BookOpen className="text-blue-500" /> Analisa Pengerjaan
           </h3>
           <div className="grid grid-cols-1 gap-4">
              {questions.map((q, idx) => {
                 const userAns = userAnswers[q.id];
                 const isCorrect = userAns === q.answer;
                 return (
                    <details key={q.id} className={`group ${theme.card} rounded-[2rem] border overflow-hidden transition-all shadow-sm`}>
                       <summary className={`p-6 cursor-pointer flex items-center justify-between list-none ${isCorrect ? 'bg-green-50/30' : 'bg-red-50/30'}`}>
                          <div className="flex items-center gap-4">
                             <span className={`w-10 h-10 rounded-xl font-black flex items-center justify-center shadow-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {idx + 1}
                             </span>
                             <div>
                                <p className="font-bold text-gray-800 line-clamp-1">{q.text}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{q.topic}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isCorrect ? 'BENAR' : 'SALAH'}
                             </span>
                             <ChevronRight className="text-gray-300 group-open:rotate-90 transition-transform" />
                          </div>
                       </summary>
                       <div className="p-8 border-t bg-white space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 rounded-2xl bg-gray-50 border">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Jawabanmu</p>
                                <p className={`font-black ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>{userAns || 'Kosong'} ({userAns ? q.choices[userAns as keyof typeof q.choices] : '-'})</p>
                             </div>
                             <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                                <p className="text-[10px] font-bold text-green-400 uppercase mb-1">Kunci Jawaban</p>
                                <p className="font-black text-green-700">{q.answer} ({q.choices[q.answer as keyof typeof q.choices]})</p>
                             </div>
                          </div>
                          <div className="space-y-3">
                             <p className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle size={14} /> Pembahasan
                             </p>
                             <div className="prose prose-sm text-gray-600 max-w-none leading-relaxed italic">
                                {q.explanation.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                             </div>
                          </div>
                       </div>
                    </details>
                 );
              })}
           </div>
        </div>

        {/* Final Actions */}
        <div className="flex gap-4 pt-10">
           <button 
             onClick={() => setStatus('intro')}
             className="flex-1 py-5 rounded-2xl border-2 border-gray-200 font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
           >
              Latihan Try Out Lagi
           </button>
           <button 
             onClick={() => window.print()}
             className={`flex-1 py-5 rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-2 ${theme.button}`}
           >
              <Printer size={24} />
              Cetak Raport Lengkap
           </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TryOutView;
