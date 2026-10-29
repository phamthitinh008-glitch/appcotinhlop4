import React, { useState } from 'react';
import { 
  Palette, 
  BookOpen, 
  Presentation, 
  Cuboid as CubeIcon, 
  Sparkles, 
  Download, 
  Plus, 
  Trash2, 
  Play, 
  Volume2, 
  RefreshCw, 
  FileText, 
  Share2,
  CheckCircle2
} from 'lucide-react';
import { STEM3DLab } from './STEM3DLab';
import { MindmapData, StoryData, StudentCreation } from '../types';
import { speechService } from '../utils/speech';
import { printDocument } from '../utils/export';
import confetti from 'canvas-confetti';

interface CreativeStudioProps {
  onSaveCreation: (creation: Omit<StudentCreation, 'id' | 'createdAt' | 'likes'>) => void;
  currentStudentName: string;
}

export const CreativeStudio: React.FC<CreativeStudioProps> = ({ onSaveCreation, currentStudentName }) => {
  const [activeTab, setActiveTab] = useState<'mindmap' | 'story' | 'presentation' | 'stem'>('mindmap');

  // Mindmap State
  const [mindmapTopic, setMindmapTopic] = useState('Vòng tuần hoàn của nước trong tự nhiên');
  const [mindmapData, setMindmapData] = useState<MindmapData>({
    topic: 'Vòng tuần hoàn của nước',
    color: '#2563EB',
    branches: [
      { id: 'b1', title: 'Bốc hơi', color: '#0284C7', subBranches: ['Mặt Trời chiếu sáng', 'Nước sông hồ bay hơi', 'Thực vật thoát hơi nước'] },
      { id: 'b2', title: 'Ngưng tụ', color: '#7C3AED', subBranches: ['Hơi nước lên cao gặp lạnh', 'Hạt nước li ti tụ lại', 'Tạo thành các đám mây'] },
      { id: 'b3', title: 'Mưa rơi', color: '#059669', subBranches: ['Mây nặng hạt', 'Mưa rào hoặc tuyết rơi', 'Cung cấp nước ngọt'] },
      { id: 'b4', title: 'Dòng chảy & Thấm', color: '#D97706', subBranches: ['Thấm vào lòng đất', 'Chảy về sông ngòi', 'Trở lại đại dương mênh mông'] },
    ],
  });
  const [loadingMindmap, setLoadingMindmap] = useState(false);

  // Story State
  const [storyInputs, setStoryInputs] = useState({
    title: 'Chú Robot AI và bài học phân số',
    characters: 'Robot AI mắt xanh, bạn Kiều Anh, bạn Gia Bảo',
    setting: 'Lớp 4C - Trường Tiểu học Khoái Châu 1',
    moral: 'Đoàn kết, kiên trì tự học và tương thân tương ái',
  });
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  // Presentation State
  const [presentationTopic, setPresentationTopic] = useState('Em yêu môi trường xanh trường em');
  const [slides, setSlides] = useState([
    {
      id: 1,
      title: 'Giới thiệu về Môi trường Xanh Lớp 4C',
      script: 'Kính chào cô giáo Phạm Thị Tính và toàn thể các bạn học sinh Lớp 4C thân mến! Hôm nay nhóm chúng em xin trình bày về dự án Môi trường xanh.',
      imageKeyword: 'nature',
      points: ['Ý nghĩa của cây xanh trường học', 'Thực trạng bảo vệ môi trường hiện nay', 'Nhiệm vụ của học sinh lớp 4'],
    },
    {
      id: 2,
      title: 'Các hành động cụ thể của 4 Tổ',
      script: 'Bốn tổ: Hoa Ban, Mặt Trời, Sao Sáng và Cầu Vồng đã cùng nhau phân công chăm sóc bồn hoa, thu gom giấy vụn tái chế và tưới cây mỗi ngày.',
      imageKeyword: 'teamwork',
      points: ['Tổ Hoa Ban: Chăm sóc vườn hoa', 'Tổ Mặt Trời: Phân loại rác thải', 'Tổ Sao Sáng & Cầu Vồng: Tiết kiệm điện nước'],
    },
    {
      id: 3,
      title: 'Thông điệp gửi gắm',
      script: 'Mỗi hành động nhỏ hôm nay của chúng ta sẽ mang lại một hành tinh xanh ngày mai. Chúng em xin cảm ơn cô và các bạn đã chú ý lắng nghe!',
      imageKeyword: 'earth',
      points: ['Tự học - Sáng tạo - Vượt giới hạn', 'Trường Tiểu học Khoái Châu 1 Xanh - Sạch - Đẹp'],
    },
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  // 1. Generate Mindmap with AI
  const handleGenerateMindmap = async () => {
    if (!mindmapTopic.trim()) return;
    setLoadingMindmap(true);
    try {
      const res = await fetch('/api/gemini/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: mindmapTopic, subject: 'Khoa học Lớp 4' }),
      });
      const data = await res.json();
      if (data.mindmap && data.mindmap.branches) {
        setMindmapData(data.mindmap);
        confetti({ particleCount: 50, spread: 60 });
        speechService.praiseCorrect();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMindmap(false);
    }
  };

  // Add Branch to Mindmap
  const handleAddBranch = () => {
    const newId = `b-${Date.now()}`;
    const colors = ['#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'];
    const randomColor = colors[mindmapData.branches.length % colors.length];
    setMindmapData({
      ...mindmapData,
      branches: [
        ...mindmapData.branches,
        { id: newId, title: 'Nhánh mới', color: randomColor, subBranches: ['Ý tưởng 1', 'Ý tưởng 2'] },
      ],
    });
  };

  // 2. Generate Story with AI
  const handleGenerateStory = async () => {
    setLoadingStory(true);
    try {
      const res = await fetch('/api/gemini/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyInputs),
      });
      const data = await res.json();
      if (data.story && data.story.pages) {
        setStoryData(data.story);
        confetti({ particleCount: 70, spread: 70 });
        speechService.speak('Robot AI đã tạo xong 4 trang truyện tranh cho em rồi đó! Em hãy cùng đọc nhé!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => setActiveTab('mindmap')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'mindmap'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          1. Sơ đồ tư duy AI
        </button>
        <button
          onClick={() => setActiveTab('story')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'story'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          2. Tranh kể chuyện AI
        </button>
        <button
          onClick={() => setActiveTab('presentation')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'presentation'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Presentation className="w-4 h-4" />
          3. Slide Thuyết trình
        </button>
        <button
          onClick={() => setActiveTab('stem')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'stem'
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CubeIcon className="w-4 h-4" />
          4. Phòng STEM 3D
        </button>
      </div>

      {/* 1. Mindmap Section */}
      {activeTab === 'mindmap' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-1 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                SƠ ĐỒ TƯ DUY THÔNG MINH CHO TRẺ EM
              </div>
              <h2 className="text-2xl font-black text-slate-800">
                Xây dựng Sơ đồ Tư duy cùng AI
              </h2>
              <p className="text-sm text-slate-500">
                Nhập chủ đề bài học để Robot AI hỗ trợ phân nhánh và từ khóa ghi nhớ sâu
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddBranch}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Thêm Nhánh
              </button>
              <button
                onClick={() => {
                  onSaveCreation({
                    title: `Sơ đồ tư duy: ${mindmapData.topic}`,
                    studentId: 'std-current',
                    studentName: currentStudentName,
                    group: 'Tổ Hoa Ban',
                    type: 'mindmap',
                    summary: `Sơ đồ tư duy gồm ${mindmapData.branches.length} nhánh chính về chủ đề ${mindmapData.topic}`,
                    featured: true,
                    teacherComment: 'Bố cục rõ ràng, tư duy khái quát tốt!',
                  });
                  speechService.speak('Sơ đồ tư duy đã được lưu vào Góc sáng tạo của em!');
                  confetti({ particleCount: 60, spread: 60 });
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Share2 className="w-4 h-4" />
                Lưu vào Góc Sáng Tạo
              </button>
            </div>
          </div>

          {/* AI Generator Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <input
              type="text"
              value={mindmapTopic}
              onChange={(e) => setMindmapTopic(e.target.value)}
              placeholder="Nhập chủ đề (vd: Vòng tuần hoàn của nước, Khởi nghĩa Hai Bà Trưng, Phân số...)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-blue-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <button
              onClick={handleGenerateMindmap}
              disabled={loadingMindmap}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingMindmap ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang vẽ sơ đồ...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI Tạo Sơ Đồ
                </>
              )}
            </button>
          </div>

          {/* Interactive Mindmap Canvas */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 min-h-[380px] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Center Node */}
            <div className="relative z-10 p-5 rounded-3xl bg-blue-600 text-white shadow-xl text-center max-w-xs border-4 border-white">
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-200 block mb-1">
                Chủ Đề Trung Tâm
              </span>
              <h3 className="text-lg font-black">{mindmapData.topic}</h3>
            </div>

            {/* Branches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 w-full z-10">
              {mindmapData.branches.map((branch, idx) => (
                <div
                  key={branch.id}
                  className="rounded-2xl p-4 bg-white shadow-md border-t-4 transition hover:shadow-lg"
                  style={{ borderTopColor: branch.color }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm" style={{ color: branch.color }}>
                      {branch.title}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      Nhánh {idx + 1}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {branch.subBranches.map((sub, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="text-slate-400 font-bold">•</span>
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Story Section */}
      {activeTab === 'story' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-purple-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold mb-1 border border-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                TRANH KỂ CHUYỆN SÁNG TẠO BẰNG AI
              </div>
              <h2 className="text-2xl font-black text-slate-800">
                Xưởng Viết Truyện Tranh Thiếu Nhi Lớp 4
              </h2>
              <p className="text-sm text-slate-500">
                Tạo 4 khung cảnh truyện tranh giáo dục phẩm chất theo chương trình GDPT 2018
              </p>
            </div>

            {storyData && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const printable = `
                      <h2>${storyData.title}</h2>
                      <p><strong>Bài học:</strong> ${storyData.moral}</p>
                      <hr/>
                      ${storyData.pages.map(p => `
                        <div style="margin-bottom: 20px; padding: 10px; border-left: 3px solid #7c3aed;">
                          <h3>Trang ${p.pageNumber}: ${p.scene}</h3>
                          <p><strong>Lời kể:</strong> ${p.narration}</p>
                          <p><strong>Thoại:</strong> <em>${p.dialogue || ''}</em></p>
                        </div>
                      `).join('')}
                    `;
                    printDocument(storyData.title, printable);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  In / Lưu PDF Truyện
                </button>
                <button
                  onClick={() => {
                    onSaveCreation({
                      title: storyData.title,
                      studentId: 'std-current',
                      studentName: currentStudentName,
                      group: 'Tổ Mặt Trời',
                      type: 'story',
                      summary: `Truyện tranh 4 trang về: ${storyData.moral}`,
                      featured: true,
                      teacherComment: 'Cốt truyện nhân văn, giàu cảm xúc!',
                    });
                    speechService.speak('Truyện tranh đã được chia sẻ lên Góc sáng tạo!');
                    confetti({ particleCount: 60, spread: 60 });
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  Đăng Góc Sáng Tạo
                </button>
              </div>
            )}
          </div>

          {/* Form Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-purple-50/60 border border-purple-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên truyện:</label>
              <input
                type="text"
                value={storyInputs.title}
                onChange={e => setStoryInputs({ ...storyInputs, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhân vật:</label>
              <input
                type="text"
                value={storyInputs.characters}
                onChange={e => setStoryInputs({ ...storyInputs, characters: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bối cảnh:</label>
              <input
                type="text"
                value={storyInputs.setting}
                onChange={e => setStoryInputs({ ...storyInputs, setting: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bài học rút ra:</label>
              <input
                type="text"
                value={storyInputs.moral}
                onChange={e => setStoryInputs({ ...storyInputs, moral: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs text-slate-800"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={handleGenerateStory}
                disabled={loadingStory}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                {loadingStory ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Robot AI đang sáng tác câu chuyện...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Sáng Tác Truyện Tranh 4 Trang Cùng AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Story Viewer */}
          {storyData && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span><strong>Bài học ý nghĩa:</strong> {storyData.moral}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storyData.pages.map((page) => (
                  <div key={page.pageNumber} className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs">
                        Trang {page.pageNumber} / {storyData.pages.length}
                      </span>
                      <button
                        onClick={() => speechService.speak(`${page.narration}. ${page.dialogue || ''}`)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Nghe đọc
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-50/50 text-xs text-purple-900 italic border border-purple-100">
                      🎨 Gợi ý tranh vẽ: {page.illustrationPrompt}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {page.narration}
                    </p>

                    {page.dialogue && (
                      <div className="p-2.5 rounded-xl bg-slate-100 text-xs text-slate-800 font-semibold border-l-4 border-purple-500">
                        💬 {page.dialogue}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Presentation Section */}
      {activeTab === 'presentation' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-1 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                CÔNG CỤ THUYẾT TRÌNH BÀI HỌC
              </div>
              <h2 className="text-2xl font-black text-slate-800">
                Trình Chiếu & Thuyết Trình Trước Lớp
              </h2>
              <p className="text-sm text-slate-500">
                Soạn dàn ý, luyện tập ghi âm thuyết trình và trình chiếu slide trực tiếp
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  speechService.speak(slides[currentSlideIndex].script);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" />
                Nghe AI Đọc Lời Thuyết Trình
              </button>
              <button
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (!isRecording) {
                    speechService.speak('Bắt đầu ghi âm thử nghiệm bài thuyết trình của em!');
                  }
                }}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Play className="w-4 h-4" />
                {isRecording ? 'Đang Thu Âm...' : 'Luyện Thuyết Trình'}
              </button>
            </div>
          </div>

          {/* Slide Presenter Screen */}
          <div className="rounded-3xl p-8 bg-gradient-to-br from-emerald-700 to-teal-900 text-white shadow-2xl min-h-[360px] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full font-bold">
                Trường Tiểu học Khoái Châu 1 • Lớp 4C
              </span>
              <span className="text-xs bg-emerald-400 text-slate-900 font-extrabold px-3 py-1 rounded-full">
                Slide {currentSlideIndex + 1} / {slides.length}
              </span>
            </div>

            <div className="my-6 space-y-4">
              <h3 className="text-2xl md:text-3xl font-black leading-tight text-white">
                {slides[currentSlideIndex].title}
              </h3>
              <ul className="space-y-2 text-emerald-100 text-sm md:text-base">
                {slides[currentSlideIndex].points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Slide Navigation footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold disabled:opacity-30"
              >
                ← Slide Trước
              </button>

              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`w-3 h-3 rounded-full transition ${
                      currentSlideIndex === idx ? 'bg-emerald-300 scale-125' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold disabled:opacity-30"
              >
                Slide Tiếp →
              </button>
            </div>
          </div>

          {/* Script Notes */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-800 uppercase mb-1">
              Lời thuyết trình mẫu gợi ý:
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{slides[currentSlideIndex].script}"
            </p>
          </div>
        </div>
      )}

      {/* 4. STEM 3D Lab */}
      {activeTab === 'stem' && <STEM3DLab />}
    </div>
  );
};
