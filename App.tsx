import React, { useState, useEffect } from 'react';
import {
  AppState,
  Grade,
  Theme,
  StudentProfile,
  PracticeSession,
  TodoItem,
  PrintType,
  DailyStat,
  Badge,
  RamadanConfig
} from './types';

import { THEME_COLORS, RAMADAN_BADGES, LICENSE_CONFIG, getLevelByPoints } from './constants';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeView from './views/HomeView';
import ProfileView from './views/ProfileView';
import ThemeView from './views/ThemeView';
import MaterialView from './views/MaterialView';
import PracticeView from './views/PracticeView';
import TryOutView from './views/TryOutView';
import ResultView from './views/ResultView';
import CertificateView from './views/CertificateView';
import RamadanView from './views/RamadanView';
import RamadanRewardsView from './views/RamadanRewardsView';
import PrintCenterView from './views/PrintCenterView';
import ChatMatikaView from './views/ChatMatikaView';
import PrintPreviewView from './views/PrintPreviewView';

import { Home, BookOpen, PenTool, ClipboardList, MessageCircle } from 'lucide-react';

// License
import { loadLicense, isExpired } from './utils/license';
import LicenseGateView from './views/LicenseGateView';

const App: React.FC = () => {
  // License State
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // IMPORTANT: store previous view for print preview back
  const [prevView, setPrevView] = useState<AppState['view']>('home');

  const [state, setState] = useState<AppState>({
    view: 'home',
    profile: {
      name: '',
      grade: Grade.K4,
      school: '',
      city: '',
    },
    theme: Theme.Matcha,
    ramadanConfig: {
      startDate: new Date().toISOString().split('T')[0],
      startMode: 'Pemerintah'
    }
  });

  // Ramadan & Reward States
  const [ramadanProgress, setRamadanProgress] = useState<Record<string, TodoItem[]>>({});
  const [ramadanPointsTotal, setRamadanPointsTotal] = useState(0);
  const [ramadanStreak, setRamadanStreak] = useState(0);
  const [ramadanBestStreak, setRamadanBestStreak] = useState(0);
  const [ramadanBadges, setRamadanBadges] = useState<Badge[]>([]);
  const [dailyStats, setDailyStats] = useState<Record<string, DailyStat>>({});
  const [unlockedPopup, setUnlockedPopup] = useState<{ type: "level" | "badge"; title: string; desc: string } | null>(null);

  const [session, setSession] = useState<PracticeSession | null>(null);

  const themeColors = THEME_COLORS[state.theme];

  // License Check on Mount
  useEffect(() => {
    if (LICENSE_CONFIG.enabled) {
      const lic = loadLicense();
      const valid = lic.isActive && !isExpired(lic);
      setIsAuthorized(valid);
    } else {
      setIsAuthorized(true);
    }
  }, []);

  // Persistence: Load
  useEffect(() => {
    const saved = localStorage.getItem('gp_ramadan_rewards');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setRamadanProgress(data.progress || {});
        setRamadanPointsTotal(data.points || 0);
        setRamadanStreak(data.streak || 0);
        setRamadanBestStreak(data.bestStreak || 0);
        setRamadanBadges(data.badges || []);
        setDailyStats(data.stats || {});
      } catch (e) { console.error("Load rewards failed", e); }
    }

    const savedConfig = localStorage.getItem('gp_ramadan_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setState(prev => ({ ...prev, ramadanConfig: config }));
      } catch (e) { console.error("Load config failed", e); }
    }
  }, []);

  // Persistence: Save
  useEffect(() => {
    localStorage.setItem('gp_ramadan_rewards', JSON.stringify({
      progress: ramadanProgress,
      points: ramadanPointsTotal,
      streak: ramadanStreak,
      bestStreak: ramadanBestStreak,
      badges: ramadanBadges,
      stats: dailyStats
    }));
  }, [ramadanProgress, ramadanPointsTotal, ramadanStreak, ramadanBestStreak, ramadanBadges, dailyStats]);

  useEffect(() => {
    localStorage.setItem('gp_ramadan_config', JSON.stringify(state.ramadanConfig));
  }, [state.ramadanConfig]);

  const navigate = (view: AppState['view']) => {
    setState(prev => ({ ...prev, view }));
  };

  const updateProfile = (profile: StudentProfile) => {
    setState(prev => ({ ...prev, profile }));
  };

  const updateTheme = (theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
  };

  const updateRamadanConfig = (config: RamadanConfig) => {
    setState(prev => ({ ...prev, ramadanConfig: config }));
  };

  // REWARD LOGIC: Re-calculate everything when progress changes
  const updateRamadanData = (date: string, todos: TodoItem[]) => {
    setRamadanProgress(prev => {
      const newProgress = { ...prev, [date]: todos };
      recalculateRewards(newProgress);
      return newProgress;
    });
  };

  const recalculateRewards = (progress: Record<string, TodoItem[]>) => {
    let totalPoints = 0;
    const currentLevel = getLevelByPoints(ramadanPointsTotal);
    const newStats: Record<string, DailyStat> = {};

    const dates = Object.keys(progress).sort();
    let streak = 0;
    let best = 0;

    // Track task counts for thematic badges
    let quranDays = 0;
    let helperDays = 0;
    let mathDays = 0;
    let perfectWajibDays = 0;

    dates.forEach(date => {
      const dayTodos = progress[date] || [];
      const wajibItems = dayTodos.filter(t => t.task.includes('[WAJIB]'));
      const targetItems = dayTodos.filter(t => t.task.includes('[TARGET]'));

      const wajibDone = wajibItems.filter(t => t.completed).length;
      const targetDone = targetItems.filter(t => t.completed).length;

      const wajibPerfect = wajibDone === wajibItems.length && wajibItems.length > 0;
      const targetBonus = targetDone >= 3;

      const dailyPoints = wajibDone * 5 + targetDone * 3;
      const bonusPoints = (wajibPerfect ? 10 : 0) + (targetBonus ? 5 : 0);

      newStats[date] = {
        wajibDone, wajibTotal: wajibItems.length,
        targetDone, targetTotal: targetItems.length,
        dailyPoints, bonusPoints,
        isWajibPerfect: wajibPerfect,
        isTargetBonus: targetBonus
      };

      totalPoints += (dailyPoints + bonusPoints);

      // Streak logic: wajibDone / wajibTotal >= 70%
      if (wajibItems.length > 0 && (wajibDone / wajibItems.length) >= 0.7) {
        streak++;
      } else {
        streak = 0;
      }
      if (streak > best) best = streak;

      // Thematic tracking
      if (dayTodos.some(t => t.task.includes('Baca Al-Qur’an') && t.completed)) quranDays++;
      if (dayTodos.some(t => t.task.includes('Bantu orang tua') && t.completed)) helperDays++;
      if (dayTodos.some(t => t.task.includes('Latihan Matika') && t.completed)) mathDays++;
      if (wajibPerfect) perfectWajibDays++;
    });

    setDailyStats(newStats);
    setRamadanPointsTotal(totalPoints);
    setRamadanStreak(streak);
    setRamadanBestStreak(best);

    // Level Popup
    const nextLevel = getLevelByPoints(totalPoints);
    if (nextLevel.id > currentLevel.id) {
      setUnlockedPopup({ type: "level", title: `Naik Level: ${nextLevel.name}!`, desc: "Wah hebat! Kamu semakin rajin ya 🎉" });
    }

    // Badge Check
    const newBadges: Badge[] = [...ramadanBadges];
    const checkBadge = (id: string) => {
      if (!newBadges.find(b => b.id === id)) {
        const meta = RAMADAN_BADGES.find(m => m.id === id);
        if (meta) {
          newBadges.push({ ...meta, earnedAtDate: new Date().toISOString().split('T')[0] });
          setUnlockedPopup({ type: "badge", title: `Badge Baru: ${meta.title}!`, desc: meta.desc });
        }
      }
    };

    if (best >= 3) checkBadge('streak_3');
    if (best >= 7) checkBadge('streak_7');
    if (best >= 15) checkBadge('streak_15');
    if (best >= 30) checkBadge('streak_30');
    if (quranDays >= 20) checkBadge('quran_20');
    if (helperDays >= 15) checkBadge('helper_15');
    if (mathDays >= 20) checkBadge('math_20');
    if (perfectWajibDays >= 10) checkBadge('wajib_10');

    setRamadanBadges(newBadges);
  };

  // OPEN PRINT PREVIEW (store previous page for back button)
  const openPrintPreview = (type: PrintType, payload?: any) => {
    setPrevView(state.view);
    setState(prev => ({ ...prev, view: 'printPreview', printType: type, printPayload: payload }));
  };

  const finishSession = (finalSession: PracticeSession) => {
    setSession(finalSession);
    if (state.view === 'tryout') {
      setState(prev => ({ ...prev, lastTryOutResult: finalSession }));
    }
    setState(prev => ({ ...prev, view: 'result' }));
  };

  const renderView = () => {
    switch (state.view) {
      case 'home':
        return <HomeView navigate={navigate} theme={themeColors} profile={state.profile} />;

      case 'profile':
        return <ProfileView profile={state.profile} onSave={updateProfile} theme={themeColors} />;

      case 'theme':
        return <ThemeView currentTheme={state.theme} onSelect={updateTheme} theme={themeColors} />;

      case 'material':
        return <MaterialView grade={state.profile.grade} theme={themeColors} profile={state.profile} onOpenPrint={openPrintPreview} />;

      case 'practice':
        return <PracticeView grade={state.profile.grade} onFinish={finishSession} theme={themeColors} />;

      case 'tryout':
        return <TryOutView grade={state.profile.grade} onFinish={finishSession} theme={themeColors} profile={state.profile} />;

      case 'result':
        return <ResultView session={session} theme={themeColors} profile={state.profile} navigate={navigate} />;

      case 'certificate':
        return <CertificateView session={state.lastTryOutResult} theme={themeColors} profile={state.profile} />;

      case 'ramadan':
        return (
          <RamadanView
            progress={ramadanProgress}
            updateProgress={updateRamadanData}
            dailyStats={dailyStats}
            points={ramadanPointsTotal}
            streak={ramadanStreak}
            level={getLevelByPoints(ramadanPointsTotal).name}
            theme={themeColors}
            profile={state.profile}
            ramadanConfig={state.ramadanConfig}
            onUpdateConfig={updateRamadanConfig}
            navigate={navigate}
            onOpenPrint={openPrintPreview}
          />
        );

      case 'ramadan_rewards':
        return (
          <RamadanRewardsView
            points={ramadanPointsTotal}
            streak={ramadanStreak}
            bestStreak={ramadanBestStreak}
            badges={ramadanBadges}
            profile={state.profile}
            onOpenPrint={openPrintPreview}
            theme={themeColors}
          />
        );

      case 'print':
        return (
          <PrintCenterView
            theme={themeColors}
            profile={state.profile}
            lastSession={state.lastTryOutResult || null}
            onOpenPrint={openPrintPreview}
          />
        );

      case 'chat_matika':
        return <ChatMatikaView theme={themeColors} profile={state.profile} />;

      case 'printPreview':
        return (
          <PrintPreviewView
            type={state.printType!}
            theme={themeColors}
            profile={state.profile}
            lastSession={state.lastTryOutResult || null}
            ramadanTodos={[]}
            printPayload={state.printPayload}
            onBack={() => navigate(prevView)}
          />
        );

      default:
        return <HomeView navigate={navigate} theme={themeColors} profile={state.profile} />;
    }
  };

  // LICENSE GATE RENDERING
  if (isAuthorized === null) {
    return <div className="min-h-screen bg-white" />;
  }

  if (isAuthorized === false) {
    return <LicenseGateView theme={themeColors} onActivated={() => setIsAuthorized(true)} />;
  }

  const MobileNavItem = ({ id, icon: Icon, label }: { id: AppState['view'], icon: any, label: string }) => {
     const isActive = state.view === id;
     return (
       <button
         onClick={() => navigate(id)}
         className={`relative flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 ${isActive ? '-translate-y-4' : 'opacity-60'}`}
       >
         <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${isActive ? `${themeColors.primary} text-white scale-110 shadow-${themeColors.primary}/50 border-4 border-white` : 'bg-transparent text-gray-500'}`}>
            <Icon size={isActive ? 24 : 22} />
         </div>
         <span className={`text-[10px] font-bold mt-1 transition-all ${isActive ? 'text-gray-800 scale-100' : 'text-gray-400 scale-0 h-0'}`}>
           {label}
         </span>
       </button>
     );
  };

  // ✅ MOBILE FRIENDLY LAYOUT:
  // - Sidebar hidden on mobile
  // - Floating Bottom nav shown on mobile
  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <div className="flex min-h-screen">
        {/* Desktop/Tablet Sidebar */}
        <div className="hidden md:block">
          <Sidebar currentView={state.view} navigate={navigate} theme={themeColors} />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            profile={state.profile} 
            theme={themeColors} 
            currentTheme={state.theme}
            onUpdateTheme={updateTheme}
          />

          <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-4 md:pt-6 pb-28 md:pb-8 min-w-0">
            <div className="w-full max-w-5xl mx-auto">
              {renderView()}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Mobile Bottom Nav (Kid Friendly) */}
      <div className="md:hidden fixed bottom-6 inset-x-4 z-[90]">
        <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl shadow-black/10 px-4 py-2 flex justify-between items-end">
          <MobileNavItem id="home" icon={Home} label="Home" />
          <MobileNavItem id="material" icon={BookOpen} label="Materi" />
          <div className="w-8"></div> {/* Spacer for center button */}
          <MobileNavItem id="tryout" icon={ClipboardList} label="TryOut" />
          <MobileNavItem id="chat_matika" icon={MessageCircle} label="Chat" />
          
          {/* Main Action Button (Center) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">
             <button 
               onClick={() => navigate('practice')}
               className={`w-16 h-16 rounded-full ${themeColors.primary} text-white shadow-xl flex items-center justify-center border-4 border-white transform transition-transform hover:scale-105 active:scale-95`}
             >
                <PenTool size={28} />
             </button>
          </div>
        </div>
      </div>

      {/* Popup Level/Badge */}
      {unlockedPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-24 h-24 bg-yellow-100 text-yellow-500 rounded-3xl flex items-center justify-center mx-auto text-5xl shadow-lg">
                {unlockedPopup.type === 'level' ? '🌟' : '🏆'}
              </div>
              <h4 className="text-3xl font-black text-gray-800">{unlockedPopup.title}</h4>
              <p className="text-gray-500 font-medium">{unlockedPopup.desc}</p>
              <button
                onClick={() => setUnlockedPopup(null)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-blue-700 transition-all active:scale-95"
              >
                Hore! Keren ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;