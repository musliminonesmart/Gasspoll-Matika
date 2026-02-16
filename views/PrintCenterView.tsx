
import React from 'react';
import { PracticeSession, StudentProfile, PrintType } from '../types';
import { Printer, FileText, Award, Moon, CheckCircle } from 'lucide-react';

interface PrintCenterViewProps {
  theme: any;
  profile: StudentProfile;
  lastSession: PracticeSession | null;
  onOpenPrint: (type: PrintType) => void;
}

const PrintCenterView: React.FC<PrintCenterViewProps> = ({ theme, profile, lastSession, onOpenPrint }) => {
  const options: { id: PrintType; title: string; icon: any; color: string; bg: string }[] = [
    { id: 'rumus', title: 'Print Rumus Praktis', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'hasil', title: 'Print Hasil Belajar', icon: Printer, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'sertifikat', title: 'Print Sertifikat', icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 'ramadan', title: 'Print To-Do Ramadan', icon: Moon, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 no-print">
      <div className="text-center space-y-2">
         <h2 className={`text-3xl font-black ${theme.text}`}>Print Center</h2>
         <p className="text-gray-500">Cetak dokumen fisik untuk ditempel di meja belajar atau disimpan sebagai portofolio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {options.map((opt) => (
           <div key={opt.id} className={`${theme.card} p-8 rounded-[2.5rem] border shadow-sm flex flex-col justify-between items-start gap-6 hover:shadow-lg transition-all`}>
              <div className={`${opt.bg} ${opt.color} w-16 h-16 rounded-2xl flex items-center justify-center`}>
                 <opt.icon size={32} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-bold">{opt.title}</h3>
                 <p className="text-sm text-gray-500">Format A4, PDF ready. Pastikan printermu sudah menyala ya!</p>
              </div>
              <button 
                onClick={() => onOpenPrint(opt.id)}
                className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${theme.button}`}
              >
                Buka & Cetak
              </button>
           </div>
         ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 flex items-center gap-6">
         <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle className="text-blue-500" size={32} />
         </div>
         <div>
            <h4 className="text-lg font-bold text-blue-900">Tips Mencetak:</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              Gunakan kertas A4 untuk hasil terbaik. Kamu juga bisa memilih "Save as PDF" di menu printer jika ingin menyimpannya di HP atau Laptop sebagai kenang-kenangan belajar!
            </p>
         </div>
      </div>
    </div>
  );
};

export default PrintCenterView;
