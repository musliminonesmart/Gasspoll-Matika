
import React from 'react';
import { Theme } from '../types';
import { THEME_COLORS, THEME_DESC } from '../constants';
import { Palette, Check } from 'lucide-react';

interface ThemeViewProps {
  currentTheme: Theme;
  onSelect: (theme: Theme) => void;
  theme: any;
}

const ThemeView: React.FC<ThemeViewProps> = ({ currentTheme, onSelect, theme }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
         <h2 className={`text-3xl font-black ${theme.text}`}>Tampilan Aplikasi</h2>
         <p className="text-gray-500">Pilih warna favoritmu agar belajar makin semangat!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(THEME_COLORS).map((name) => {
          const t = THEME_COLORS[name as keyof typeof THEME_COLORS];
          const isSelected = currentTheme === name;
          const description = THEME_DESC[name] || "Pilihan warna yang elegan.";
          
          return (
            <button
              key={name}
              onClick={() => onSelect(name as Theme)}
              className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col gap-4 text-left group hover:scale-105 ${
                isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
               <div className="flex justify-between items-start w-full">
                  <div className="flex gap-1">
                    <div className={`w-6 h-6 rounded-full ${t.primary}`}></div>
                    <div className={`w-6 h-6 rounded-full ${t.bg}`}></div>
                    <div className={`w-6 h-6 rounded-full ${t.accent}`}></div>
                  </div>
                  {isSelected && (
                    <div className="bg-blue-500 text-white p-1 rounded-full">
                      <Check size={14} />
                    </div>
                  )}
               </div>
               
               <div className="space-y-1">
                  <h4 className="text-lg font-black text-gray-800">{name}</h4>
                  <p className="text-xs text-gray-400 font-medium">{description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {name.includes("Kids") || name.includes("Pink") || name.includes("Matcha") || name.includes("Sky") || name.includes("Lemon") || name.includes("Peach") || name.includes("Lavender") || name.includes("Robot") ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 font-bold">
                        Kids Friendly
                      </span>
                    ) : null}
                    {name.includes("Ramadan") || name.includes("Gold") || name.includes("Purple") || name.includes("Forest") ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-bold">
                        Ramadan
                      </span>
                    ) : null}
                    {name.includes("Mono") || name.includes("Hero") || name.includes("Clean") || name.includes("Aqua") ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-100 font-bold">
                        Fokus
                      </span>
                    ) : null}
                  </div>
               </div>

               <div className={`${t.bg} w-full h-12 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden`}>
                  <div className={`w-1/2 h-2 ${t.primary} rounded-full`}></div>
               </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeView;
