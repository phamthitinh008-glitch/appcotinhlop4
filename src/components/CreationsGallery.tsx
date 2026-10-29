import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  MessageCircle, 
  Award, 
  Filter, 
  Palette, 
  BookOpen, 
  Cuboid as CubeIcon, 
  Presentation,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { StudentCreation, GroupName } from '../types';
import { speechService } from '../utils/speech';
import confetti from 'canvas-confetti';

interface CreationsGalleryProps {
  creations: StudentCreation[];
  onLikeCreation: (id: string) => void;
  isTeacher: boolean;
  onAddTeacherComment?: (id: string, comment: string) => void;
}

export const CreationsGallery: React.FC<CreationsGalleryProps> = ({
  creations,
  onLikeCreation,
  isTeacher,
  onAddTeacherComment,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  const BADGES = [
    { name: 'Nhà Khám Phá', icon: '🧭', desc: 'Tự giác tìm tòi kiến thức mới' },
    { name: 'Nhà Sáng Tạo', icon: '💡', desc: 'Có sản phẩm và ý tưởng độc đáo' },
    { name: 'Người Giải Quyết Vấn Đề', icon: '🧩', desc: 'Vượt qua bài toán khó kiên trì' },
    { name: 'Đồng Đội Tích Cực', icon: '🤝', desc: 'Hỗ trợ các bạn trong tổ xuất sắc' },
    { name: 'Người Học Kiên Trì', icon: '🏃', desc: 'Chăm chỉ hoàn thành mọi nhiệm vụ' },
  ];

  const filtered = creations.filter(c => filterType === 'ALL' || c.type === filterType);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-bold mb-1 border border-pink-200">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            GÓC SÁNG TẠO LỚP 4C
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            Không Gian Trưng Bày Sản Phẩm Học Sinh
          </h2>
          <p className="text-sm text-slate-500">
            Nơi ghi nhận các sơ đồ tư duy, truyện tranh, slide thuyết trình và mô hình STEM của 36 học sinh
          </p>
        </div>

        {/* Filter Type */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'mindmap', 'story', 'stem', 'presentation'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                filterType === t
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'ALL' ? 'Tất cả' : t === 'mindmap' ? 'Sơ đồ tư duy' : t === 'story' ? 'Truyện tranh' : t === 'stem' ? 'STEM 3D' : 'Thuyết trình'}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Badges Showcase Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 border border-amber-200">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          Huy Hiệu Khích Lệ Năng Lực Học Sinh Lớp 4C
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {BADGES.map((b) => (
            <div key={b.name} className="p-2.5 rounded-xl bg-white/80 border border-amber-100 shadow-2xs text-center">
              <span className="text-2xl block mb-1">{b.icon}</span>
              <span className="text-xs font-bold text-slate-800 block">{b.name}</span>
              <span className="text-[10px] text-slate-500 block leading-tight">{b.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Creations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {item.group}
                </span>
                {item.badgeAwarded && (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    🏅 {item.badgeAwarded}
                  </span>
                )}
              </div>

              <h4 className="font-bold text-slate-800 text-base leading-snug">
                {item.title}
              </h4>
              <div className="text-xs text-slate-400 mt-1">
                Tác giả: <strong className="text-slate-700">{item.studentName}</strong> • {item.createdAt}
              </div>

              <p className="text-xs text-slate-600 mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 leading-relaxed font-medium">
                {item.summary}
              </p>

              {/* Teacher Comment */}
              {item.teacherComment && (
                <div className="mt-3 p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
                  <div className="font-bold flex items-center gap-1 mb-0.5 text-blue-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Cô Phạm Thị Tính nhận xét:
                  </div>
                  <p className="italic">"{item.teacherComment}"</p>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onLikeCreation(item.id);
                  confetti({ particleCount: 25, spread: 40 });
                  speechService.speak('Bạn đã thả tim khích lệ sản phẩm của bạn!');
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 transition"
              >
                <Heart className="w-4 h-4 fill-rose-500" />
                <span>{item.likes} Yêu thích</span>
              </button>

              <button
                onClick={() => speechService.speak(`Sản phẩm của bạn ${item.studentName}: ${item.title}`)}
                className="text-xs text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1"
              >
                Nghe giới thiệu
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
