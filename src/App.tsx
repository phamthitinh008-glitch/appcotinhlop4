import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  BookOpen, 
  Trophy, 
  Palette, 
  Users, 
  FileText, 
  BarChart3, 
  Award, 
  Volume2, 
  VolumeX, 
  Compass, 
  ShieldCheck, 
  Layers, 
  GraduationCap, 
  Flame, 
  CheckCircle2, 
  Heart,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Play,
  FileCheck
} from 'lucide-react';
import { 
  INITIAL_STUDENTS, 
  INITIAL_GROUPS, 
  INITIAL_TEACHER, 
  INITIAL_TASKS, 
  INITIAL_RESOURCES, 
  INITIAL_CREATIONS 
} from './data/initialData';
import { Student, Group, TeacherProfile, LearningTask, ResourceItem, StudentCreation, UserRole } from './types';
import { speechService } from './utils/speech';
import confetti from 'canvas-confetti';

// Subcomponents
import { AITutor } from './components/AITutor';
import { GamesHub } from './components/GamesHub';
import { CreativeStudio } from './components/CreativeStudio';
import { ClassManagement } from './components/ClassManagement';
import { LearningJourney } from './components/LearningJourney';
import { ResourceLibrary } from './components/ResourceLibrary';
import { CreationsGallery } from './components/CreationsGallery';
import { Evidence2026 } from './components/Evidence2026';
import { StudentPortal } from './components/StudentPortal';
import { ParentPortal } from './components/ParentPortal';

type ActiveTab = 
  | 'home'
  | 'tutor'
  | 'journey'
  | 'games'
  | 'creative'
  | 'library'
  | 'tasks'
  | 'gallery'
  | 'class'
  | 'evidence';

export default function App() {
  // Persistence in LocalStorage
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('smartclass4c_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('smartclass4c_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [teacher, setTeacher] = useState<TeacherProfile>(() => {
    const saved = localStorage.getItem('smartclass4c_teacher');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          avatar: '/assets/aistudio/image_368c98f5.png',
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      ...INITIAL_TEACHER,
      avatar: '/assets/aistudio/image_368c98f5.png',
    };
  });

  const [tasks, setTasks] = useState<LearningTask[]>(() => {
    const saved = localStorage.getItem('smartclass4c_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [resources, setResources] = useState<ResourceItem[]>(() => {
    const saved = localStorage.getItem('smartclass4c_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  const [creations, setCreations] = useState<StudentCreation[]>(() => {
    const saved = localStorage.getItem('smartclass4c_creations');
    return saved ? JSON.parse(saved) : INITIAL_CREATIONS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('teacher');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Selected Student for Student Space
  const [currentStudentId, setCurrentStudentId] = useState<string>(students[0]?.id || 'std-1');
  const currentStudent = students.find(s => s.id === currentStudentId) || students[0];

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('smartclass4c_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('smartclass4c_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('smartclass4c_teacher', JSON.stringify(teacher));
  }, [teacher]);

  useEffect(() => {
    localStorage.setItem('smartclass4c_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('smartclass4c_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('smartclass4c_creations', JSON.stringify(creations));
  }, [creations]);

  // Audio mute sync
  const toggleSound = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    speechService.setMuted(newMuted);
    if (!newMuted) {
      speechService.speak('Âm thanh tiếng Việt đã được bật!');
    }
  };

  // 10 Quick Access Card Definitions
  const QUICK_CARDS = [
    { id: 'tutor', title: '1. Gia sư AI của em', desc: 'Hỏi đáp bài tập theo 3 mức gợi ý sư phạm', icon: '🤖', color: 'from-blue-500 to-indigo-600', badge: 'AI Thông minh' },
    { id: 'journey', title: '2. Học tập thông minh', desc: 'Quy trình 5 bước: Khám phá đến tự đánh giá', icon: '🧭', color: 'from-sky-500 to-cyan-600', badge: 'GDPT 2018' },
    { id: 'games', title: '3. Trò chơi kiến thức', desc: '8 đấu trường: Triệu phú, Vòng quay, Đua xe', icon: '🎮', color: 'from-amber-500 to-orange-600', badge: '8 Đấu trường' },
    { id: 'creative', title: '4. Sáng tạo cùng AI', desc: 'Sơ đồ tư duy, truyện tranh, slide & STEM 3D', icon: '🎨', color: 'from-purple-500 to-pink-600', badge: 'Xưởng sáng chế' },
    { id: 'library', title: '5. Thư viện học liệu', desc: 'Kho bài giảng, phiếu ôn tập & tạo mới bằng AI', icon: '📚', color: 'from-emerald-500 to-teal-600', badge: 'Học liệu số' },
    { id: 'tasks', title: '6. Nhiệm vụ học tập', desc: 'Theo dõi bài tập được giao và tiến độ nộp bài', icon: '📋', color: 'from-blue-600 to-teal-600', badge: 'Giao & Nộp bài' },
    { id: 'gallery', title: '7. Thành tích của em', desc: 'Bộ sưu tập sản phẩm, huy hiệu & điểm rèn luyện', icon: '🏅', color: 'from-rose-500 to-red-600', badge: 'Góc Lớp 4C' },
    { id: 'class', title: '8. Quản lý lớp 4C', desc: '36 học sinh, 4 tổ, điểm danh & xuất file Word/CSV', icon: '👥', color: 'from-indigo-600 to-blue-700', badge: '36 Học sinh' },
    { id: 'evidence', title: '9. Báo cáo & Minh chứng', desc: 'Hồ sơ minh chứng ứng dụng AI giáo dục Lớp 4C năm 2026', icon: '📊', color: 'from-violet-600 to-purple-800', badge: 'Minh chứng 2026' },
    { id: 'parent', title: '10. Cổng phụ huynh', desc: 'Đồng hành cùng con tại nhà và xem tiến độ học tập', icon: '👨‍👩‍👧', color: 'from-teal-600 to-emerald-800', badge: 'Gia đình' },
  ];

  const handleCardClick = (tabId: string) => {
    if (tabId === 'parent') {
      setCurrentRole('parent');
      setActiveTab('home');
      speechService.speak('Chuyển sang Cổng phụ huynh học sinh');
      return;
    }
    setActiveTab(tabId as ActiveTab);
    speechService.speak(`Chuyển đến: ${QUICK_CARDS.find(c => c.id === tabId)?.title || ''}`);
  };

  // Add new creation to gallery
  const handleSaveCreation = (item: Omit<StudentCreation, 'id' | 'createdAt' | 'likes'>) => {
    const newCreation: StudentCreation = {
      ...item,
      id: `cr-${Date.now()}`,
      likes: 1,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCreations([newCreation, ...creations]);
  };

  // Like creation
  const handleLikeCreation = (id: string) => {
    setCreations(creations.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
  };

  // Submit task
  const handleSubmitTask = (taskId: string, content: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completedBy: Array.from(new Set([...t.completedBy, currentStudent.id])),
          submissions: [
            ...t.submissions,
            {
              studentId: currentStudent.id,
              studentName: currentStudent.fullName,
              submittedAt: new Date().toLocaleString(),
              content,
            },
          ],
        };
      }
      return t;
    }));

    // Reward student points
    setStudents(students.map(s => {
      if (s.id === currentStudent.id) {
        return {
          ...s,
          completedTasksCount: s.completedTasksCount + 1,
          points: {
            ...s.points,
            tasks: s.points.tasks + 5,
          },
        };
      }
      return s;
    }));
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-blue-50 text-slate-800 flex flex-col font-['Be_Vietnam_Pro',sans-serif] ${reduceMotion ? '' : 'transition-colors duration-300'}`}>
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Animated Robot Head with Glowing Blue Eyes */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 p-0.5 shadow-md group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex flex-col items-center justify-center p-1 relative overflow-hidden">
                <div className="w-1.5 h-1 bg-amber-400 rounded-full mb-0.5" />
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
                </div>
                <div className="w-3 h-0.5 bg-cyan-200 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-900 text-xs sm:text-sm md:text-base tracking-tight leading-tight max-w-[200px] sm:max-w-md lg:max-w-xl truncate">
                  ỨNG DỤNG CÔNG NGHỆ AI VÀO GIẢNG DẠY VÀ HỌC TẬP VỚI TRỢ LÝ AI LỚP 4
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold uppercase border border-blue-200 shrink-0">
                  Lớp 4C
                </span>
              </div>
              <p className="text-[11px] font-bold text-blue-600 tracking-wide">
                TỰ HỌC – SÁNG TẠO – VƯỢT GIỚI HẠN
              </p>
            </div>
          </div>

          {/* Quick Nav Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                activeTab === 'home' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Trang Chủ
            </button>
            <button
              onClick={() => setActiveTab('tutor')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                activeTab === 'tutor' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Gia Sư AI
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                activeTab === 'games' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Trò Chơi (8)
            </button>
            <button
              onClick={() => setActiveTab('creative')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                activeTab === 'creative' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Xưởng Sáng Tạo
            </button>
            <button
              onClick={() => setActiveTab('class')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                activeTab === 'class' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Lớp 4C (36)
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                activeTab === 'evidence' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Minh Chứng 2026
            </button>
          </nav>

          {/* Right Controls: Role Selector + Sound + Voice */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle (vi-VN) */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${
                isMuted
                  ? 'border-slate-200 bg-slate-100 text-slate-400'
                  : 'border-blue-200 bg-blue-50 text-blue-700 shadow-2xs'
              }`}
              title={isMuted ? 'Bật âm thanh tiếng Việt' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />}
              <span className="hidden sm:inline">{isMuted ? 'Âm thanh: TẮT' : 'vi-VN: BẬT'}</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => {
                  setCurrentRole('teacher');
                  speechService.speak('Chuyển sang chế độ Giáo viên quản trị của Cô Phạm Thị Tính');
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition ${
                  currentRole === 'teacher' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                👩‍🏫 Cô Tính
              </button>
              <button
                onClick={() => {
                  setCurrentRole('student');
                  speechService.speak(`Chuyển sang không gian của học sinh ${currentStudent.fullName}`);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition ${
                  currentRole === 'student' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🎒 Học sinh
              </button>
              <button
                onClick={() => {
                  setCurrentRole('parent');
                  speechService.speak('Chuyển sang Cổng phụ huynh học sinh');
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition ${
                  currentRole === 'parent' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                👨‍👩‍👧 Phụ huynh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-8">

        {/* Dynamic Display based on activeTab & Role */}

        {/* 1. HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            
            {/* HERO BANNER - 3D CARTOON POSTER SPIRIT */}
            <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-700 text-white shadow-2xl border-4 border-white">
              
              {/* Decorative Cloud & Lightbulb Elements */}
              <div className="absolute top-4 right-10 text-4xl opacity-40 select-none pointer-events-none">☁️</div>
              <div className="absolute bottom-6 left-1/3 text-3xl opacity-30 select-none pointer-events-none">✨</div>
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                
                {/* Left Text & Slogan */}
                <div className="flex-1 text-center lg:text-left space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-extrabold border border-white/30 shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    TIỂU HỌC KHOÁI CHÂU 1 • LỚP 4C
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-md uppercase">
                    ỨNG DỤNG CÔNG NGHỆ AI VÀO GIẢNG DẠY VÀ HỌC TẬP VỚI TRỢ LÝ AI LỚP 4
                  </h1>

                  <div className="inline-block px-5 py-2 rounded-2xl bg-amber-400 text-slate-900 font-black text-sm md:text-lg shadow-lg tracking-wide uppercase">
                    TỰ HỌC – SÁNG TẠO – VƯỢT GIỚI HẠN
                  </div>

                  <p className="text-blue-100 text-sm md:text-base max-w-xl leading-relaxed font-medium">
                    "Xin chào các bạn học sinh Lớp 4C! Cùng Robot AI mắt xanh khám phá kiến thức, rèn luyện tư duy và sáng tạo những sản phẩm tuyệt vời nhé!"
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
                    <button
                      onClick={() => {
                        setActiveTab('tutor');
                        speechService.speak('Chào mừng các bạn học sinh lớp 4C cùng bắt đầu khám phá!');
                        confetti({ particleCount: 70, spread: 70 });
                      }}
                      className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-base shadow-xl hover:shadow-2xl hover:scale-105 transition flex items-center gap-2.5"
                    >
                      <span>BẮT ĐẦU KHÁM PHÁ</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setActiveTab('games')}
                      className="px-6 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-extrabold text-sm border border-white/40 transition flex items-center gap-2"
                    >
                      <Trophy className="w-4 h-4 text-amber-300" />
                      Chơi Trò Chơi Kiến Thức
                    </button>
                  </div>
                </div>

                {/* Right Animated Robot AI Visual */}
                <div className="relative shrink-0 flex flex-col items-center">
                  <div className="w-56 h-56 md:w-64 md:h-64 rounded-3xl bg-white/10 backdrop-blur-md p-3 border-4 border-white/40 shadow-2xl flex flex-col items-center justify-center relative">
                    
                    {/* Glowing Lightbulb of Ideas */}
                    <div className="absolute -top-6 bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1 animate-bounce">
                      💡 Sáng Tạo Cùng AI
                    </div>

                    {/* Robot Head with Large Friendly Blue Eyes */}
                    <div className="w-40 h-40 bg-slate-900 rounded-3xl p-3 flex flex-col items-center justify-center border-4 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.5)]">
                      {/* Antenna */}
                      <div className="w-3 h-4 bg-amber-400 rounded-full mb-1 animate-pulse" />
                      
                      {/* Blue Eyes */}
                      <div className="flex items-center gap-6 my-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full translate-x-0.5 -translate-y-0.5" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full translate-x-0.5 -translate-y-0.5" />
                        </div>
                      </div>

                      {/* Friendly Smile */}
                      <div className="w-12 h-2.5 bg-cyan-200 rounded-full mt-1" />
                    </div>

                    <div className="mt-3 text-center">
                      <span className="text-xs font-black text-cyan-200 uppercase tracking-widest block">
                        Robot AI Lớp 4C
                      </span>
                      <span className="text-[11px] text-white/80 font-medium">
                        Người bạn đồng hành thông minh
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TEACHER INFO CARD (Cô Phạm Thị Tính - Trường Tiểu học Khoái Châu 1) */}
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-blue-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <img
                  src="/assets/aistudio/image_368c98f5.png"
                  alt="Cô giáo Phạm Thị Tính"
                  className="w-24 h-28 rounded-3xl object-cover object-top border-4 border-blue-200 shadow-xl"
                />
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-200">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    GIÁO VIÊN QUẢN TRỊ ỨNG DỤNG
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">
                    Cô giáo {teacher.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    {teacher.classRoom} • {teacher.school}
                  </p>
                  <p className="text-xs text-slate-600 max-w-xl italic mt-1 font-medium">
                    "{teacher.bio}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('class')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Users className="w-4 h-4" />
                  Quản lý 36 Học Sinh
                </button>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 border border-indigo-200"
                >
                  <FileCheck className="w-4 h-4" />
                  Báo Cáo Minh Chứng 2026
                </button>
              </div>
            </div>

            {/* 10 QUICK ACCESS ACTION CARDS GRID */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    10 Thẻ Chức Năng Khám Phá Nhanh
                  </h2>
                  <p className="text-xs text-slate-500">
                    Bấm vào từng thẻ để trải nghiệm đầy đủ các tính năng thực tế
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {QUICK_CARDS.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className="group p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-2xs">
                        {card.icon}
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition">
                        {card.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                      <span>Mở ngay</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Groups Spotlight Summary */}
            <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Bốn Tổ Học Tập Thi Đua Lớp 4C
                  </h3>
                  <p className="text-xs text-slate-500">Mỗi tổ gồm 9 học sinh xuất sắc cùng nhau tự học và sáng tạo</p>
                </div>
                <button
                  onClick={() => setActiveTab('class')}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  Xem chi tiết 36 bạn <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {groups.map((grp) => {
                  const members = students.filter(s => s.group === grp.name);
                  return (
                    <div
                      key={grp.id}
                      className="p-4 rounded-2xl border-2 transition hover:shadow-md"
                      style={{ borderColor: grp.color, backgroundColor: `${grp.color}08` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{grp.badge}</span>
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: grp.color }}>
                          {members.length} Học sinh
                        </span>
                      </div>
                      <h4 className="font-black text-slate-800 text-sm">{grp.name}</h4>
                      <div className="text-xs text-slate-500 mt-1">
                        Tổ trưởng: <strong className="text-slate-700">{members.find(m => m.isLeader)?.fullName || 'Chưa chọn'}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 2. TAB: GIA SƯ AI */}
        {activeTab === 'tutor' && (
          <AITutor currentStudentName={currentStudent.fullName} />
        )}

        {/* 3. TAB: HÀNH TRÌNH 5 BƯỚC */}
        {activeTab === 'journey' && (
          <LearningJourney />
        )}

        {/* 4. TAB: TRÒ CHƠI HỌC TẬP (8 GAMES) */}
        {activeTab === 'games' && (
          <GamesHub />
        )}

        {/* 5. TAB: XƯỞNG SÁNG TẠO AI (MINDMAP, STORY, SLIDES, STEM 3D) */}
        {activeTab === 'creative' && (
          <CreativeStudio 
            onSaveCreation={handleSaveCreation}
            currentStudentName={currentStudent.fullName}
          />
        )}

        {/* 6. TAB: THƯ VIỆN HỌC LIỆU SỐ */}
        {activeTab === 'library' && (
          <ResourceLibrary
            resources={resources}
            onAddResource={(item) => setResources([item, ...resources])}
          />
        )}

        {/* 7. TAB: NHIỆM VỤ HỌC TẬP */}
        {activeTab === 'tasks' && (
          <StudentPortal
            student={currentStudent}
            tasks={tasks}
            creations={creations}
            onOpenTutor={() => setActiveTab('tutor')}
            onOpenCreative={() => setActiveTab('creative')}
            onSubmitTask={handleSubmitTask}
          />
        )}

        {/* 8. TAB: THÀNH TÍCH & GÓC SÁNG TẠO */}
        {activeTab === 'gallery' && (
          <CreationsGallery
            creations={creations}
            onLikeCreation={handleLikeCreation}
            isTeacher={currentRole === 'teacher'}
          />
        )}

        {/* 9. TAB: QUẢN LÝ LỚP 4C (36 HỌC SINH) */}
        {activeTab === 'class' && (
          <ClassManagement
            students={students}
            onUpdateStudents={setStudents}
            groups={groups}
            onUpdateGroups={setGroups}
          />
        )}

        {/* 9. TAB: BÁO CÁO & MINH CHỨNG 2026 */}
        {activeTab === 'evidence' && (
          <Evidence2026
            students={students}
            creations={creations}
            tasks={tasks}
          />
        )}

        {/* SPECIAL ROLE VIEWS */}
        {currentRole === 'parent' && activeTab === 'home' && (
          <ParentPortal students={students} tasks={tasks} />
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-800 text-sm uppercase">
              ỨNG DỤNG CÔNG NGHỆ AI VÀO GIẢNG DẠY VÀ HỌC TẬP VỚI TRỢ LÝ AI LỚP 4
            </p>
            <p className="mt-0.5">
              Khẩu hiệu: <strong>TỰ HỌC – SÁNG TẠO – VƯỢT GIỚI HẠN</strong> • Trường Tiểu học Khoái Châu 1
            </p>
            <p className="mt-0.5">
              Giáo viên phụ trách: <strong>Phạm Thị Tính</strong> • Sĩ số: 36 học sinh (4 Tổ)
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
              Chương Trình GDPT 2018 • Google Gemini AI
            </span>
            <p className="mt-1 text-[11px] text-slate-400">
              Bản quyền ứng dụng giáo dục học tập Lớp 4C © 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
