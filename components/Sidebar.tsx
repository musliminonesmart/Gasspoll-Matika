
import React from 'react';
import { Home, BookOpen, PenTool, ClipboardList, Printer, Award, Moon, User, Palette, MessageCircle, Sparkles } from 'lucide-react';
import { AppState } from '../types';

interface SidebarProps {
  currentView: AppState['view'];
  navigate: (view: AppState['view']) => void;
  theme: any;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, navigate, theme }) => {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'material', label: 'Materi', icon: BookOpen },
    { id: 'practice', label: 'Latihan', icon: PenTool },
    { id: 'tryout', label: 'Try Out', icon: ClipboardList },
    { id: 'chat_matika', label: 'Chat Matika', icon: MessageCircle },
    { id: 'ramadan', label: 'Ramadan', icon: Moon },
    { id: 'ramadan_rewards', label: 'Reward Ramadan', icon: Sparkles },
    { id: 'print', label: 'Print Center', icon: Printer },
    { id: 'certificate', label: 'Sertifikat', icon: Award },
    { id: 'profile', label: 'Profil Saya', icon: User },
    { id: 'theme', label: 'Tema UI', icon: Palette },
  ];

  return (
    <aside className={`w-20 md:w-64 flex-shrink-0 flex flex-col transition-all no-print ${theme.sidebar}`}>
      <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-2xl font-black text-black">G</span>
        </div>
        <span className="hidden md:block text-xl font-extrabold tracking-tight">GassPoll Matika</span>
      </div>
      
      <nav className="flex-1 px-2 md:px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id as any)}
            className={`w-full flex items-center justify-center md:justify-start gap-4 px-3 py-3 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-white/20 font-bold shadow-sm' 
                : 'hover:bg-white/10 opacity-80'
            }`}
          >
            <item.icon size={22} />
            <span className="hidden md:block text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 hidden md:block">
        <div className="bg-white/10 rounded-2xl p-4 text-xs">
          <p className="font-bold mb-1 opacity-70 italic">"Belajar asik, masa depan menarik!"</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
