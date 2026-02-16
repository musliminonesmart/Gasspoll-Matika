
import React, { useState, useEffect } from 'react';
import { Grade, PrintType } from '../types';
import { CURRICULUM } from '../constants';
import { generateTopicMaterial, generateSubtopicMaterial } from '../services/geminiService';
import { Book, ChevronRight, Printer, Star, Loader2, Sparkles, AlertCircle, ArrowLeft, GraduationCap } from 'lucide-react';

interface MaterialViewProps {
  grade: Grade;
  theme: any;
  profile: any;
  onOpenPrint: (type: PrintType, payload?: any) => void;
}

const MaterialView: React.FC<MaterialViewProps> = ({ grade: initialGrade, theme, profile, onOpenPrint }) => {
  const [selectedClass, setSelectedClass] = useState<Grade>(initialGrade);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | null>(null);
  const [topicContentCache, setTopicContentCache] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topics = CURRICULUM[selectedClass] || [];

  const handleTopicSelect = async (topicId: string) => {
    setSelectedTopicId(topicId);
    setSelectedSubtopicId(null);
    setError("");

    const topicTitle = topics.find(t => t.id === topicId)?.title || "";
    const cacheKey = `${selectedClass}_${topicId}_main`;

    if (!topicContentCache[cacheKey]) {
      setLoading(true);
      const data = await generateTopicMaterial(selectedClass, topicTitle);
      if (data) {
        setTopicContentCache(prev => ({ ...prev, [cacheKey]: data }));
      } else {
        setError("Gagal memuat materi topik. Coba lagi nanti.");
      }
      setLoading(false);
    }
  };

  const handleSubtopicSelect = async (subtopic: { id: string, title: string }) => {
    setSelectedSubtopicId(subtopic.id);
    setError("");

    const topicTitle = topics.find(t => t.id === selectedTopicId)?.title || "";
    const cacheKey = `${selectedClass}_${selectedTopicId}_${subtopic.id}`;

    if (!topicContentCache[cacheKey]) {
      setLoading(true);
      const data = await generateSubtopicMaterial(selectedClass, topicTitle, subtopic.title);
      if (data) {
        setTopicContentCache(prev => ({ ...prev, [cacheKey]: data }));
      } else {
        setError("Gagal memuat materi subtopik. Coba lagi nanti.");
      }
      setLoading(false);
    }
  };

  const currentTopicData = selectedTopicId ? topicContentCache[`${selectedClass}_${selectedTopicId}_main`] : null;
  const currentSubtopicData = (selectedTopicId && selectedSubtopicId) ? topicContentCache[`${selectedClass}_${selectedTopicId}_${selectedSubtopicId}`] : null;

  const handlePrint = () => {
    if (!selectedTopicId || !currentTopicData) {
      alert("Pilih topik materi dulu ya 😊");
      return;
    }

    const topicTitle = topics.find(t => t.id === selectedTopicId)?.title || "";
    
    // Construct the payload for PrintPreviewView
    const printPayload = {
      title: "Materi & Rumus Praktis",
      subTitle: `Kelas ${selectedClass} – GassPoll Matika`,
      student: { name: profile.name, school: profile.school },
      topicTitle: topicTitle,
      intro: currentTopicData.summary,
      formulaCards: currentTopicData.formulas.slice(0, 3),
      exampleCard: currentTopicData.example,
      tips: ["Pahami konsepnya pelan-pelan ya!", "Jangan lupa hafalkan rumus utamanya.", "Coba kerjakan contoh soalnya mandiri."],
      footer: "Sumber belajar: GassPoll Matika",
      classLevel: selectedClass
    };

    onOpenPrint('materi', printPayload);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header & Grade Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="space-y-2">
          <h2 className={`text-3xl font-black ${theme.text}`}>Materi & Rumus Praktis</h2>
          <div className="flex gap-2">
            {[Grade.K4, Grade.K5, Grade.K6].map(g => (
              <button
                key={g}
                onClick={() => {
                  setSelectedClass(g);
                  setSelectedTopicId(null);
                  setSelectedSubtopicId(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedClass === g ? theme.button : 'bg-white border-2 border-gray-100 text-gray-500'
                }`}
              >
                Kelas {g}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={handlePrint}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-sm transition-all active:scale-95 ${theme.button}`}
        >
          <Printer size={20} />
          Print Halaman Ini
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Topics */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <Book size={20} className="text-blue-500" /> Daftar Topik
          </h3>
          <div className="space-y-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                  selectedTopicId === topic.id 
                    ? `${theme.primary} text-white shadow-md border-transparent` 
                    : `${theme.card} hover:border-blue-300 text-gray-700`
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold">{topic.title}</span>
                  <span className={`text-[10px] ${selectedTopicId === topic.id ? 'text-white/70' : 'text-gray-400'}`}>
                    Klik untuk lihat materi
                  </span>
                </div>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
          
          {/* Debug Info */}
          <div className="text-[10px] text-gray-300 font-mono mt-4">
            Active ID: {selectedTopicId || 'None'}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`${theme.card} rounded-3xl p-8 border shadow-sm print:shadow-none print:border-none print:p-0 min-h-[400px] relative`}>
             
             {/* Header Print Only */}
             <div className="print-only mb-10 text-center border-b pb-6">
                <h1 className="text-2xl font-bold uppercase tracking-widest">GassPoll Matika - Materi Belajar</h1>
                <div className="mt-4 flex justify-between text-sm font-medium">
                  <span>Nama: {profile.name || 'Siswa'}</span>
                  <span>Kelas: {selectedClass}</span>
                  <span>Sekolah: {profile.school || 'SD'}</span>
                </div>
             </div>

             {/* Loading State */}
             {loading && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center space-y-4 rounded-3xl">
                  <Loader2 className="animate-spin text-blue-500" size={48} />
                  <p className="font-bold text-gray-600">Menyusun materi praktis untukmu...</p>
               </div>
             )}

             {/* Error State */}
             {error && (
               <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 text-center space-y-3">
                  <AlertCircle className="mx-auto text-red-500" size={32} />
                  <p className="font-bold text-red-700">{error}</p>
                  <button onClick={() => selectedTopicId && handleTopicSelect(selectedTopicId)} className="text-sm font-bold text-red-600 underline">Coba Lagi</button>
               </div>
             )}

             {/* Dynamic Content */}
             {!selectedTopicId ? (
               <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4 text-gray-400">
                  <Book size={64} className="opacity-20" />
                  <div className="space-y-1">
                    <p className="text-xl font-bold">Belum Ada Topik Terpilih</p>
                    <p className="text-sm">Silakan pilih topik di sebelah kiri untuk mulai belajar.</p>
                  </div>
               </div>
             ) : (
               <div className="space-y-8 animate-in fade-in duration-500">
                  
                  {/* Topic View vs Subtopic View */}
                  {!selectedSubtopicId ? (
                    // TOPIC MAIN VIEW
                    <div className="space-y-8">
                       <div className="space-y-2">
                          <h3 className={`text-3xl font-black ${theme.text}`}>{topics.find(t => t.id === selectedTopicId)?.title}</h3>
                          {currentTopicData && <p className="text-gray-600 leading-relaxed italic">{currentTopicData.summary}</p>}
                       </div>

                       {currentTopicData && (
                         <>
                           {/* Formulas Section */}
                           <div className="space-y-4">
                              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Star size={16} className="text-yellow-500" /> Rumus Praktis Utama
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentTopicData.formulas.map((f: any, i: number) => (
                                  <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                                    <p className="text-xs font-bold text-gray-400">{f.name}</p>
                                    <p className={`text-xl font-black ${theme.text}`}>{f.formula}</p>
                                    <p className="text-[10px] text-gray-500">{f.description}</p>
                                  </div>
                                ))}
                              </div>
                           </div>

                           {/* Main Example Section */}
                           <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                                  <Sparkles size={18} />
                                </div>
                                <h4 className="font-bold text-blue-900">Contoh Soal Cepat</h4>
                              </div>
                              <p className="font-bold text-blue-800 text-lg">{currentTopicData.example.question}</p>
                              <div className="space-y-2">
                                {currentTopicData.example.steps.map((step: string, i: number) => (
                                  <div key={i} className="flex gap-2 text-sm text-blue-700">
                                    <span className="font-bold">{i+1}.</span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                                <div className="pt-2 mt-2 border-t border-blue-200">
                                  <p className="text-sm font-black text-blue-900">Jadi, jawabannya adalah: {currentTopicData.example.answer}</p>
                                </div>
                              </div>
                           </div>

                           {/* Subtopics Navigator */}
                           <div className="space-y-4">
                              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pilih Subtopik Spesifik:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {currentTopicData.subtopics.map((sub: any) => (
                                  <button
                                    key={sub.id}
                                    onClick={() => handleSubtopicSelect(sub)}
                                    className="p-4 bg-white border-2 border-gray-50 rounded-2xl text-left hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between group"
                                  >
                                    <span className="font-bold text-gray-700">{sub.title}</span>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                  </button>
                                ))}
                              </div>
                           </div>
                         </>
                       )}
                    </div>
                  ) : (
                    // SUBTOPIC DETAIL VIEW
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                       <button 
                         onClick={() => setSelectedSubtopicId(null)}
                         className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 no-print"
                       >
                         <ArrowLeft size={16} /> Kembali ke Menu Topik
                       </button>

                       <div className="space-y-4">
                          <h3 className={`text-3xl font-black ${theme.text}`}>{currentTopicData?.subtopics.find((s: any) => s.id === selectedSubtopicId)?.title}</h3>
                          {currentSubtopicData && (
                            <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 text-purple-900 leading-relaxed font-medium">
                               {currentSubtopicData.concept}
                            </div>
                          )}
                       </div>

                       {currentSubtopicData && (
                         <>
                           {currentSubtopicData.formula && (
                             <div className="p-6 bg-yellow-50 rounded-2xl border-2 border-dashed border-yellow-200 text-center space-y-2">
                                <p className="text-xs font-bold text-yellow-600 uppercase">Rumus Khusus Subtopik</p>
                                <p className="text-3xl font-black text-yellow-800 font-kids">{currentSubtopicData.formula}</p>
                             </div>
                           )}

                           <div className="space-y-6">
                              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                <GraduationCap size={20} className="text-green-500" /> Contoh Pembahasan
                              </h4>
                              <div className="space-y-4">
                                {currentSubtopicData.examples.map((ex: any, i: number) => (
                                  <div key={i} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-3">
                                    <p className="font-bold text-gray-800">Soal {i+1}: {ex.question}</p>
                                    <div className="pl-4 border-l-2 border-gray-100 space-y-1">
                                      {ex.steps.map((s: string, j: number) => <p key={j} className="text-sm text-gray-500">• {s}</p>)}
                                    </div>
                                    <p className="text-sm font-black text-green-600">Jawaban: {ex.answer}</p>
                                  </div>
                                ))}
                              </div>
                           </div>

                           <div className="space-y-4 no-print">
                              <h4 className="font-bold text-gray-800">Coba Latih Dirimu:</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {currentSubtopicData.drills.map((drill: any, i: number) => (
                                  <details key={i} className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                     <summary className="p-4 font-bold text-sm text-gray-700 cursor-pointer flex items-center justify-between list-none">
                                        <span>Latihan {i+1}: {drill.question}</span>
                                        <span className="text-[10px] text-blue-500 bg-blue-100 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">KLIK CEK JAWABAN</span>
                                     </summary>
                                     <div className="px-4 pb-4 text-sm font-black text-blue-600 border-t border-gray-100 pt-2 bg-white">
                                        Kunci: {drill.answer}
                                     </div>
                                  </details>
                                ))}
                              </div>
                           </div>
                         </>
                       )}
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialView;
