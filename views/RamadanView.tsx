
import React, { useState, useEffect, useMemo } from 'react';
import { TodoItem, Grade, PrintType, DailyStat, AppState, RamadanConfig, RamadanStartMode } from '../types';
import { RAMADAN_WAJIB_BASE, RAMADAN_DAILY_TARGETS, getMathTarget } from '../constants';
import { Moon, Star, Plus, Trash2, CheckCircle, Printer, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trophy, Flame, Settings, X, AlertTriangle, Users, Layout, FileText, BarChart3 } from 'lucide-react';

interface RamadanViewProps {
  progress: Record<string, TodoItem[]>;
  updateProgress: (date: string, todos: TodoItem[]) => void;
  dailyStats: Record<string, DailyStat>;
  points: number;
  streak: number;
  level: string;
  theme: any;
  profile?: any;
  ramadanConfig: RamadanConfig;
  onUpdateConfig: (config: RamadanConfig) => void;
  navigate: (view: AppState['view']) => void;
  onOpenPrint?: (type: PrintType, payload?: any) => void;
}

const RamadanView: React.FC<RamadanViewProps> = ({ progress, updateProgress, dailyStats, points, streak, level, theme, profile, ramadanConfig, onUpdateConfig, navigate, onOpenPrint }) => {
  const [selectedDate, setSelectedDate] = useState(new (Date)().toISOString().split('T')[0]);
  const [newTodo, setNewTodo] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isParentMode, setIsParentMode] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; date: string; label: string } | null>(null);

  const currentTodos = useMemo(() => progress[selectedDate] || [], [progress, selectedDate]);
  const currentStat = useMemo(() => dailyStats[selectedDate] || { 
    wajibDone: 0, wajibTotal: 0, targetDone: 0, targetTotal: 0, 
    dailyPoints: 0, bonusPoints: 0, isWajibPerfect: false, isTargetBonus: false 
  }, [dailyStats, selectedDate]);

  const ramadanDayNumber = useMemo(() => {
    const start = new Date(ramadanConfig.startDate); 
    const current = new Date(selectedDate);
    const diff = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return (diff >= 1 && diff <= 30) ? diff : null;
  }, [selectedDate, ramadanConfig.startDate]);

  const formatIndoDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitialDayPlan = (date: string) => {
    const start = new Date(ramadanConfig.startDate);
    const current = new Date(date);
    const diff = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dayIndex = (diff >= 1 && diff <= 30) ? diff.toString() : "1";
    
    const targets = RAMADAN_DAILY_TARGETS[dayIndex] || RAMADAN_DAILY_TARGETS["1"];
    const mathTarget = getMathTarget(profile?.grade || Grade.K4);

    return [
      ...RAMADAN_WAJIB_BASE.map(x => ({ 
        id: `wajib-${x.title}-${date}`, 
        task: `[WAJIB] ${x.title} ${x.note ? '(' + x.note + ')' : ''}`, 
        completed: false 
      })),
      ...targets.map(x => ({ 
        id: `target-${x}-${date}`, 
        task: `[TARGET] ${x.replace('Latihan Matika (auto by kelas)', mathTarget)}`, 
        completed: false 
      }))
    ];
  };

  useEffect(() => {
    if (!progress[selectedDate]) {
      updateProgress(selectedDate, getInitialDayPlan(selectedDate));
    }
  }, [selectedDate, ramadanDayNumber]);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const newList = [...currentTodos, { id: Date.now().toString(), task: newTodo, completed: false }];
    updateProgress(selectedDate, newList);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    const newList = currentTodos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    updateProgress(selectedDate, newList);
  };

  const deleteTodo = (id: string) => {
    const newList = currentTodos.filter(t => t.id !== id);
    updateProgress(selectedDate, newList);
  };

  const handlePrintDaily = () => {
    if (!onOpenPrint) return;
    const mathTarget = getMathTarget(profile?.grade || Grade.K4);
    const dayIndex = ramadanDayNumber ? ramadanDayNumber.toString() : "1";
    const targets = RAMADAN_DAILY_TARGETS[dayIndex] || RAMADAN_DAILY_TARGETS["1"];

    onOpenPrint('ramadan', {
      docTitle: "RAMADAN CHECKLIST A4",
      appBrand: "GassPoll Matika • by Kak Mus",
      headerDate: formatIndoDate(selectedDate),
      ramadanDay: ramadanDayNumber,
      ramadanInfo: {
        mode: ramadanConfig.startMode,
        startDate: formatIndoDate(ramadanConfig.startDate)
      },
      student: { name: profile?.name || 'Siswa', class: profile?.grade, school: profile?.school },
      sections: [
        { title: "WAJIB HARIAN", items: RAMADAN_WAJIB_BASE.map(x => ({ title: x.title, isDone: currentTodos.find(t => t.task.includes(x.title))?.completed || false })) },
        { title: "TARGET TAMBAHAN", items: targets.map(x => ({ title: x.replace('Latihan Matika (auto by kelas)', mathTarget), isDone: currentTodos.find(t => t.task.includes(x.replace('Latihan Matika (auto by kelas)', mathTarget)))?.completed || false })) }
      ]
    });
  };

  const handlePrintFullReport = () => {
    if (!onOpenPrint) return;
    
    const allDates = Object.keys(dailyStats).sort();
    const history = allDates.map(date => {
      const start = new Date(ramadanConfig.startDate);
      const curr = new Date(date);
      const dNum = Math.floor((curr.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const stat = dailyStats[date];
      
      return {
        date,
        dayNum: dNum,
        wajib: `${stat.wajibDone}/${stat.wajibTotal}`,
        target: `${stat.targetDone}/${stat.targetTotal}`,
        points: stat.dailyPoints + stat.bonusPoints,
        isPerfect: stat.isWajibPerfect
      };
    }).filter(h => h.dayNum >= 1 && h.dayNum <= 30);

    onOpenPrint('ramadan_report', {
      title: "LAPORAN PROGRES RAMADAN",
      student: { name: profile?.name || 'Siswa', grade: profile?.grade, school: profile?.school },
      summary: { totalPoints: points, streak, level },
      history: history,
      startDate: formatIndoDate(ramadanConfig.startDate)
    });
  };

  const setRamadanStart = (date: string) => {
    onUpdateConfig({ ...ramadanConfig, startDate: date });
    setConfirmDialog(null);
    alert(`Siap! Ramadan ke-1 dimulai pada ${formatIndoDate(date)} 😊`);
  };

  const handleSetStartQuick = (daysFromNow: number, label: string) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    const dateStr = target.toISOString().split('T')[0];
    setConfirmDialog({ isOpen: true, date: dateStr, label });
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8 animate-in fade-in duration-500">
      
      {/* GLOBAL MODE NAVIGATION */}
      <div className="flex bg-white/50 backdrop-blur-md p-2 rounded-3xl border shadow-sm no-print">
        <button 
          onClick={() => { setIsParentMode(false); navigate('ramadan_rewards'); }}
          className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-sm text-yellow-700 hover:bg-yellow-50 transition-all"
        >
          <Layout size={18} /> [ Papan Anak ]
        </button>
        <div className="w-[1px] bg-gray-200 my-2"></div>
        <button 
          onClick={() => setIsParentMode(!isParentMode)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-sm transition-all ${isParentMode ? 'bg-purple-600 text-white shadow-lg' : 'text-purple-700 hover:bg-purple-50'}`}
        >
          <Users size={18} /> [ Mode Orang Tua ]
        </button>
      </div>

      {!isParentMode ? (
        /* CHILD VIEW: DAILY CHECKLIST */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
            <div className="bg-white rounded-3xl p-6 border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center"><Trophy size={24} /></div>
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Poin Hari Ini</p><p className="text-xl font-black text-gray-800">+{currentStat.dailyPoints + currentStat.bonusPoints} <span className="text-sm font-bold opacity-50">Pts</span></p></div>
            </div>
            <div className="bg-white rounded-3xl p-6 border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center"><Flame size={24} /></div>
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Streak</p><p className="text-xl font-black text-gray-800">{streak} <span className="text-sm font-bold opacity-50">Hari</span></p></div>
            </div>
            <div className="bg-white rounded-3xl p-6 border shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center"><Star size={24} /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Level</p><p className="text-lg font-black text-gray-800">{level}</p></div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-purple-600 transition-colors"
                >
                  <Settings size={20} />
                </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 no-print">
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-3xl font-black text-purple-700 flex items-center justify-center md:justify-start gap-3">
                <Moon className="fill-purple-700" size={32} /> To-Do Ramadan
              </h2>
              <div className="flex items-center gap-4 pt-4 justify-center md:justify-start">
                <button onClick={() => setSelectedDate(prev => { 
                    const d = new Date(prev); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0];
                })} className="p-2 hover:bg-purple-50 rounded-full transition-colors text-purple-600"><ChevronLeft size={24} /></button>
                <div className="text-center min-w-[150px]">
                  <p className="text-xs font-black text-purple-400 uppercase tracking-widest">{formatIndoDate(selectedDate)}</p>
                  {ramadanDayNumber && <p className="text-sm font-bold text-gray-700">🌙 Ramadan ke-{ramadanDayNumber}</p>}
                </div>
                <button onClick={() => setSelectedDate(prev => { 
                    const d = new Date(prev); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0];
                })} className="p-2 hover:bg-purple-50 rounded-full transition-colors text-purple-600"><ChevronRight size={24} /></button>
              </div>
            </div>
            <button onClick={handlePrintDaily} className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-purple-700 flex items-center gap-2 transition-all transform active:scale-95"><Printer size={20} /> Print Checklist A4</button>
          </div>

          <div className="bg-white rounded-[2.5rem] border-2 shadow-xl p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10 space-y-10">
                <div className="space-y-4 no-print">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Tambah Kegiatan Personal</label>
                  <div className="flex gap-2">
                      <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTodo()} placeholder="Misal: Tadarus Juz 30..." className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-300 transition-all text-sm shadow-inner" />
                      <button onClick={addTodo} className="bg-purple-600 text-white p-4 rounded-2xl hover:bg-purple-700 transition-all shadow-lg active:scale-90"><Plus size={24} /></button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-2"><CalendarIcon size={16} className="text-purple-400" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Agenda Ibadah</span></div>
                  {currentTodos.map(todo => (
                    <div key={todo.id} className="group flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-purple-200 hover:bg-white transition-all shadow-sm">
                        <button onClick={() => toggleTodo(todo.id)} className="flex items-center gap-4 flex-1 text-left">
                          <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${todo.completed ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-transparent'}`}><CheckCircle size={20} /></div>
                          <span className={`font-bold text-gray-700 text-sm md:text-base ${todo.completed ? 'line-through opacity-40' : ''}`}>{todo.task}</span>
                        </button>
                        <button onClick={() => deleteTodo(todo.id)} className="p-2 text-red-200 hover:text-red-500 transition-all no-print"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </div>
      ) : (
        /* PARENT VIEW: PROGRESS TRACKER */
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h2 className="text-3xl font-black text-gray-800 flex items-center justify-center md:justify-start gap-3">
                  <BarChart3 className="text-blue-500" size={32} /> Dashboard Orang Tua
                </h2>
                <p className="text-gray-500 font-medium italic">"Pantau disiplin dan kebaikan buah hati setiap hari."</p>
              </div>
              <button 
                onClick={handlePrintFullReport}
                className="bg-green-600 text-white px-8 py-5 rounded-[1.5rem] font-black shadow-xl hover:bg-green-700 flex items-center gap-3 transition-all active:scale-95"
              >
                <FileText size={22} /> Cetak Laporan Progres Ramadan Anak
              </button>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
                 <p className="text-2xl font-black text-blue-600">{points}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Poin Terkumpul</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
                 <p className="text-2xl font-black text-red-600">{streak} Hari</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Streak Aktif</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
                 <p className="text-lg font-black text-gray-800 leading-tight">{level}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level Saat Ini</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
                 <p className="text-lg font-black text-purple-700 leading-tight">{ramadanConfig.startMode}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mode Penetapan</p>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] border-2 shadow-xl p-8 overflow-x-auto">
              <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                 <CalendarIcon className="text-purple-600" size={24} /> Tabel Capaian 30 Hari
              </h3>
              <table className="w-full text-sm border-collapse">
                 <thead>
                    <tr className="bg-gray-50 text-gray-400 font-black uppercase text-[10px] tracking-widest">
                       <th className="p-4 text-left border-b">Hari</th>
                       <th className="p-4 text-center border-b">Wajib</th>
                       <th className="p-4 text-center border-b">Target</th>
                       <th className="p-4 text-center border-b">Poin</th>
                       <th className="p-4 text-center border-b">Perfect?</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {Array.from({ length: 30 }).map((_, i) => {
                       const dNum = i + 1;
                       const start = new Date(ramadanConfig.startDate);
                       const curr = new Date(start);
                       curr.setDate(curr.getDate() + i);
                       const dStr = curr.toISOString().split('T')[0];
                       const stat = dailyStats[dStr];

                       return (
                          <tr key={dNum} className={`hover:bg-purple-50/30 transition-colors ${stat?.isWajibPerfect ? 'bg-green-50/30' : ''}`}>
                             <td className="p-4 font-black text-gray-500">Ramadan {dNum}</td>
                             <td className="p-4 text-center font-bold">
                                {stat ? `${stat.wajibDone}/${stat.wajibTotal}` : '---'}
                             </td>
                             <td className="p-4 text-center font-bold">
                                {stat ? `${stat.targetDone}/${stat.targetTotal}` : '---'}
                             </td>
                             <td className="p-4 text-center font-black text-purple-700">
                                {stat ? `+${stat.dailyPoints + stat.bonusPoints}` : '---'}
                             </td>
                             <td className="p-4 text-center">
                                {stat?.isWajibPerfect ? '✅' : '-'}
                             </td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Settings Modal (Always Accessible for Admin Reset) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full z-20"><X size={20} /></button>
              <div className="space-y-2 relative z-10">
                 <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3"><CalendarIcon className="text-purple-600" size={24} /> Konfigurasi Ramadan</h3>
                 <p className="text-sm text-gray-500">Atur parameter awal simulasi Ramadan.</p>
              </div>
              <div className="space-y-4 relative z-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Metode Penetapan</label>
                    <div className="grid grid-cols-3 gap-2">
                       {(['Pemerintah', 'Ortu', 'Custom'] as RamadanStartMode[]).map(m => (
                          <button key={m} onClick={() => onUpdateConfig({ ...ramadanConfig, startMode: m })} className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${ramadanConfig.startMode === m ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>{m}</button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Pilih Tanggal 1 Ramadan</label>
                    <input type="date" value={ramadanConfig.startDate} onChange={(e) => onUpdateConfig({ ...ramadanConfig, startDate: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none text-sm font-bold" />
                 </div>
                 <div className="pt-2 flex gap-2">
                    <button onClick={() => handleSetStartQuick(0, 'Hari Ini')} className="flex-1 py-3 bg-purple-50 text-purple-700 rounded-xl text-xs font-black hover:bg-purple-100 transition-all border border-purple-100">Set ke Hari Ini</button>
                    <button onClick={() => handleSetStartQuick(1, 'Besok')} className="flex-1 py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-black hover:bg-blue-100 transition-all border border-blue-100">Set ke Besok</button>
                 </div>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-black transition-all active:scale-95">Simpan Konfigurasi</button>
           </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
               <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto"><AlertTriangle size={32} /></div>
               <div className="space-y-2">
                  <h4 className="text-xl font-black text-gray-800">Jadikan {confirmDialog.label} 1 Ramadan?</h4>
                  <p className="text-sm text-gray-500">Aksi ini akan mereset hitungan hari Ramadanmu.</p>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => setRamadanStart(confirmDialog.date)} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-black hover:bg-purple-700 transition-all active:scale-95">Ya, Set</button>
                  <button onClick={() => setConfirmDialog(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95">Batal</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default RamadanView;
