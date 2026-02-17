import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile, ChatMessage, DiagramSpec } from '../types';
import { sendChatMatikaMessage } from '../services/geminiService';
import { Send, Sparkles, Book, FileText, LayoutGrid, User, Bot, Loader2, MessageSquare, Image as ImageIcon, Printer, Download, Wand2, X, RotateCcw, ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ChatMatikaViewProps {
  theme: any;
  profile: StudentProfile;
}

const TOPICS = [
  { id: 'Operasi', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { id: 'Pecahan', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { id: 'FPB/KPK', color: 'bg-green-100 text-green-600 border-green-200' },
  { id: 'SJT', color: 'bg-purple-100 text-purple-600 border-purple-200' },
  { id: 'Bangun Datar', color: 'bg-pink-100 text-pink-600 border-pink-200' },
  { id: 'Bangun Ruang', color: 'bg-teal-100 text-teal-600 border-teal-200' },
  { id: 'Statistika', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
  { id: 'Logika', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' }
];

const renderMessageText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={i} className="font-black">{part.slice(1, -1)}</strong>;
    }
    return part;
  });
};

const DiagramRenderer: React.FC<{ spec: DiagramSpec, theme: any }> = ({ spec, theme }) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const handlePrintDiagram = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${spec.title}</title>
            <style>
              body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 40px; }
              svg { max-width: 100%; height: auto; border: 1px solid #eee; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
              h1 { margin-bottom: 20px; color: #333; font-size: 24px; }
              p { max-width: 600px; text-align: center; color: #666; font-style: italic; white-space: pre-wrap; font-size: 14px; }
            </style>
          </head>
          <body>
            <h1>${spec.title}</h1>
            ${spec.svg}
            <p>${spec.caption}</p>
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleExport = async (format: 'png' | 'pdf') => {
    if (!diagramRef.current) return;
    setExporting(format);
    try {
      const canvas = await html2canvas(diagramRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      const filename = `${spec.title.replace(/\s+/g, '_')}_GassPoll`;
      if (format === 'png') {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${filename}.png`;
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${filename}.pdf`);
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 max-w-full my-2">
      <div 
        ref={diagramRef}
        className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden shadow-lg w-full max-w-[400px] mx-auto"
      >
        <div className="p-3 border-b bg-gray-50/50 flex justify-between items-center">
          <div>
            <h4 className="font-black text-gray-800 text-xs leading-tight">{spec.title}</h4>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{spec.topic}</p>
          </div>
          <div className="flex gap-1 no-print">
            <button onClick={() => handleExport('png')} disabled={!!exporting} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-green-500 transition-colors">
              {exporting === 'png' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            </button>
            <button onClick={handlePrintDiagram} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-blue-500 transition-colors">
              <Printer size={14} />
            </button>
          </div>
        </div>
        <div className="p-4 flex justify-center bg-white aspect-[900/520] relative" dangerouslySetInnerHTML={{ __html: spec.svg.replace('<svg', '<svg style="width:100%; height:auto;"') }} />
      </div>
      <div className="p-3 bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-2xl italic text-xs text-blue-900 leading-relaxed shadow-sm w-full max-w-[400px] mx-auto">
        {renderMessageText(spec.caption)}
      </div>
    </div>
  );
};

const ChatMatikaView: React.FC<ChatMatikaViewProps> = ({ theme, profile }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMagicMenu, setShowMagicMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Greeting
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([{
        role: 'assistant',
        text: `Halo ${profile.name || 'Sobat'}! Aku Kak Chat Matika.`,
        timestamp: Date.now()
      }]);
    }
  }, [profile.name]);

  // Auto Scroll
  useEffect(() => {
    if (scrollRef.current) { 
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); 
    }
  }, [chatHistory, loading]);

  const handleSendMessage = async (customText?: string) => {
    const text = customText || inputText;
    if (!text.trim() || loading) return;

    // Hide magic menu if open
    setShowMagicMenu(false);

    const userMsg: ChatMessage = { role: 'user', text: text.trim(), timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    
    try {
      const response = await sendChatMatikaMessage(chatHistory, text.trim(), profile.grade, selectedTopic);
      const assistantMsg: ChatMessage = { role: 'assistant', text: response, timestamp: Date.now() };
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const selectTopic = (topic: string) => {
    setSelectedTopic(topic);
    // Send a system-like message visually, but actual prompt to AI
    const startMsg = `Aku mau belajar tentang ${topic} dong, Kak.`;
    handleSendMessage(startMsg);
  };

  const handleQuickAction = (action: 'formula' | 'mcq' | 'visual') => {
    if (!selectedTopic) {
       // If no topic selected yet, ask user to pick one or just describe general
       if (action === 'formula') handleSendMessage(`Berikan rumus matematika penting untuk kelas ${profile.grade}`);
       if (action === 'mcq') handleSendMessage(`Buatkan soal latihan matematika umum untuk kelas ${profile.grade}`);
       if (action === 'visual') handleSendMessage(`Buatkan gambar diagram matematika menarik untuk kelas ${profile.grade}`);
    } else {
       if (action === 'formula') handleSendMessage(`Berikan rumus cepat dan contoh untuk ${selectedTopic} kelas ${profile.grade}`);
       if (action === 'mcq') handleSendMessage(`Buat soal PG tentang ${selectedTopic} kelas ${profile.grade} dengan kunci jawaban`);
       if (action === 'visual') handleSendMessage(`Gambarkan diagram visual untuk menjelaskan ${selectedTopic}`);
    }
    setShowMagicMenu(false);
  };

  const resetChat = () => {
    setChatHistory([{
      role: 'assistant',
      text: `Halo lagi ${profile.name}! Mau bahas topik apa sekarang?`,
      timestamp: Date.now()
    }]);
    setSelectedTopic(null);
  };

  const renderBubbleContent = (msg: ChatMessage) => {
    if (msg.role === 'assistant' && msg.text.trim().startsWith('{') && msg.text.trim().endsWith('}')) {
      try { 
        const spec = JSON.parse(msg.text.trim()); 
        if (spec.type === 'diagram_spec') return <DiagramRenderer spec={spec as DiagramSpec} theme={theme} />; 
      } catch (e) {}
    }
    return (
      <div className={`px-5 py-3.5 rounded-3xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? `${theme.button} text-white rounded-tr-md` : 'bg-white text-gray-800 border-2 border-white/60 rounded-tl-md'}`}>
        {renderMessageText(msg.text)}
      </div>
    );
  };

  const isChatStarted = chatHistory.length > 1;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] max-w-3xl mx-auto">
      
      {/* 1. Header Ringkas */}
      <div className="flex justify-between items-center py-2 px-1 mb-2 shrink-0">
         <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${theme.primary} text-white shadow-sm`}>
              <Bot size={20} />
            </div>
            <div>
               <h2 className={`text-lg font-black ${theme.text} leading-none`}>Chat Matika</h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                 {selectedTopic ? `Topik: ${selectedTopic}` : 'Pilih Topik Belajar'}
               </p>
            </div>
         </div>
         {isChatStarted && (
           <button 
             onClick={resetChat}
             className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-all"
             title="Mulai Ulang"
           >
             <RotateCcw size={18} />
           </button>
         )}
      </div>

      {/* 2. Chat Area (Expanded) */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Welcome Screen (Topics Grid) - Only show if chat hasn't started */}
        {!isChatStarted ? (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
             <div className="text-center space-y-2 mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-lg shadow-blue-200">
                   <MessageSquare size={32} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-800">Mau belajar apa hari ini?</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Pilih topik di bawah ini biar Kak Chat Matika bisa bantu kamu lebih cepat!</p>
             </div>
             
             <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTopic(t.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all hover:scale-105 active:scale-95 flex items-center justify-between group ${t.color} hover:bg-white hover:shadow-md`}
                  >
                    <span className="font-bold text-sm">{t.id}</span>
                    <ChevronRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
             </div>
          </div>
        ) : (
          /* Actual Chat History */
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-20">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                {msg.role === 'system' ? (
                  <span className="text-[9px] font-black uppercase text-gray-400 bg-gray-100 px-3 py-1 rounded-full tracking-widest">{msg.text}</span> 
                ) : (
                  <div className={`flex gap-3 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 shadow-sm self-end mb-1 ${msg.role === 'user' ? 'bg-gray-800 text-white border-gray-700' : `${theme.primary} text-white border-white/20`}`}>
                       {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                    </div>
                    {renderBubbleContent(msg)}
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start animate-pulse pl-11">
                <div className="px-5 py-3 bg-gray-100 rounded-3xl rounded-tl-none flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Footer: Magic Input Area */}
      <div className="shrink-0 p-3 pt-0 relative z-20">
         
         {/* Magic Menu Popup */}
         {showMagicMenu && (
           <div className="absolute bottom-full left-4 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 min-w-[200px] animate-in slide-in-from-bottom-2 zoom-in-95">
              <button onClick={() => handleQuickAction('formula')} className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl text-left transition-colors group">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"><FileText size={16} /></div>
                 <div><p className="font-bold text-gray-800 text-xs">Rumus Cepat</p><p className="text-[10px] text-gray-400">Dapat ringkasan rumus</p></div>
              </button>
              <button onClick={() => handleQuickAction('mcq')} className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl text-left transition-colors group">
                 <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:scale-110 transition-transform"><LayoutGrid size={16} /></div>
                 <div><p className="font-bold text-gray-800 text-xs">Buat Soal PG</p><p className="text-[10px] text-gray-400">Latihan ujian</p></div>
              </button>
              <button onClick={() => handleQuickAction('visual')} className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl text-left transition-colors group">
                 <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:scale-110 transition-transform"><ImageIcon size={16} /></div>
                 <div><p className="font-bold text-gray-800 text-xs">Minta Gambar</p><p className="text-[10px] text-gray-400">Penjelasan visual</p></div>
              </button>
              <div className="border-t my-1"></div>
              <button onClick={() => setShowMagicMenu(false)} className="text-center text-[10px] font-bold text-gray-400 py-1 hover:text-red-500">Tutup Menu</button>
           </div>
         )}

         <div className="flex gap-2 items-end">
            {/* Magic Button */}
            <button 
              onClick={() => setShowMagicMenu(!showMagicMenu)}
              className={`p-3.5 rounded-[1.2rem] shadow-md transition-all active:scale-95 flex items-center justify-center border-2 ${showMagicMenu ? 'bg-yellow-400 text-white border-yellow-500 rotate-12' : 'bg-white text-yellow-500 border-yellow-100 hover:border-yellow-300'}`}
              title="Menu Ajaib"
            >
              {showMagicMenu ? <X size={24} /> : <Wand2 size={24} />}
            </button>

            {/* Input Field */}
            <div className="flex-1 bg-white rounded-[1.5rem] border-2 border-gray-100 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm flex items-center px-4 py-1">
               <input 
                 type="text" 
                 value={inputText} 
                 onChange={(e) => setInputText(e.target.value)} 
                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                 placeholder={isChatStarted ? "Ketik pertanyaanmu..." : "Pilih topik di atas..."}
                 disabled={loading} 
                 className="flex-1 py-3 bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400" 
               />
               <button 
                 onClick={() => handleSendMessage()} 
                 disabled={!inputText.trim() || loading} 
                 className={`p-2 rounded-xl transition-all ${inputText.trim() ? 'bg-blue-600 text-white shadow-md scale-100' : 'bg-gray-100 text-gray-300 scale-90'}`}
               >
                 <Send size={18} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ChatMatikaView;