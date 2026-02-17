import React, { useMemo, useState, useRef } from 'react';
import { PrintType, StudentProfile, PracticeSession, TodoItem, Grade } from '../types';
import { FORMULAS } from '../constants';
import { ArrowLeft, Printer, ShieldCheck, Star, Target, CheckCircle, Loader2, Download, FileText, ImageIcon, QrCode, Sparkles, Moon, Calendar, Trophy, Flame, Award } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface PrintPreviewViewProps {
  type: PrintType;
  theme: any;
  profile: StudentProfile;
  lastSession: PracticeSession | null;
  ramadanTodos: TodoItem[];
  printPayload?: any;
  onBack: () => void;
}

const PrintPreviewView: React.FC<PrintPreviewViewProps> = ({ type, theme, profile, lastSession, ramadanTodos, printPayload, onBack }) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const certId = useMemo(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 899999);
    return `GP-TKA-${year}-${profile.grade}-${rand}`;
  }, [profile.grade]);

  // A4 size in pixels at 96 DPI approx
  // 794px width is standard A4 width for screen rendering
  const A4_PX = { w: 794, h: 1123 };

  // Wait for fonts to load before exporting
  async function waitFontsReady() {
    // @ts-ignore
    if (document.fonts && document.fonts.ready) {
       // @ts-ignore
       await document.fonts.ready;
    } else {
       await new Promise((r) => setTimeout(r, 500));
    }
  }

  const handleExport = async (format: 'pdf' | 'png' | 'jpg') => {
    if (!printRef.current) return;
    setIsExporting(format);

    try {
      await waitFontsReady();

      // Find all print pages in the preview
      const pages = Array.from(printRef.current.querySelectorAll('.print-page'));
      if (pages.length === 0) return;

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const baseFilename = `GassPollMatika_${type}_${profile.name.replace(/\s+/g, '_')}_${dateStr}`;

      // --- CRITICAL MOBILE FIX: SANDBOX TECHNIQUE ---
      // We create an invisible container with FIXED Desktop A4 width.
      // We clone the content there so html-to-image captures the "Desktop" layout,
      // not the squashed Mobile layout.
      
      const isLandscape = type === 'sertifikat';
      const targetWidth = isLandscape ? 1123 : 794;
      const targetHeight = isLandscape ? 794 : 1123;

      const sandbox = document.createElement('div');
      sandbox.style.position = 'fixed';
      sandbox.style.top = '-10000px';
      sandbox.style.left = '-10000px';
      sandbox.style.width = `${targetWidth}px`;
      sandbox.style.height = 'auto';
      sandbox.style.zIndex = '-1';
      sandbox.style.background = '#ffffff';
      document.body.appendChild(sandbox);

      const commonOpts = {
        cacheBust: true,
        pixelRatio: 2, // High resolution for crisp text
        backgroundColor: '#ffffff',
        width: targetWidth,
        height: targetHeight,
        style: {
           transform: 'none', // Ensure no mobile scaling is applied
           margin: '0',
           padding: isLandscape ? '10mm' : '14mm 12mm 22mm 12mm' // Force padding consistency
        }
      };

      if (format === 'pdf') {
        const pdf = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'pt',
          format: 'a4',
        });

        const pdfPageW = pdf.internal.pageSize.getWidth();
        const pdfPageH = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < pages.length; i++) {
          const originalPage = pages[i] as HTMLElement;
          
          // 1. Clone the node
          const clonedNode = originalPage.cloneNode(true) as HTMLElement;
          
          // 2. Reset styles on the clone to ensure it fills the sandbox
          clonedNode.style.transform = 'none';
          clonedNode.style.margin = '0';
          clonedNode.style.width = '100%';
          clonedNode.style.height = '100%';
          clonedNode.style.boxShadow = 'none';
          clonedNode.style.borderRadius = '0';
          
          // 3. Append to sandbox
          sandbox.innerHTML = '';
          sandbox.appendChild(clonedNode);

          // 4. Capture from sandbox
          const dataUrl = await toPng(clonedNode, { 
             ...commonOpts, 
             width: targetWidth,
             height: targetHeight 
          });
          
          if (i > 0) pdf.addPage();
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfPageW, pdfPageH);
        }
        pdf.save(`${baseFilename}.pdf`);
      } 
      else {
        // For Image export, take the first page only (usually mostly single page)
        const originalPage = pages[0] as HTMLElement;
        const clonedNode = originalPage.cloneNode(true) as HTMLElement;
        
        clonedNode.style.transform = 'none';
        clonedNode.style.margin = '0';
        clonedNode.style.width = '100%';
        clonedNode.style.height = '100%';
        clonedNode.style.boxShadow = 'none';

        sandbox.innerHTML = '';
        sandbox.appendChild(clonedNode);
        
        let dataUrl;
        if (format === 'png') {
           dataUrl = await toPng(clonedNode, commonOpts);
        } else {
           dataUrl = await toJpeg(clonedNode, { ...commonOpts, quality: 0.95 });
        }

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${baseFilename}.${format}`;
        link.click();
      }

      // Cleanup
      document.body.removeChild(sandbox);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Maaf, ada kendala saat ekspor. Coba lagi ya!');
    } finally {
      setIsExporting(null);
    }
  };

  const PageWrapper = ({ children, isLandscape = false }: { children?: React.ReactNode, isLandscape?: boolean }) => (
    <div className={`print-scale ${isLandscape ? 'landscape' : 'portrait'}`}>
      <div className={`print-page ${isLandscape ? 'landscape' : 'portrait'}`}>
        <div className="watermark">
          <div className="watermark-text">
            GASSPOLL<br/>MATIKA
          </div>
        </div>
        <div className="print-content">
          {children}
        </div>
        <div data-hide-on-export="true" className="print-footer">
          🌙 GassPoll Matika • by Kak Mus ⭐
        </div>
      </div>
    </div>
  );

  const renderDocument = () => {
    switch (type) {
      case 'ramadan_report':
        if (!printPayload) return null;
        return (
          <PageWrapper>
            <div className="space-y-8 flex-1 avoid-break">
               <div className="text-center border-b-4 border-gray-900 pb-6 space-y-1">
                  <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-gray-900">{printPayload.title}</h1>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Laporan Evaluasi Orang Tua</p>
                  <div className="mt-4 flex flex-col items-center">
                    <p className="text-2xl font-black text-gray-800">{printPayload.student.name}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kelas {printPayload.student.grade} - {printPayload.student.school}</p>
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border text-center">
                    <p className="text-[9pt] font-black text-gray-400 uppercase">Mulai 1 Ram.</p>
                    <p className="text-sm font-black">{printPayload.startDate}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border text-center">
                    <p className="text-[9pt] font-black text-gray-400 uppercase">Total Poin</p>
                    <p className="text-xl font-black text-purple-700">{printPayload.summary.totalPoints}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border text-center">
                    <p className="text-[9pt] font-black text-gray-400 uppercase">Level Akhir</p>
                    <p className="text-sm font-black">{printPayload.summary.level}</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <FileText size={14} /> Tabel Capaian Ibadah Harian
                  </h3>
                  <div className="border rounded-2xl overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-[9pt]">
                      <thead className="bg-gray-900 text-white font-black uppercase tracking-widest">
                        <tr>
                          <th className="py-3 px-4 text-left">Ramadan</th>
                          <th className="py-3 px-4 text-center">Wajib</th>
                          <th className="py-3 px-4 text-center">Target</th>
                          <th className="py-3 px-4 text-center">Poin</th>
                          <th className="py-3 px-4 text-center">Perfect?</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {printPayload.history.length > 0 ? printPayload.history.map((h: any, i: number) => (
                          <tr key={i} className={h.isPerfect ? 'bg-green-50/30' : ''}>
                            <td className="py-2.5 px-4 font-bold text-gray-600">Hari ke-{h.dayNum}</td>
                            <td className="py-2.5 px-4 text-center font-black">{h.wajib}</td>
                            <td className="py-2.5 px-4 text-center font-black">{h.target}</td>
                            <td className="py-2.5 px-4 text-center font-black text-purple-700">+{h.points}</td>
                            <td className="py-2.5 px-4 text-center">{h.isPerfect ? '✅' : '---'}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} className="py-10 text-center italic text-gray-400">Belum ada data progres tersimpan.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
               <div className="mt-auto grid grid-cols-2 gap-10 avoid-break">
                  <div className="space-y-2">
                     <p className="text-[9pt] font-black text-gray-400 uppercase tracking-widest text-center">Tanda Tangan Anak</p>
                     <div className="h-20 border-b border-gray-200"></div>
                     <p className="text-[10pt] font-black text-center text-gray-800">{printPayload.student.name}</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[9pt] font-black text-gray-400 uppercase tracking-widest text-center">Tanda Tangan Orang Tua</p>
                     <div className="h-20 border-b border-gray-200"></div>
                     <p className="text-[10pt] font-black text-center text-gray-400 italic">Ayah / Bunda</p>
                  </div>
               </div>
            </div>
          </PageWrapper>
        );
      case 'ramadan_rewards':
        if (!printPayload) return null;
        return (
          <PageWrapper>
            <div className="space-y-8 flex-1 avoid-break">
               <div className="text-center border-b-4 border-yellow-500 pb-6 space-y-2">
                  <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-gray-900">{printPayload.title}</h1>
                  <p className="text-sm font-bold text-yellow-600 uppercase tracking-widest">{printPayload.subtitle}</p>
                  <div className="mt-4 flex flex-col items-center">
                    <p className="text-2xl font-black text-gray-800">{printPayload.student.name}</p>
                    <p className="text-sm font-bold text-gray-400 uppercase">Kelas {printPayload.student.class} - {printPayload.student.school}</p>
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-6">
                  <div className="p-6 bg-yellow-50 rounded-3xl border-2 border-yellow-100 text-center space-y-1">
                     <p className="text-3xl font-black text-yellow-600">{printPayload.summary.points}</p>
                     <p className="text-[10px] font-black text-yellow-400 uppercase">Total Poin</p>
                  </div>
                  <div className="p-6 bg-red-50 rounded-3xl border-2 border-red-100 text-center space-y-1">
                     <p className="text-3xl font-black text-red-600">{printPayload.summary.streak}</p>
                     <p className="text-[10px] font-black text-red-400 uppercase">Streak Aktif</p>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 text-center space-y-1">
                     <p className="text-lg font-black text-blue-600 leading-tight">{printPayload.summary.level}</p>
                     <p className="text-[10px] font-black text-blue-400 uppercase">Level Juara</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                     <Award size={14} /> Pencapaian Badge Terbaru
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                     {printPayload.topBadges.map((badge: any) => (
                       <div key={badge.id} className="p-4 border-2 border-gray-50 rounded-2xl flex flex-col items-center text-center gap-1">
                          <span className="text-3xl">{badge.icon}</span>
                          <p className="text-xs font-black text-gray-700">{badge.title}</p>
                          <p className="text-[8px] text-gray-400 font-bold uppercase">{badge.earnedAtDate || '---'}</p>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="mt-auto p-8 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center space-y-3">
                  <p className="text-lg font-black text-gray-700 italic">"{printPayload.motivation}"</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Besok kita naik level lagi ya 😊</p>
               </div>
               <div className="flex justify-between items-end px-4 avoid-break">
                  <div className="text-left space-y-1">
                     <p className="text-[9pt] font-black text-gray-400 uppercase tracking-widest">Diterbitkan Pada</p>
                     <p className="font-bold text-base">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="text-right flex flex-col items-center gap-1">
                    <QrCode size={50} className="text-gray-300" />
                    <p className="text-[7pt] font-bold text-gray-300 uppercase">Verifikasi Resmi</p>
                  </div>
               </div>
            </div>
          </PageWrapper>
        );
      case 'ramadan':
        if (!printPayload) return null;
        return (
          <PageWrapper>
            <div className="space-y-8 flex-1 avoid-break">
               <div className="text-center border-b-4 border-purple-800 pb-6 space-y-2">
                  <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-purple-900">{printPayload.docTitle}</h1>
                  <p className="text-sm font-bold text-purple-400 uppercase tracking-widest">{printPayload.appBrand}</p>
                  <div className="flex justify-between items-end mt-4 px-2">
                    <div className="text-left space-y-1">
                       <p className="text-[10px] font-black text-gray-400 uppercase">Nama: <b className="text-gray-800">{printPayload.student.name}</b></p>
                       <p className="text-[10px] font-black text-gray-400 uppercase">Kelas: <b className="text-gray-800">{printPayload.student.class}</b> - <b className="text-gray-800">{printPayload.student.school}</b></p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <p className="text-xs font-black text-purple-700 uppercase bg-purple-50 px-3 py-1 rounded-lg border border-purple-100 mb-1">
                         {printPayload.headerDate}
                       </p>
                       {printPayload.ramadanDay && <p className="text-[10px] font-black text-gray-400">RAMADAN KE-{printPayload.ramadanDay}</p>}
                    </div>
                  </div>
               </div>
               {printPayload.ramadanInfo && (
                 <div className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center text-[9pt] avoid-break">
                    <div className="flex gap-4">
                       <p><span className="font-bold text-gray-400 uppercase text-[7pt]">Mode:</span> <span className="font-black text-purple-700">{printPayload.ramadanInfo.mode}</span></p>
                       <p><span className="font-bold text-gray-400 uppercase text-[7pt]">Mulai 1 Ramadan:</span> <span className="font-black text-purple-700">{printPayload.ramadanInfo.startDate}</span></p>
                    </div>
                    <Moon size={14} className="text-purple-300" />
                 </div>
               )}
               <div className="grid grid-cols-1 gap-8">
                  {printPayload.sections.map((section: any, idx: number) => (
                    <div key={idx} className="space-y-4 avoid-break">
                       <h3 className="text-xs font-black text-purple-600 uppercase tracking-[0.3em] flex items-center gap-2">
                          {idx === 0 ? <Moon size={14} className="fill-purple-600" /> : <Star size={14} className="fill-purple-600" />}
                          {section.title}
                       </h3>
                       <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                          {section.items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 border-b border-gray-50 pb-2">
                               <div className={`w-5 h-5 border-2 rounded shrink-0 flex items-center justify-center ${item.isDone ? 'bg-purple-100 border-purple-300 text-purple-600' : 'border-gray-200 text-transparent'}`}>
                                  <CheckCircle size={14} />
                               </div>
                               <span className={`text-[11pt] font-bold ${item.isDone ? 'text-purple-900/40 line-through' : 'text-gray-700'}`}>
                                 {item.title}
                               </span>
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
               <div className="mt-8 space-y-4 avoid-break">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Catatan & Pencapaian Hari Ini</h3>
                  <div className="space-y-4 pt-2">
                    <div className="h-[1px] bg-gray-100 w-full relative">
                       <span className="absolute -top-3 right-0 text-[8pt] text-gray-300 italic font-medium">Tulislah kebaikanmu di sini...</span>
                    </div>
                    <div className="h-[1px] bg-gray-100 w-full"></div>
                    <div className="h-[1px] bg-gray-100 w-full"></div>
                  </div>
               </div>
               <div className="mt-auto pt-10 text-center avoid-break">
                  <p className="text-[10pt] text-gray-300 font-bold italic uppercase tracking-[0.4em]">"Setiap amalan kecil punya balasan besar. Tetap GassPoll!"</p>
               </div>
            </div>
          </PageWrapper>
        );
      case 'materi':
        if (!printPayload) return null;
        return (
          <PageWrapper>
            <div className="space-y-8 flex-1 avoid-break">
              <div className="text-center border-b-4 border-gray-900 pb-6 space-y-2">
                <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-gray-900">{printPayload.title}</h1>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{printPayload.subTitle}</p>
                <div className="flex justify-center gap-6 text-[10px] font-bold mt-2 uppercase text-gray-400">
                   <span>Nama: <b className="text-gray-800">{printPayload.student.name || '---'}</b></span>
                   <span>Sekolah: <b className="text-gray-800">{printPayload.student.school || '---'}</b></span>
                </div>
              </div>
              <div className="space-y-2">
                 <h2 className="text-3xl font-black text-blue-600 font-kids text-center">{printPayload.topicTitle}</h2>
                 <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 italic text-sm text-center text-blue-900">
                    {printPayload.intro}
                 </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" /> Rumus Praktis Utama
                 </h3>
                 <div className="grid grid-cols-1 gap-4">
                    {printPayload.formulaCards.map((f: any, i: number) => (
                      <div key={i} className="p-5 border-2 border-gray-100 rounded-3xl space-y-2 bg-white flex flex-col items-center text-center avoid-break">
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{f.name}</p>
                         <p className="text-2xl font-black text-gray-900 font-mono tracking-tighter bg-gray-50 w-full py-2 rounded-xl formula">{f.formula}</p>
                         <p className="text-[10pt] font-medium text-gray-500 leading-tight">{f.description}</p>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="p-6 bg-green-50/50 rounded-[2rem] border-2 border-green-100 space-y-4 avoid-break">
                 <h3 className="text-xs font-black text-green-600 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Sparkles size={14} /> Contoh Soal Cepat
                 </h3>
                 <div className="space-y-3">
                    <p className="font-bold text-gray-800 text-base">{printPayload.exampleCard.question}</p>
                    <div className="pl-4 border-l-2 border-green-200 space-y-1 text-sm">
                       {printPayload.exampleCard.steps.map((step: string, i: number) => (
                         <p key={i} className="text-green-800">• {step}</p>
                       ))}
                    </div>
                    <div className="pt-2 border-t border-green-200">
                      <p className="text-sm font-black text-green-700">Jadi Akhirnya: {printPayload.exampleCard.answer}</p>
                    </div>
                 </div>
              </div>
            </div>
          </PageWrapper>
        );
      case 'rumus':
        const formulas = FORMULAS[profile.grade] || [];
        return (
          <PageWrapper>
            <div className="space-y-8 flex-1 avoid-break">
              <div className="text-center border-b-4 border-gray-900 pb-6 space-y-2">
                <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900">Kumpulan Rumus Praktis</h1>
                <p className="text-lg font-bold text-gray-800">Matematika SD Kelas {profile.grade} - GassPoll Matika</p>
                <div className="flex justify-center gap-8 text-sm mt-2 font-bold text-gray-400">
                   <span>Nama: <b className="text-gray-900">{profile.name || '---'}</b></span>
                   <span>Sekolah: <b className="text-gray-900">{profile.school || '---'}</b></span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {formulas.map((f, i) => (
                  <div key={i} className="p-6 border-2 border-gray-100 rounded-3xl space-y-3 bg-white avoid-break">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="text-lg font-black text-blue-600 uppercase">{f.topic}</h3>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BAGIAN {i+1}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <p className="text-3xl font-black font-mono tracking-tighter text-gray-900 formula">{f.formula}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">CONTOH:</p>
                      <p className="text-sm italic text-gray-600 leading-relaxed">{f.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PageWrapper>
        );
      case 'hasil':
        if (!lastSession) return null;
        const total = lastSession.questions.length;
        const correct = lastSession.results.correct.length;
        const score = Math.round((correct / total) * 100);
        return (
          <>
            <PageWrapper>
              <div className="space-y-8 flex-1 avoid-break">
                <div className="text-center border-b-4 border-gray-900 pb-6">
                  <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900">Laporan Hasil Try Out</h1>
                  <p className="text-lg font-bold text-gray-800">Simulasi Ujian TKA - GassPoll Matika</p>
                </div>
                <div className="grid grid-cols-2 gap-8 border-b pb-8">
                   <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Siswa</p>
                      <p className="text-xl font-black text-gray-900">{profile.name}</p>
                      <p className="text-sm font-medium text-gray-700">Kelas {profile.grade} - {profile.school}</p>
                   </div>
                   <div className="text-right flex flex-col items-end">
                      <div className="bg-black text-white px-8 py-4 rounded-3xl text-center shadow-lg">
                         <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Skor Akhir</p>
                         <p className="text-4xl font-black">{score}</p>
                      </div>
                      <p className="text-xs font-bold mt-2 text-gray-400 uppercase tracking-widest">TGL: {new Date().toLocaleDateString()}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <h3 className="text-lg font-black border-l-4 border-black pl-3 uppercase tracking-wider">Analisa Soal (1-5)</h3>
                   <div className="grid grid-cols-1 gap-2">
                      {lastSession.questions.slice(0, 5).map((q, i) => {
                        const isCorrect = lastSession.results.correct.includes(q.id);
                        return (
                          <div key={q.id} className="p-4 rounded-xl border flex justify-between items-center bg-gray-50/50 avoid-break">
                             <div className="flex gap-4 items-center overflow-hidden">
                                <span className="font-bold text-gray-400 w-6">#{i+1}</span>
                                <span className="text-sm font-medium truncate max-w-sm">{q.text}</span>
                             </div>
                             <span className={`font-black uppercase text-[10px] px-3 py-1 rounded-full ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {isCorrect ? 'Benar' : 'Salah'}
                             </span>
                          </div>
                        )
                      })}
                   </div>
                </div>
              </div>
            </PageWrapper>
            <PageWrapper>
              <div className="space-y-8 flex-1 avoid-break">
                <div className="space-y-4">
                   <h3 className="text-lg font-black border-l-4 border-black pl-3 uppercase tracking-wider">Analisa Soal (6-10)</h3>
                   <div className="grid grid-cols-1 gap-2">
                      {lastSession.questions.slice(5, 10).map((q, i) => {
                        const isCorrect = lastSession.results.correct.includes(q.id);
                        return (
                          <div key={q.id} className="p-4 rounded-xl border flex justify-between items-center bg-gray-50/50 avoid-break">
                             <div className="flex gap-4 items-center overflow-hidden">
                                <span className="font-bold text-gray-400 w-6">#{i+6}</span>
                                <span className="text-sm font-medium truncate max-w-sm">{q.text}</span>
                             </div>
                             <span className={`font-black uppercase text-[10px] px-3 py-1 rounded-full ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {isCorrect ? 'Benar' : 'Salah'}
                             </span>
                          </div>
                        )
                      })}
                   </div>
                </div>
                <div className="mt-auto p-6 bg-gray-50 rounded-3xl border border-dashed text-center italic text-gray-500 text-sm">
                   "Setiap kesalahan adalah awal dari kepintaran. Tetap semangat GassPoll belajarnya!"
                </div>
              </div>
            </PageWrapper>
          </>
        );
      case 'sertifikat':
        if (!lastSession) return null;
        const s = Math.round((lastSession.results.correct.length / lastSession.questions.length) * 100);
        let achievement = { title: 'PEJUANG HEBAT', stars: 1, color: 'text-red-500' };
        if (s >= 90) achievement = { title: 'MASTER MATEMATIKA', stars: 5, color: 'text-yellow-600' };
        else if (s >= 80) achievement = { title: 'SANGAT MEMUASKAN', stars: 4, color: 'text-blue-600' };
        else if (s >= 70) achievement = { title: 'SANGAT BAIK', stars: 3, color: 'text-green-600' };
        else if (s >= 60) achievement = { title: 'BAIK', stars: 2, color: 'text-orange-600' };
        const certTheme = profile.grade === Grade.K4 ? { border: 'border-[#91C788]', accent: 'text-[#91C788]' } 
                        : profile.grade === Grade.K5 ? { border: 'border-[#C5A059]', accent: 'text-[#C5A059]' } 
                        : { border: 'border-[#1e3a8a]', accent: 'text-[#1e3a8a]' };
        return (
          <PageWrapper isLandscape={true}>
             <div className={`h-full w-full border-[10mm] ${certTheme.border} p-10 flex flex-col items-center justify-between text-center relative bg-white box-border`}>
                <div className="space-y-4 relative z-10 avoid-break">
                  <ShieldCheck size={70} className={`${certTheme.accent} mx-auto`} />
                  <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-gray-800 font-serif">Sertifikat Prestasi</h1>
                  <p className="text-lg font-bold italic text-gray-500">Diberikan kepada siswa berprestasi:</p>
                </div>
                <div className="space-y-2 relative z-10 avoid-break">
                  <h2 className={`text-6xl font-black ${certTheme.accent} font-kids`}>{profile.name || 'Siswa Berprestasi'}</h2>
                  <div className={`h-1 bg-gray-100 w-full max-w-lg mx-auto`}></div>
                  <p className="text-lg font-bold text-gray-700 tracking-widest uppercase">Siswa Kelas {profile.grade} - {profile.school || 'Sekolah Dasar'}</p>
                </div>
                <div className="max-w-3xl relative z-10 space-y-4 avoid-break">
                  <div className="flex flex-col items-center gap-2">
                     <div className="flex gap-1">
                       {Array.from({ length: 5 }).map((_, i) => (
                         <Star key={i} size={28} className={i < achievement.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                       ))}
                     </div>
                     <p className={`text-2xl font-black tracking-widest ${achievement.color}`}>{achievement.title}</p>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Telah menyelesaikan simulasi <b>Ujian TKA Matematika</b> dengan skor total <b>{s}/100</b>.<br/>
                    Akurasi: {s}%, Benar: {lastSession.results.correct.length}, Salah: {lastSession.results.wrong.length}.
                  </p>
                </div>
                <div className="w-full flex justify-between items-end relative z-10 px-10 avoid-break">
                  <div className="text-left space-y-1">
                    <p className="text-[9pt] font-black text-gray-400 uppercase tracking-widest">Diterbitkan Pada</p>
                    <p className="font-bold text-base">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-[8pt] text-gray-300 font-mono tracking-tighter">ID: {certId}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`h-16 w-56 border-b-2 ${certTheme.border} flex items-center justify-center italic text-2xl font-kids text-gray-700 opacity-90`}>
                      Kak Mus
                    </div>
                    <p className="text-[8pt] font-black mt-2 text-gray-500 tracking-[0.3em] uppercase">GassPoll Matika</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <QrCode size={60} className="text-gray-800" />
                    </div>
                    <p className="text-[7pt] font-bold text-gray-400 text-center uppercase leading-tight">
                      Verifikasi Resmi
                    </p>
                  </div>
                </div>
             </div>
          </PageWrapper>
        );
      default: return null;
    }
  };

  return (
    <div className="print-preview-shell min-h-screen bg-gray-900/10 backdrop-blur-md fixed inset-0 z-50 no-print overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="w-full bg-white p-4 md:p-6 shadow-md border-b z-30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-gray-100"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>
            <div className="hidden md:block h-8 w-[1px] bg-gray-200"></div>
            <div className="text-left">
               <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">Pratinjau Dokumen</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">A4 Scale Preview Active</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
             <button 
               onClick={() => handleExport('pdf')}
               disabled={!!isExporting}
               className="flex items-center gap-2 px-5 py-3 rounded-xl font-black bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all transform active:scale-95 disabled:opacity-50 text-xs"
             >
               {isExporting === 'pdf' ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
               Simpan PDF
             </button>
             <button 
               onClick={() => handleExport('png')}
               disabled={!!isExporting}
               className="flex items-center gap-2 px-5 py-3 rounded-xl font-black bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all transform active:scale-95 disabled:opacity-50 text-xs"
             >
               {isExporting === 'png' ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
               Simpan PNG
             </button>
             <button 
               onClick={() => handleExport('jpg')}
               disabled={!!isExporting}
               className="flex items-center gap-2 px-5 py-3 rounded-xl font-black bg-gray-800 text-white shadow-lg hover:bg-black transition-all transform active:scale-95 disabled:opacity-50 text-xs"
             >
               {isExporting === 'jpg' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
               Simpan JPG
             </button>
          </div>
        </div>
        <div className="print-preview-scroll flex-1 overflow-auto bg-gray-900/5 p-4 md:p-10 scroll-smooth">
          <div ref={printRef} className="document-container flex flex-col items-center gap-8 w-full" id="printArea">
            {renderDocument()}
          </div>
        </div>
      </div>
      <style>{`
        .print-preview-shell { width: 100%; height: 100%; }
        .print-preview-scroll { width: 100%; height: calc(100vh - 90px); overflow: auto; padding: 12px; box-sizing: border-box; }
        .print-scale { margin: 0 auto; width: 210mm; height: auto; display: flex; flex-direction: column; }
        .print-scale.landscape { width: 297mm; }
        .print-page { width: 210mm; min-height: 297mm; background: #fff; margin: 0 auto; border-radius: 16px; box-shadow: 0 12px 30px rgba(0,0,0,0.12); padding: 14mm 12mm 22mm 12mm; box-sizing: border-box; position: relative; display: flex; flex-direction: column; overflow: visible !important; }
        .landscape .print-page { width: 297mm; min-height: 210mm; }
        .print-content { position: relative; z-index: 1; flex: 1; width: 100%; overflow: visible !important; page-break-inside: auto; }
        .print-footer { margin-top: 10mm; padding-top: 3mm; border-top: 1px solid #E5E7EB; font-weight: 700; font-size: 11pt; text-align: center; color: #4B5563; position: static !important; }
        .watermark { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(-12deg); width: 72%; opacity: 0.06; z-index: 0; pointer-events: none; text-align: center; }
        .watermark-text { font-size: 80pt; font-weight: 900; line-height: 1; text-transform: uppercase; color: #6B7280; }
        .avoid-break { break-inside: avoid !important; page-break-inside: avoid !important; }
        @media (max-width: 768px) {
          .print-scale:not(.landscape) { transform-origin: top center; transform: scale(0.62); width: 210mm; margin: 0 auto; }
          .print-scale.landscape { transform-origin: top center; transform: scale(0.48); width: 297mm; margin: 0 auto; }
        }
        @media print {
          @page { size: A4 portrait; margin: 0; }
          .landscape @page { size: A4 landscape; }
          html, body { height: auto !important; min-height: auto !important; overflow: visible !important; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-preview-scroll { overflow: visible !important; height: auto !important; padding: 0 !important; }
          .print-scale { transform: none !important; width: auto !important; margin: 0 !important; }
          .print-page { width: 100% !important; min-height: 297mm !important; height: auto !important; margin: 0 !important; padding: 14mm 12mm 22mm 12mm !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; position: relative !important; overflow: visible !important; page-break-after: always !important; }
          .print-footer { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintPreviewView;