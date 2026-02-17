import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile, ChatMessage, DiagramSpec } from '../types';
import { sendChatMatikaMessage } from '../services/geminiService';
import { Send, Sparkles, User, Bot, Loader2, Image as ImageIcon, Printer, Download, Plus, X, RotateCcw, FileText, LayoutGrid, Wand2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ChatMatikaViewProps {
  theme: any;
  profile: StudentProfile;
}

const TOPICS = [
  { id: 'Operasi', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { id: 'Pecahan', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { id: 'FPB/KPK', color: 'bg-green-50 text-green-600 border-green-100' },
  { id: 'SJT', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { id: 'Bangun Datar', color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { id: 'Bangun Ruang', color: 'bg-teal-50 text-teal-600 border-teal-100' },
  { id: 'Statistika', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  { id: 'Logika', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' }
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

// Diagram Renderer Component (Separated for cleaner code)
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
      const canvas = await html2canvas(diagramRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
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
    } catch (err) { console.error("Export failed", err); } finally { setExporting(null); }
  };

  return (
    <div className="flex flex-col gap-3 max-w-full my-2 animate-in zoom-in-95 duration-300">
      <div ref={diagramRef} className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden shadow-lg w-full max-w-[400px] mx-auto">
        <div className="p-3 border-b bg-gray-50/50 flex justify-between items-center">
          <div><h4 className="font-black text-gray-800 text-xs leading-tight">{spec.title}</h4><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{spec.topic}</p></div>
          <div className="flex gap-1 no-print">
            <button onClick={() => handleExport('png')} disabled={!!exporting} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-green-500 transition-colors">{exporting === 'png' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}</button>
            <button onClick={handlePrintDiagram} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-blue-500 transition-colors"><Printer size={14} /></button>
          </div>
        </div>
        <div className="p-4 flex justify-center bg-white aspect-[900/520] relative" dangerouslySetInnerHTML={{ __html: spec.svg.replace('<svg', '<svg style="width:100%; height:auto;"') }} />
      </div>
      <div className="p-3 bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-2xl italic text-xs text-blue-900 leading-relaxed shadow-sm w-full max-w-[400px] mx-auto">{renderMessageText(spec.caption)}</div>
    </div>
  );
};

const ChatMatikaView: React.FC<ChatMatikaViewProps> = ({ theme, profile }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Greeting with Topic Chips integrated as message
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([{
        role: 'assistant',
        text: `Halo ${profile.name || 'Sobat'}! Aku Kak Chat Matika. 👋\n\nKamu mau belajar topik apa hari ini? Klik salah satu di bawah ini ya! 👇`,
        timestamp: Date.now()
      }]);
    }
  }, [profile.name]);

  // Auto Scroll
  useEffect(() => {
    if (scrollRef.current) { 
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); 
    }
  }, [chatHistory, loading, showQuickActions]);

  const handleSendMessage = async (customText?: string) => {
    const text = customText || inputText;
    if (!text.trim() || loading) return;

    setShowQuickActions(false);

    const userMsg: ChatMessage = { role: 'user', text: text.trim(), timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    
    try {
      const response = await sendChatMatikaMessage(chatHistory, text.trim(), profile.grade, selectedTopic);
      const assistantMsg: ChatMessage = { role: 'assistant', text: response, timestamp: Date.now() };
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const selectTopic = (topic: string) => {
    setSelectedTopic(topic);
    const startMsg = `Aku mau belajar tentang ${topic} dong, Kak.`;
    handleSendMessage(startMsg);
  };

  const handleQuickAction = (action: 'formula' | 'mcq' | 'visual') => {
    const promptPrefix = selectedTopic ? `Untuk topik ${selectedTopic}: ` : `Untuk matematika kelas ${profile.grade}: `;
    
    if (action === 'formula') handleSendMessage(promptPrefix + "Berikan rumus cepat dan ringkasan materinya.");
    if (action === 'mcq') handleSendMessage(promptPrefix + "Buatkan 1 soal latihan PG beserta kunci jawabannya.");
    if (action === 'visual') handleSendMessage(promptPrefix + "Gambarkan diagram atau visualisasinya.");
    
    setShowQuickActions(false);
  };

  const resetChat = () => {
    setChatHistory([{
      role: 'assistant',
      text: `Halo lagi! Mau bahas topik baru? Silakan pilih:`,
      timestamp: Date.now()
    }]);
    setSelectedTopic(null);
    setShowQuickActions(false);
  };

  const renderBubbleContent = (msg: ChatMessage) => {
    // Check for Diagram Spec
    if (msg.role === 'assistant' && msg.text.trim().startsWith('{') && msg.text.trim().endsWith('}')) {
      try { 
        const spec = JSON.parse(msg.text.trim()); 
        if (spec.type === 'diagram_spec') return <DiagramRenderer spec={spec as DiagramSpec} theme={theme} />; 
      } catch (e) {}
    }
    return (
      <div className={`px-5 py-3.5 rounded-3xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? `${theme.button} text-white rounded-tr-sm` : 'bg-white text-gray-800 border-2 border-gray-100 rounded-tl-sm'}`}>
        {renderMessageText(msg.text)}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] max-w-3xl mx-auto -mt-2">
      
      {/* 1. Minimalist Header */}
      <div className="flex justify-between items-center px-4 py-2 shrink-0">
         <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-xs font-black uppercase text-gray-400 tracking-widest">
              {selectedTopic ? `Topik: ${selectedTopic}` : 'Chat Matika'}
            </span>
         </div>
         {chatHistory.length > 2 && (
           <button onClick={resetChat} className="text-[10px] font-bold text-gray-400 bg-gray-100 hover:bg-red-50 hover:text-red-500 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
             <RotateCcw size={12} /> Reset
           </button>
         )}
      </div>

      {/* 2. Chat Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-white/40 rounded-t-[2.5rem] md:rounded-[2.5rem] border-x border-t border-white/50 shadow-sm backdrop-blur-sm">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-4">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`space-y-2 animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[92%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 shadow-sm self-end mb-1 ${msg.role === 'user' ? 'bg-gray-800 text-white border-gray-700' : `${theme.primary} text-white border-white/20`}`}>
                       {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                    </div>
                    {renderBubbleContent(msg)}
                  </div>
              </div>

              {/* Show Topic Grid ONLY after the FIRST welcome message */}
              {i === 0 && chatHistory.length === 1 && (
                 <div className="pl-12 pr-4 grid grid-cols-2 md:grid-cols-4 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                    {TOPICS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => selectTopic(t.id)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all hover:scale-105 active:scale-95 flex items-center justify-between group ${t.color} hover:shadow-sm bg-white`}
                      >
                        <span className="font-bold text-xs">{t.id}</span>
                        <div className="w-5 h-5 rounded-full bg-white/50 flex items-center justify-center">
                           <LayoutGrid size={12} className="opacity-50" />
                        </div>
                      </button>
                    ))}
                 </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start pl-11">
              <div className="px-4 py-3 bg-gray-50/80 rounded-3xl rounded-tl-sm flex items-center gap-2 border border-gray-100">
                 <Loader2 className="animate-spin text-gray-400" size={16} />
                 <span className="text-xs font-bold text-gray-400 animate-pulse">Mengetik...</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Footer: Input Area (Raised for Mobile) */}
        {/* Added pb-28 for mobile to clear floating nav, and background to separate from chat */}
        <div className="shrink-0 p-4 pb-28 md:pb-4 relative z-20 bg-white/80 backdrop-blur-md border-t border-white/50 rounded-b-[2.5rem]">
           
           {/* Expandable Quick Actions (Horizontal) */}
           {showQuickActions && (
             <div className="absolute bottom-full left-3 right-3 mb-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-2 flex gap-2 overflow-x-auto scrollbar-hide animate-in slide-in-from-bottom-2 zoom-in-95">
                <button onClick={() => handleQuickAction('formula')} className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors whitespace-nowrap border border-blue-100">
                   <FileText size={18} /> <span className="text-xs font-black">Rumus</span>
                </button>
                <button onClick={() => handleQuickAction('mcq')} className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors whitespace-nowrap border border-green-100">
                   <LayoutGrid size={18} /> <span className="text-xs font-black">Buat Soal</span>
                </button>
                <button onClick={() => handleQuickAction('visual')} className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors whitespace-nowrap border border-purple-100">
                   <ImageIcon size={18} /> <span className="text-xs font-black">Visual</span>
                </button>
             </div>
           )}
  
           <div className="flex gap-2 items-end">
              {/* Magic Toggle Button */}
              <button 
                onClick={() => setShowQuickActions(!showQuickActions)}
                className={`p-3.5 rounded-[1.2rem] shadow-sm transition-all active:scale-95 flex items-center justify-center border-2 ${showQuickActions ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-yellow-500 border-yellow-200 hover:border-yellow-400'}`}
              >
                {showQuickActions ? <X size={20} /> : <Wand2 size={20} className={!showQuickActions ? "animate-pulse" : ""} />}
              </button>
  
              {/* Input Field */}
              <div className="flex-1 bg-white rounded-[1.5rem] border-2 border-gray-200 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm flex items-center px-4 py-1.5">
                 <input 
                   type="text" 
                   value={inputText} 
                   onChange={(e) => setInputText(e.target.value)} 
                   onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                   placeholder={chatHistory.length <= 1 ? "Pilih topik di atas atau ketik..." : "Tanya Kak Matika..."}
                   disabled={loading} 
                   className="flex-1 py-3 bg-transparent outline-none text-base font-bold text-gray-700 placeholder:text-gray-300" 
                 />
                 <button 
                   onClick={() => handleSendMessage()} 
                   disabled={!inputText.trim() || loading} 
                   className={`p-2.5 rounded-xl transition-all ${inputText.trim() ? 'bg-blue-600 text-white shadow-md scale-100' : 'bg-gray-50 text-gray-300 scale-90'}`}
                 >
                   <Send size={20} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMatikaView;