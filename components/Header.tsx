
import React from 'react';
import { User, Bell } from 'lucide-react';
import { StudentProfile } from '../types';

interface HeaderProps {
  profile: StudentProfile;
  theme: any;
}

const Header: React.FC<HeaderProps> = ({ profile, theme }) => {
  return (
    <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-8 no-print shadow-sm z-10">
      <div>
        <h2 className="text-sm md:text-base font-medium text-gray-400">Selamat Belajar,</h2>
        <p className={`text-lg md:text-xl font-bold ${theme.text}`}>
          {profile.name || 'Siswa Berprestasi'} 👋
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end border-r pr-4 border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kelas {profile.grade}</span>
          <span className="text-sm font-semibold text-gray-800">{profile.school || 'Sekolah Dasar'}</span>
        </div>
        
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${theme.primary}`}>
          <User size={20} />
        </div>
      </div>
    </header>
  );
};

export default Header;
