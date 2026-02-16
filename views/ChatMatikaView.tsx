import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile, ChatMessage, DiagramSpec } from '../types';
import { sendChatMatikaMessage } from '../services/geminiService';
import { Send, Sparkles, Book, FileText, LayoutGrid, User, Bot, Loader2, MessageSquare, Image as ImageIcon, Printer, Download, FileJson } from 'lucide-react';
// External libraries for export
import html2canvas from 'https://esm.sh/html2canvas@1.4.1';
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1';

interface ChatMatikaViewProps {
  theme: any;
  profile: StudentProfile;
}

const TOPICS = [
  'Operasi', 'Pecahan', 'FPB/KPK', 'SJT', 
  'Bangun Datar', 'Bangun Ruang', 'Statistika', 'Logika & Pola'
];

// Helper to render WhatsApp style bolding (*text*)
const renderMessageText = (text: string) => {
  if (!text) return null;
  
  // Split by *...* to find potential bold text
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
    <div className="flex flex-col gap-3 max-w-full">
      <div 
        ref={diagramRef}
        className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden shadow-md w-full max-w-[480px]"
      >
        <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
          <div>
            <h4 className="font-black text-gray-800 text-sm leading-tight">{spec.title}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{spec.topic}</p>
          </div>
          <div className="flex gap-1 no-print">
            <button 
              onClick={() => handleExport('png')}
              disabled={!!exporting}
              className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-green-500 transition-colors"
              title="Simpan PNG"
            >
              {exporting === 'png' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            </button>
            <button 
              onClick={handlePrintDiagram}
              className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-blue-500 transition-colors"
              title="Cetak/Simpan PDF"
            >
              <Printer size={16} />
            </button>
          </div>
        </div>
        <div 
          className="p-6 flex justify-center bg-white aspect-[900/520] relative" 
          dangerouslySetInnerHTML={{ __html: spec.svg.replace('<svg', '<svg style="width:100%; height:auto;"') }} 
        />
      </div>
      <div className="p-4 bg-blue-50/80 backdrop-blur-sm border-2 border-blue-100/50 rounded-2xl italic text-xs text-blue-900 leading-relaxed shadow-sm max-w-[480px]">
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([{
        role: 'assistant',
        text: `Halo ${profile.name || 'Sobat Matika'}! Aku Kak Chat Matika 😊\nKamu mau belajar topik apa hari ini? Kamu bisa pilih chip di atas atau langsung tanya ya.`,
        timestamp: Date.now()
      }]);
    }
  }, [profile.name]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory, loading]);

  const handleSendMessage = async (customText?: string) => {
    const text = customText || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: text.trim(),
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await sendChatMatikaMessage(
        chatHistory,
        text.trim(),
        profile.grade,
        selectedTopic
      );

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: response,
        timestamp: Date.now()
      };

      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectTopic = (topic: string) => {
    setSelectedTopic(topic);
    const systemInfo: ChatMessage = {
      role: 'system',
      text: `Topik dipilih: ${topic}`,
      timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, systemInfo]);
  };

  const requestQuickFormula = () => {
    if (!selectedTopic) {
      const warning: ChatMessage = {
        role: 'assistant',
        text: "Pilih topik dulu ya 😊 (klik chip di atas)",
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, warning]);
      return;
    }
    handleSendMessage(`Berikan rumus cepat dan contoh singkat untuk topik ${selectedTopic} kelas ${profile.grade}`);
  };

  const requestMCQs = () => {
    if (!selectedTopic) {
      const warning: ChatMessage = {
        role: 'assistant',
        text: "Pilih topik dulu ya 😊 (klik chip di atas)",
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, warning]);
      return;
    }
    handleSendMessage(`Buat 5 soal pilihan ganda A–D untuk topik ${selectedTopic} kelas ${profile.grade} lengkap dengan kunci dan pembahasannya.`);
  };

  const requestVisual = () => {
    if (!selectedTopic) {
      const warning: ChatMessage = {
        role: 'assistant',
        text: "Pilih topik dulu ya 😊 (klik chip di atas)",
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, warning]);
      return;
    }
    handleSendMessage(`Kak, buatkan gambar atau diagram visual untuk materi ${selectedTopic} kelas ${profile.grade}.`);
  };

  const renderBubbleContent = (msg: ChatMessage) => {
    if (msg.role === 'assistant' && msg.text.trim().startsWith('{') && msg.text.trim().endsWith('}')) {
      try {
        const spec = JSON.parse(msg.text.trim());
        if (spec.type === 'diagram_spec') {
          return <DiagramRenderer spec={spec as DiagramSpec} theme={theme} />;
        }
      } catch (e) {
        // Fallback
      }
    }
    return (
      <div className={`p-4 rounded-[1.8rem] shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
        msg.role === 'user' 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : 'bg-white text-gray-800 border-2 border-white/80 rounded-tl-none shadow-sm'
      }`}>
        {renderMessageText(msg.text)}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto space-y-4">
      <div className="text-center space-y-1 py-2 no-print">
         <h2 className={`text-3xl font-black ${theme.text} flex items-center justify-center gap-2`}>
           <MessageSquare className="text-blue-500 fill-blue-50" size={32} /> Chat Matika
         </h2>
         <p className="text-gray-500 text-sm">Tanya apa saja tentang TKA & Matematika SD 😊</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 py-2 overflow-x-auto no-scrollbar no-print px-4">
        {TOPICS.map(topic => (
          <button
            key={topic}
            onClick={() => selectTopic(topic)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all whitespace-nowrap ${
              selectedTopic === topic 
                ? `${theme.primary} text-white border-transparent shadow-md scale-105` 
                : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-blue-50/30'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/50 backdrop-blur-md rounded-[2.5rem] border-2 border-white shadow-inner scroll-smooth"
      >
        {chatHistory.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            {msg.role === 'system' ? (
              <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-200/50 px-4 py-1 rounded-full border border-gray-100 tracking-widest">
                {msg.text}
              </span>
            ) : (
              <div className={`flex gap-3 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-500 text-white border-blue-400' : `${theme.primary} text-white border-white/20`
                }`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                {renderBubbleContent(msg)}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
             <div className="flex gap-3 max-w-[85%]">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/20 ${theme.primary} text-white shadow-sm`}>
                   <Bot size={20} />
                </div>
                <div className="p-4 bg-white border-2 border-white/80 rounded-[1.8rem] rounded-tl-none shadow-sm flex items-center gap-3">
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                   </div>
                   <span className="text-xs font-bold text-gray-400 italic">Kak Chat Matika sedang mikir...</span>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-md p-4 rounded-[2.5rem] border-2 border-white shadow-xl space-y-3 no-print mx-2 md:mx-0">
        <div className="flex flex-wrap gap-2 px-2">
           <button 
             onClick={requestQuickFormula}
             disabled={loading}
             className="px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:border-blue-200 hover:text-blue-500 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
           >
              <FileText size={14} /> Rumus Cepat
           </button>
           <button 
             onClick={requestMCQs}
             disabled={loading}
             className="px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:border-blue-200 hover:text-blue-500 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
           >
              <LayoutGrid size={14} /> Buat 5 Soal PG
           </button>
           <button 
             onClick={requestVisual}
             disabled={loading}
             className="px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:border-blue-200 hover:text-blue-500 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
           >
              <ImageIcon size={14} /> Buatkan Visual
           </button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tulis pertanyaanmu… (misal: buat gambar pecahan 1/2)"
            disabled={loading}
            className="flex-1 px-6 py-4 bg-white border-2 border-gray-50 rounded-[1.5rem] outline-none focus:border-blue-300 focus:bg-blue-50/20 transition-all text-sm shadow-inner disabled:opacity-50"
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
            className={`p-4 rounded-[1.5rem] shadow-lg transition-all active:scale-90 disabled:opacity-50 disabled:scale-100 ${theme.button}`}
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMatikaView;