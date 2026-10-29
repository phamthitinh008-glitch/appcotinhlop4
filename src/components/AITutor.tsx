import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Lightbulb, 
  CheckCircle, 
  HelpCircle, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Subject } from '../types';
import { speechService } from '../utils/speech';
import confetti from 'canvas-confetti';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  level?: 1 | 2 | 3;
  timestamp: string;
}

interface AITutorProps {
  currentStudentName: string;
}

const SUBJECTS: Subject[] = [
  'Toán',
  'Tiếng Việt',
  'Khoa học',
  'Lịch sử và Địa lí',
  'Tiếng Anh',
  'Tin học',
  'Công nghệ',
  'Đạo đức',
  'Hoạt động trải nghiệm',
];

export const AITutor: React.FC<AITutorProps> = ({ currentStudentName }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Toán');
  const [supportLevel, setSupportLevel] = useState<1 | 2 | 3>(2);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'bot',
      text: `Xin chào ${currentStudentName}! Robot AI mắt xanh rất vui được đồng hành cùng em. Hôm nay em muốn cùng Robot khám phá bài toán hay câu hỏi môn nào?`,
      timestamp: 'Vừa xong',
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          subject: selectedSubject,
          level: supportLevel,
          studentName: currentStudentName,
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: data.reply || data.fallbackReply || 'Robot AI đã nhận được câu hỏi của em!',
        level: supportLevel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
      speechService.speak(botMsg.text);
    } catch (e: any) {
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: `Chào ${currentStudentName}! Với câu hỏi này, em hãy thử quan sát dữ kiện bài học môn ${selectedSubject} nhé! Chúng mình cùng cố gắng từng bước nào!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickChip = (action: string) => {
    let prompt = '';
    if (action === 'understood') {
      prompt = 'Em đã hiểu rồi ạ! Cảm ơn Robot AI!';
      confetti({ particleCount: 40, spread: 50 });
      speechService.praiseCorrect();
    } else if (action === 'retry') {
      prompt = 'Em vẫn chưa hiểu rõ lắm, Robot AI giải thích lại giúp em với nhé!';
    } else if (action === 'example') {
      prompt = 'Robot AI cho em xin thêm một ví dụ tương tự để em thử làm nhé!';
    } else if (action === 'practice') {
      prompt = 'Robot AI hãy cho em một bài toán luyện tập thêm nhé!';
    }
    handleSend(prompt);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 flex flex-col h-[750px]">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Animated 3D Robot Avatar with Blue Eyes */}
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex flex-col items-center justify-center p-1 relative overflow-hidden">
                {/* Robot Antenna */}
                <div className="w-1.5 h-2 bg-amber-400 rounded-full mb-0.5 animate-pulse" />
                {/* Robot Eyes (Glowing Blue) */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping" style={{ animationDuration: '3s' }} />
                </div>
                {/* Robot Smile */}
                <div className="w-4 h-1 bg-cyan-200 rounded-full" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
              <Sparkles className="w-3 h-3 text-blue-500" />
              GIA SƯ AI LỚP 4C
            </div>
            <h2 className="text-xl font-black text-slate-800">
              Robot AI Thông Minh Mắt Xanh
            </h2>
            <p className="text-xs text-slate-500">
              Chương trình GDPT 2018 • Hướng dẫn tư duy từng bước
            </p>
          </div>
        </div>

        {/* 3 Support Levels */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
          <span className="text-[11px] font-bold text-slate-500 px-2">Mức hỗ trợ:</span>
          <button
            onClick={() => setSupportLevel(1)}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              supportLevel === 1 ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Gợi ý nhẹ
          </button>
          <button
            onClick={() => setSupportLevel(2)}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              supportLevel === 2 ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Từng bước
          </button>
          <button
            onClick={() => setSupportLevel(3)}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              supportLevel === 3 ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Chi tiết & Tương tự
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-100">
        <span className="text-xs font-bold text-slate-400 shrink-0">Môn học:</span>
        {SUBJECTS.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition ${
              selectedSubject === sub
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'bot' && (
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-sm">
                AI
              </div>
            )}

            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-4 text-xs md:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-md font-medium'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              <div
                className={`mt-2 flex items-center justify-between text-[10px] ${
                  m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                <span>{m.timestamp}</span>
                {m.sender === 'bot' && (
                  <button
                    onClick={() => speechService.speak(m.text)}
                    className="hover:text-blue-600 flex items-center gap-1 font-semibold ml-2"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Đọc bằng tiếng Việt
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl w-fit">
            <Bot className="w-4 h-4 text-blue-500 animate-bounce" />
            <span>Robot AI mắt xanh đang suy nghĩ gợi ý cho em...</span>
          </div>
        )}
      </div>

      {/* Action Chips */}
      <div className="pt-2 pb-3 flex flex-wrap gap-2 border-t border-slate-100">
        <button
          onClick={() => handleQuickChip('understood')}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Em đã hiểu!
        </button>
        <button
          onClick={() => handleQuickChip('retry')}
          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Giải thích lại
        </button>
        <button
          onClick={() => handleQuickChip('example')}
          className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 flex items-center gap-1"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Cho ví dụ khác
        </button>
        <button
          onClick={() => handleQuickChip('practice')}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Luyện tập thêm
        </button>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Hỏi Robot AI về môn ${selectedSubject} (vd: Em chưa hiểu cách cộng phân số khác mẫu số)...`}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl shadow-md transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
