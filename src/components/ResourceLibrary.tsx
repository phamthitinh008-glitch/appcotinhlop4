import React, { useState } from 'react';
import { 
  FolderGit2, 
  Search, 
  Filter, 
  Sparkles, 
  Download, 
  FileText, 
  Video, 
  Palette, 
  Cuboid as CubeIcon, 
  Plus, 
  Eye, 
  BookOpen
} from 'lucide-react';
import { ResourceItem, Subject } from '../types';
import { speechService } from '../utils/speech';

interface ResourceLibraryProps {
  resources: ResourceItem[];
  onAddResource: (item: ResourceItem) => void;
}

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ resources, onAddResource }) => {
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                        r.description.toLowerCase().includes(search.toLowerCase());
    const matchSub = filterSubject === 'ALL' || r.subject === filterSubject;
    const matchType = filterType === 'ALL' || r.type === filterType;
    return matchSearch && matchSub && matchType;
  });

  const handleCreateResourceWithAI = () => {
    setIsGenerating(true);
    speechService.speak('Robot AI đang tự động biên soạn phiếu bài tập và học liệu số mới cho em!');
    setTimeout(() => {
      const newItem: ResourceItem = {
        id: `res-${Date.now()}`,
        title: `Phiếu tự học tương tác: ${filterSubject === 'ALL' ? 'Toán 4' : filterSubject} - Ôn tập phát triển tư duy`,
        subject: (filterSubject === 'ALL' ? 'Toán' : filterSubject) as Subject,
        type: 'worksheet',
        description: 'Tài liệu hướng dẫn tự học từng bước theo phương pháp gợi mở của Smart Class 4C.',
        downloads: 1,
        createdAt: new Date().toISOString().slice(0, 10),
        author: 'AI Trợ lý & Cô Phạm Thị Tính',
      };
      onAddResource(newItem);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-bold mb-1 border border-sky-200">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            KHO HỌC LIỆU SỐ LỚP 4C
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            Thư Viện Bài Giảng & Phiếu Bài Tập
          </h2>
          <p className="text-sm text-slate-500">
            Tổng hợp bài giảng điện tử, mô phỏng STEM 3D, sơ đồ tư duy và phiếu ôn tập
          </p>
        </div>

        <button
          onClick={handleCreateResourceWithAI}
          disabled={isGenerating}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs md:text-sm shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'AI đang tạo học liệu...' : 'Tạo Học Liệu Mới Bằng AI'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tài liệu, bài tập..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
          />
        </div>

        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
        >
          <option value="ALL">Tất cả môn học</option>
          <option value="Toán">Toán</option>
          <option value="Tiếng Việt">Tiếng Việt</option>
          <option value="Khoa học">Khoa học</option>
          <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
          <option value="Tiếng Anh">Tiếng Anh</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
        >
          <option value="ALL">Tất cả loại học liệu</option>
          <option value="worksheet">Phiếu học tập</option>
          <option value="stem">Mô phỏng STEM 3D</option>
          <option value="mindmap">Sơ đồ tư duy</option>
          <option value="video">Video học liệu</option>
        </select>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
                  {item.subject}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {item.createdAt}
                </span>
              </div>

              <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                Tác giả: <strong>{item.author}</strong>
              </span>

              <button
                onClick={() => {
                  speechService.speak(`Tải tài liệu: ${item.title}`);
                  alert(`Đã mở tài liệu: "${item.title}". Học sinh có thể in hoặc làm trực tiếp trên máy tính bảng!`);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold transition flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Mở Xem
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
