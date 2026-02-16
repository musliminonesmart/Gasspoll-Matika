
import React, { useState, useMemo } from 'react';
// Added Grade to the imports from types.ts
import { TkaAnalysisData, StudentProfile, Question, Grade } from '../types';
import { TKA_ANSWER_KEY, TKA_QUESTION_META, FORMULAS } from '../constants';
import { generateTkaExplanation, generateRemedialQuestions } from '../services/geminiService';
import { BarChart3, Target, Clock, AlertCircle, Book, Printer, Award, HelpCircle, Loader2, RefreshCw, ChevronDown, CheckCircle, XCircle } from 'lucide-react';

interface TkaAnalysisViewProps {
  theme: any;
  profile: StudentProfile;
  tkaData?: TkaAnalysisData;
  onDataUpdate: (data: TkaAnalysisData) => void;
}

const TkaAnalysisView: React.FC<TkaAnalysisViewProps> = ({ theme, profile, tkaData, onDataUpdate }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [loadingExpl, setLoadingExpl] = useState(false);
  const [remedialMode, setRemedialMode] = useState(false);
  const [remedialQuestions, setRemedialQuestions] = useState<Question[]>([]);
  const [loadingRemedial, setLoadingRemedial] = useState(false);

  // Simulation mode for TKA input if no data exists
  const [tempAnswers, setTempAnswers] = useState<Record<number, string>>(tkaData?.userAnswers || {});

  const stats = useMemo(() => {
    if (!tempAnswers || Object.keys(tempAnswers).length === 0) return null;
    
    let correct = 0;
    const topicStats: Record<string, { correct: number, total: number }> = {};

    // Fixed 'unknown' type error by explicitly typing the entry callback
    Object.entries(TKA_QUESTION_META).forEach(([no, m]) => {
      const meta = m as { topic: string; sub: string };
      const n = parseInt(no);
      if (!topicStats[meta.topic]) topicStats[meta.topic] = { correct: 0, total: 0 };
      topicStats[meta.topic].total++;

      if (tempAnswers[n] === TKA_ANSWER_KEY[n]) {
        correct++;
        topicStats[meta.topic].correct++;
      }
    });

    const accuracy = Math.round((correct / 40) * 100);
    const sortedTopics = Object.entries(topicStats).sort((a, b) => 
      (a[1].correct / a[1].total) - (b[1].correct / b[1].total)
    );

    return { correct, accuracy, topicStats, weakTopic: sortedTopics[0] };
  }, [tempAnswers]);

  const handleInputSubmit = () => {
    onDataUpdate({
      userAnswers: tempAnswers,
      startTime: Date.now() - 3600000, // Simulated 1hr ago
      endTime: Date.now()
    });
  };

  const handleViewExplanation = async (qNo: number) => {
    setSelectedQuestion(qNo);
    setLoadingExpl(true);
    const meta = TKA_QUESTION_META[qNo];
    const expl = await generateTkaExplanation(qNo, meta.topic, meta.sub, tempAnswers[qNo] || "Kosong", TKA_ANSWER_KEY[qNo]);
    setExplanation(expl);
    setLoadingExpl(false);
  };

  const handleStartRemedial = async (topic: string) => {
    setLoadingRemedial(true);
    setRemedialMode(true);
    const qs = await generateRemedialQuestions(topic, 10);
    setRemedialQuestions(qs);
    setLoadingRemedial(false);
  };

  if (!tkaData && !stats) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-8">
        <div className="text-center space-y-2">
           <h2 className={`text-3xl font-black ${theme.text}`}>Analisa TKA Kelas 6</h2>
           <p className="text-gray-500">Masukkan jawaban simulasi atau hasil Try Out mandirimu.</p>
        </div>
        <div className={`${theme.card} p-8 rounded-[2.5rem] border-2 shadow-sm space-y-6`}>
           <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
             {Array.from({ length: 40 }).map((_, i) => (
               <div key={i+1} className="space-y-1">
                 <p className="text-[10px] text-center font-bold text-gray-400">{i+1}</p>
                 <select 
                   value={tempAnswers[i+1] || ""}
                   onChange={(e) => setTempAnswers({ ...tempAnswers, [i+1]: e.target.value })}
                   className="w-full text-center py-1 bg-gray-50 border rounded-lg font-bold outline-none focus:border-blue-400"
                 >
                   <option value="">-</option>
                   <option value="A">A</option>
                   <option value="B">B</option>
                   <option value="C">C</option>
                   <option value="D">D</option>
                 </select>
               </div>
             ))}
           </div>
           <button 
             onClick={handleInputSubmit}
             className={`w-full py-4 rounded-xl font-black text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${theme.button}`}
           >
             Mulai Analisa Sekarang! 📊
           </button>
        </div>
      </div>
    );
  }

  if (remedialMode) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8">
        <button onClick={() => setRemedialMode(false)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600">
           <RefreshCw size={16} /> Kembali ke Analisa
        </button>
        <div className="text-center space-y-2">
           <h2 className="text-3xl font-black text-blue-600">Remedial Juara 🚀</h2>
           <p className="text-gray-500">Fokus Topik: <span className="font-bold text-gray-800">{stats?.weakTopic[0]}</span></p>
        </div>
        {loadingRemedial ? (
          <div className="flex flex-col items-center py-20 space-y-4">
             <Loader2 className="animate-spin text-blue-500" size={48} />
             <p className="font-bold text-gray-600">Menyusun 10 soal latihan khusus untukmu...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {remedialQuestions.map((q, i) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                 <p className="font-bold text-gray-800 font-kids">{i+1}. {q.text}</p>
                 <details className="group">
                    <summary className="cursor-pointer text-xs font-bold text-blue-500 uppercase list-none">Klik Lihat Kunci</summary>
                    <p className="mt-2 text-sm font-black text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">Jawaban: {q.answer}</p>
                 </details>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* 1. Score Summary Card */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
         <div className={`${theme.card} p-6 rounded-3xl border shadow-sm text-center bg-blue-50/30`}>
            <Target className="mx-auto text-blue-500 mb-2" size={32} />
            <p className="text-3xl font-black text-gray-800">{stats?.accuracy}%</p>
            <p className="text-xs font-bold text-gray-400 uppercase">Akurasi Total</p>
         </div>
         <div className={`${theme.card} p-6 rounded-3xl border shadow-sm text-center bg-green-50/30`}>
            <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-3xl font-black text-gray-800">{stats?.correct} / 40</p>
            <p className="text-xs font-bold text-gray-400 uppercase">Jawaban Benar</p>
         </div>
         <div className={`${theme.card} p-6 rounded-3xl border shadow-sm text-center bg-red-50/30`}>
            <XCircle className="mx-auto text-red-500 mb-2" size={32} />
            <p className="text-3xl font-black text-gray-800">{40 - (stats?.correct || 0)}</p>
            <p className="text-xs font-bold text-gray-400 uppercase">Salah / Kosong</p>
         </div>
         <div className={`${theme.card} p-6 rounded-3xl border shadow-sm text-center bg-purple-50/30`}>
            <Clock className="mx-auto text-purple-500 mb-2" size={32} />
            <p className="text-3xl font-black text-gray-800">1 Jam</p>
            <p className="text-xs font-bold text-gray-400 uppercase">Durasi Try Out</p>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* 2. Topic Breakdown */}
         <div className="lg:col-span-5 space-y-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
               <BarChart3 className="text-blue-500" /> Analisa per Topik
            </h3>
            <div className={`${theme.card} p-6 rounded-[2.5rem] border shadow-sm space-y-4`}>
               {Object.entries(stats?.topicStats || {}).map(([name, s]: any) => {
                  const perc = Math.round((s.correct / s.total) * 100);
                  return (
                    <div key={name} className="space-y-1">
                       <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-600">{name}</span>
                          <span className={perc >= 80 ? 'text-green-600' : perc >= 60 ? 'text-yellow-600' : 'text-red-500'}>
                            {s.correct}/{s.total} ({perc}%)
                          </span>
                       </div>
                       <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${perc >= 80 ? 'bg-green-500' : perc >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${perc}%` }}></div>
                       </div>
                    </div>
                  );
               })}
            </div>

            {/* 4. Rekomendasi Otomatis */}
            <div className="bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-[2.5rem] p-8 space-y-6">
               <div className="flex items-center gap-3">
                  <AlertCircle size={32} className="text-yellow-600" />
                  <div>
                    <h4 className="font-black text-yellow-800">Fokus Belajar Minggu Ini</h4>
                    <p className="text-xs text-yellow-700">Topik terlemahmu: <span className="font-bold">{stats?.weakTopic[0]}</span></p>
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-xs font-bold text-yellow-600 uppercase">Ingat Rumus Ini:</p>
                  {/* Fixed missing Grade import by importing it from types.ts above */}
                  {FORMULAS[Grade.K6].slice(0, 3).map((f, i) => (
                    <div key={i} className="text-sm bg-white p-3 rounded-xl border border-yellow-100 shadow-sm">
                       <p className="font-bold">{f.topic}</p>
                       <p className="font-mono text-blue-600">{f.formula}</p>
                    </div>
                  ))}
               </div>
               <button 
                 onClick={() => handleStartRemedial(stats?.weakTopic[0] || "")}
                 className="w-full py-3 bg-yellow-400 text-white rounded-xl font-black shadow-md hover:bg-yellow-500 flex items-center justify-center gap-2"
               >
                  Ambil Remedial 10 Soal
               </button>
            </div>
         </div>

         {/* 3. Question Review List */}
         <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Book className="text-green-500" /> Review Lembar Jawaban
               </h3>
               <div className="flex gap-2 no-print">
                  <button onClick={() => window.print()} className="p-2 bg-white border rounded-lg text-gray-500 hover:text-gray-800 shadow-sm"><Printer size={20} /></button>
                  <button onClick={() => alert("Generate Sertifikat Berhasil!")} className="p-2 bg-white border rounded-lg text-yellow-500 shadow-sm"><Award size={20} /></button>
               </div>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
               {Array.from({ length: 40 }).map((_, i) => {
                  const n = i + 1;
                  const isCorrect = tempAnswers[n] === TKA_ANSWER_KEY[n];
                  return (
                    <button 
                      key={n}
                      onClick={() => handleViewExplanation(n)}
                      className={`p-3 rounded-2xl border transition-all text-center relative group ${
                        isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-100 text-red-600'
                      }`}
                    >
                       <span className="text-xs font-bold opacity-40 absolute top-1 left-2">{n}</span>
                       <span className="text-xl font-black">{tempAnswers[n] || '-'}</span>
                       <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-[8px] font-bold text-gray-600">BAHAS</div>
                    </button>
                  );
               })}
            </div>

            {/* Explanation Modal-like Panel */}
            {selectedQuestion && (
              <div className="bg-white rounded-[2.5rem] border-2 shadow-xl p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                 <div className="flex justify-between items-center border-b pb-4">
                    <div>
                       <h4 className="text-xl font-black text-gray-800">Pembahasan Soal #{selectedQuestion}</h4>
                       <p className="text-xs font-bold text-gray-400 uppercase">{TKA_QUESTION_META[selectedQuestion].topic}</p>
                    </div>
                    <button onClick={() => setSelectedQuestion(null)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronDown size={24} /></button>
                 </div>
                 
                 {loadingExpl ? (
                    <div className="py-10 flex flex-col items-center gap-3">
                       <Loader2 className="animate-spin text-blue-500" />
                       <p className="text-sm font-bold text-gray-400">Guru Gemini sedang menulis pembahasan...</p>
                    </div>
                 ) : (
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed text-gray-700">
                       {explanation.split('\n').map((line, idx) => {
                         if (line.match(/^\d\)/)) return <p key={idx} className="font-bold text-blue-800 mt-4 mb-2">{line}</p>;
                         return <p key={idx}>{line}</p>;
                       })}
                    </div>
                 )}
              </div>
            )}
         </div>
      </div>

      {/* 5. Print Output Ready Section */}
      <div className="print-only mt-10 space-y-10">
         <div className="text-center space-y-2 border-b-2 pb-6">
            <h1 className="text-4xl font-black uppercase tracking-widest">Raport Try Out Matika</h1>
            <p className="text-xl font-bold">Grade 6 - Sekolah: {profile.school}</p>
            <div className="flex justify-center gap-8 text-sm mt-4">
               <span>Nama: <b>{profile.name}</b></span>
               <span>Skor: <b>{stats?.accuracy}/100</b></span>
               <span>Tgl: <b>{new Date().toLocaleDateString()}</b></span>
            </div>
         </div>
         <div className="grid grid-cols-2 gap-10">
            <div>
               <h3 className="font-bold border-b mb-4">Breakdown Topik</h3>
               {Object.entries(stats?.topicStats || {}).map(([name, s]: any) => (
                 <div key={name} className="flex justify-between text-sm py-1 border-b border-gray-100">
                    <span>{name}</span>
                    <span>{s.correct}/{s.total}</span>
                 </div>
               ))}
            </div>
            <div>
               <h3 className="font-bold border-b mb-4">Daftar Salah/Kosong</h3>
               <div className="grid grid-cols-5 gap-2">
                 {Array.from({ length: 40 }).map((_, i) => (
                   tempAnswers[i+1] !== TKA_ANSWER_KEY[i+1] && <span key={i} className="text-xs bg-red-100 px-2 py-1 rounded">No {i+1}</span>
                 ))}
               </div>
            </div>
         </div>
         <div className="p-8 border-4 border-dashed rounded-3xl text-center italic text-gray-400">
            "Terus belajar, jangan menyerah! Kesalahan adalah bukti kamu sedang mencoba."
         </div>
      </div>
    </div>
  );
};

export default TkaAnalysisView;
