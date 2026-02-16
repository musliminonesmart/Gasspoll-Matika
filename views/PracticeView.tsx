
import React, { useState, useEffect } from 'react';
import { Grade, Difficulty, Question, PracticeSession } from '../types';
import { generateQuestions } from '../services/geminiService';
import { HelpCircle, ChevronRight, CheckCircle2, XCircle, Loader2, Sparkles, Lightbulb, PenTool, Timer } from 'lucide-react';

interface PracticeViewProps {
  grade: Grade;
  onFinish: (session: PracticeSession) => void;
  theme: any;
}

const PracticeView: React.FC<PracticeViewProps> = ({ grade, onFinish, theme }) => {
  const [config, setConfig] = useState({
    topic: 'Semua Topik',
    difficulty: Difficulty.Santai,
    count: 5,
    timer: true
  });
  
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState<{correct: string[], wrong: string[]}>({ correct: [], wrong: [] });

  const startPractice = async () => {
    setLoading(true);
    const qs = await generateQuestions(grade, config.topic, config.difficulty, config.count);
    if (qs.length > 0) {
      setQuestions(qs);
      setStartTime(Date.now());
      setCurrentIdx(0);
      setResults({ correct: [], wrong: [] });
    }
    setLoading(false);
  };

  const handleCheck = () => {
    if (!selectedLetter) return;
    const q = questions[currentIdx];
    const correct = selectedLetter === q.answer;
    setIsCorrect(correct);
    setChecked(true);

    if (correct) {
      setResults(prev => ({ ...prev, correct: [...prev.correct, q.id] }));
    } else {
      setResults(prev => ({ ...prev, wrong: [...prev.wrong, q.id] }));
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedLetter(null);
      setChecked(false);
      setHintsUsed(0);
    } else {
      onFinish({
        questions,
        currentIdx: questions.length,
        userAnswers: {}, // simplified
        results: {
          ...results,
          startTime,
          endTime: Date.now()
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-blue-500" size={60} />
        <p className="text-xl font-bold text-gray-600">Menyiapkan tantangan pilihan ganda untukmu...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6">
        <div className="text-center space-y-2">
           <h2 className={`text-3xl font-black ${theme.text}`}>Latihan Pilihan Ganda</h2>
           <p className="text-gray-500">Pilih jawaban yang paling tepat dan raih skor tertinggi!</p>
        </div>
        
        <div className={`${theme.card} p-8 rounded-3xl border shadow-lg space-y-6`}>
           <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Pilih Tingkat Kesulitan</label>
                <div className="grid grid-cols-3 gap-2">
                  {[Difficulty.Santai, Difficulty.Serius, Difficulty.Ujian].map(d => (
                    <button 
                      key={d}
                      onClick={() => setConfig({...config, difficulty: d})}
                      className={`py-3 rounded-xl font-bold text-sm transition-all ${config.difficulty === d ? theme.button : 'bg-gray-100 text-gray-500'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Jumlah Soal</label>
                  <select 
                    value={config.count}
                    onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  >
                    <option value={5}>5 Soal</option>
                    <option value={10}>10 Soal</option>
                    <option value={15}>15 Soal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Mode Waktu</label>
                  <button 
                    onClick={() => setConfig({...config, timer: !config.timer})}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${config.timer ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
                  >
                    <Timer size={16} />
                    {config.timer ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
           </div>

           <button 
            onClick={startPractice}
            className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${theme.button}`}
           >
             Mulai Latihan 🚀
           </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="flex justify-between items-center px-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase">Progres Latihan</p>
          <p className={`font-black ${theme.text}`}>Soal {currentIdx + 1} dari {questions.length}</p>
        </div>
        <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`${theme.primary} h-full transition-all duration-500`}
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className={`${theme.card} p-10 rounded-[2.5rem] border-2 shadow-xl relative overflow-hidden`}>
        <div className="space-y-8 relative z-10">
          <div className="flex justify-between items-start">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
              {currentQ.topic}
            </div>
            {config.timer && (
              <div className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                <Timer size={14} />
                <span>Timer Aktif</span>
              </div>
            )}
          </div>
          
          <p className="text-2xl font-bold text-gray-800 leading-relaxed font-kids">
            {currentQ.text}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(currentQ.choices).map(([letter, text]) => {
              const isSelected = selectedLetter === letter;
              let btnClass = "p-5 rounded-2xl border-2 text-left transition-all font-bold flex gap-4 items-center ";
              
              if (!checked) {
                btnClass += isSelected ? `${theme.primary} text-white border-transparent scale-102` : "bg-gray-50 border-gray-100 hover:border-blue-200 text-gray-700";
              } else {
                if (letter === currentQ.answer) {
                  btnClass += "bg-green-100 border-green-500 text-green-700";
                } else if (isSelected && letter !== currentQ.answer) {
                  btnClass += "bg-red-100 border-red-500 text-red-700 opacity-60";
                } else {
                  btnClass += "bg-gray-50 border-gray-100 text-gray-400 opacity-40";
                }
              }

              return (
                <button
                  key={letter}
                  disabled={checked}
                  onClick={() => setSelectedLetter(letter)}
                  className={btnClass}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${isSelected ? 'bg-white text-blue-600 border-white' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                    {letter}
                  </span>
                  <span className="text-sm md:text-base leading-tight">{text}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {!checked ? (
              <div className="flex gap-3">
                <button 
                  onClick={handleCheck}
                  disabled={!selectedLetter}
                  className={`flex-1 py-4 rounded-2xl font-black text-lg shadow-md transition-all active:scale-95 disabled:opacity-50 ${theme.button}`}
                >
                  Cek Jawaban
                </button>
                <button 
                  onClick={() => setHintsUsed(prev => Math.min(prev + 1, currentQ.hint.length))}
                  className="px-6 rounded-2xl border-2 border-yellow-200 text-yellow-600 hover:bg-yellow-50 font-bold flex items-center gap-2"
                >
                  <Lightbulb size={20} />
                  Hint
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className={`p-6 rounded-2xl flex items-center gap-4 ${isCorrect ? 'bg-green-100 text-green-700 border-2 border-green-200 shadow-sm' : 'bg-red-50 text-red-700 border-2 border-red-100 shadow-sm'}`}>
                   {isCorrect ? <CheckCircle2 size={40} className="text-green-500" /> : <XCircle size={40} className="text-red-400" />}
                   <div>
                      <p className="text-xl font-black">{isCorrect ? 'Mantap! Jawabanmu Benar!' : 'Gapapa, kita coba pelan-pelan ya 😊'}</p>
                      <p className="text-sm opacity-80">{isCorrect ? 'Kamu memang jago matematika. Yuk lanjut!' : 'Pahami pembahasannya agar nanti tidak salah lagi.'}</p>
                   </div>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 space-y-4 shadow-sm">
                  <h4 className="font-bold text-gray-400 text-xs uppercase flex items-center gap-2 tracking-widest">
                    <HelpCircle size={14} /> Pembahasan Ramah Anak
                  </h4>
                  <div className="prose prose-sm text-gray-700 max-w-none prose-p:leading-relaxed">
                    {currentQ.explanation.split('\n').map((line, i) => (
                      <p key={i} className={line.includes(':') ? 'font-medium text-gray-900 mt-2' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={nextQuestion}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {currentIdx + 1 === questions.length ? 'Lihat Skor Akhir' : 'Soal Selanjutnya'}
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {hintsUsed > 0 && !checked && (
          <div className="mt-8 p-6 bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl space-y-3 animate-in fade-in zoom-in duration-300">
             <p className="text-xs font-black text-yellow-600 uppercase flex items-center gap-2">
               <Sparkles size={14} /> Bantuan Hint ({hintsUsed}/{currentQ.hint.length})
             </p>
             <ul className="space-y-2">
               {currentQ.hint.slice(0, hintsUsed).map((h, i) => (
                 <li key={i} className="text-sm text-yellow-800 font-medium flex gap-2">
                   <span className="shrink-0">•</span> {h}
                 </li>
               ))}
             </ul>
          </div>
        )}

        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
          <PenTool size={200} />
        </div>
      </div>
    </div>
  );
};

export default PracticeView;
