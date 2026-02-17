import React, { useState, useRef, useEffect } from 'react';
import { User, Bell, Palette, X, Check } from 'lucide-react';
import { StudentProfile, Theme } from '../types';
import { THEME_COLORS } from '../constants';

interface HeaderProps {
  profile: StudentProfile;
  theme: any;
  currentTheme: Theme;
  onUpdateTheme: (theme: Theme) => void;
}

const Header: React.FC<HeaderProps> = ({ profile, theme, currentTheme, onUpdateTheme }) => {
  const [showThemePicker, setShowThemePicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown saat klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowThemePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-40 no-print" ref={pickerRef}>
      {/* Header Container */}
      {/* Hapus overflow-hidden dari parent utama agar dropdown bisa keluar */}
      <header className={`pt-6 pb-8 px-6 md:px-8 ${theme.primary} text-white rounded-b-[2.5rem] shadow-xl relative transition-colors duration-500`}>
        
        {/* Background Decorations (Isolated Overflow) */}
        <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem] pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          {/* Profile Info */}
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-inner">
                <User size={24} className="text-white" />
             </div>
             <div>
                <h2 className="text-xs md:text-sm font-medium text-white/80 uppercase tracking-widest">Selamat Belajar,</h2>
                <p className="text-xl md:text-2xl font-black text-white drop-shadow-sm truncate max-w-[180px] md:max-w-md">
                  {profile.name || 'Siswa Hebat'} 👋
                </p>
             </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
             <button 
               onClick={() => setShowThemePicker(!showThemePicker)}
               className={`p-3 rounded-2xl transition-all active:scale-95 shadow-sm border ${showThemePicker ? 'bg-white text-gray-800 border-white' : 'bg-white/20 hover:bg-white/30 text-white border-white/30'}`}
               title="Ganti Tema"
             >
                {showThemePicker ? <X size={20} /> : <Palette size={20} />}
             </button>
             
             <button className="relative p-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white transition-all active:scale-95 shadow-sm">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </div>
      </header>

      {/* Theme Picker Dropdown */}
      {showThemePicker && (
        <div className="absolute top-24 right-4 md:right-8 z-50 w-72 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-5 animate-in slide-in-from-top-4 fade-in duration-200">
           <div className="flex justify-between items-center mb-4 px-1">
             <span className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
               <Palette size={16} className="text-blue-500" /> Pilih Tema
             </span>
             <button onClick={() => setShowThemePicker(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
           </div>
           
           <div className="grid grid-cols-4 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar pb-2">
              {Object.keys(THEME_COLORS).map((key) => {
                 const t = THEME_COLORS[key as keyof typeof THEME_COLORS];
                 const isActive = currentTheme === key;
                 return (
                   <button
                     key={key}
                     onClick={() => {
                       onUpdateTheme(key as Theme);
                     }}
                     className={`group relative w-14 h-14 rounded-2xl border-2 transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-1 ${isActive ? 'border-gray-800 shadow-lg scale-105 ring-2 ring-gray-200' : 'border-transparent hover:shadow-md'}`}
                     title={key}
                   >
                      <div className={`absolute inset-0 rounded-2xl ${t.primary} opacity-20`}></div>
                      <div className={`w-8 h-8 rounded-full ${t.primary} shadow-sm border-2 border-white flex items-center justify-center`}>
                        {isActive && <Check size={14} className="text-white" />}
                      </div>
                   </button>
                 );
              })}
           </div>
           <div className="mt-3 pt-3 border-t text-center">
             <p className="text-[10px] text-gray-400 font-bold">Klik bulat warna untuk ganti suasana!</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Header;