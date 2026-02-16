
import React, { useState } from 'react';
import { Grade, StudentProfile } from '../types';
import { Save, User, GraduationCap, MapPin, Building } from 'lucide-react';

interface ProfileViewProps {
  profile: StudentProfile;
  onSave: (profile: StudentProfile) => void;
  theme: any;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onSave, theme }) => {
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [showSaved, setShowSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h2 className={`text-3xl font-black ${theme.text}`}>Identitas Siswa</h2>
        <p className="text-gray-500">Isi data dirimu dengan benar untuk keperluan Sertifikat dan Print Center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className={`${theme.card} p-8 rounded-3xl border shadow-sm space-y-6`}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 block">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 block">Kelas</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as Grade })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value={Grade.K4}>Kelas 4</option>
                    <option value={Grade.K5}>Kelas 5</option>
                    <option value={Grade.K6}>Kelas 6</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 block">Nomor Induk (Opsional)</label>
                <input
                  type="text"
                  value={formData.idNumber || ''}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  placeholder="NISN / No Absen"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 block">Nama Sekolah</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  placeholder="Contoh: SDN 01 Jakarta"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 block">Kota</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Contoh: Jakarta Selatan"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${theme.button}`}
            >
              <Save size={20} />
              Simpan Profil
            </button>

            {showSaved && (
              <p className="text-center text-green-600 font-bold animate-bounce">
                ✅ Data berhasil disimpan!
              </p>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-700">Kartu Siswa Preview</h3>
          <div className={`${theme.primary} p-6 rounded-3xl shadow-xl text-white relative overflow-hidden aspect-[1.6/1]`}>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">GassPoll Matika</p>
                  <p className="text-lg font-black leading-tight">{formData.name || 'NAMA SISWA'}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                   <User size={20} />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold opacity-80">{formData.school || 'SEKOLAH DASAR'}</p>
                <div className="flex items-center justify-between">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-md">
                    Kelas {formData.grade}
                  </span>
                  <span className="text-[10px] opacity-60">ID: {formData.idNumber || '---'}</span>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-8 -top-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
            <p>Kartu ini akan muncul di pojok setiap sertifikat yang kamu peroleh.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
