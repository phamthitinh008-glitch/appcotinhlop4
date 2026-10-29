import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Printer, 
  Edit3, 
  Save, 
  RotateCcw, 
  Send, 
  CheckCircle2, 
  BookOpen, 
  Layers,
  Award
} from 'lucide-react';
import { Subject, LearningTask } from '../types';
import { exportToWord, printDocument } from '../utils/export';
import { speechService } from '../utils/speech';
import confetti from 'canvas-confetti';

interface LessonPlannerProps {
  onAssignTask: (task: LearningTask) => void;
}

export const LessonPlanner: React.FC<LessonPlannerProps> = ({ onAssignTask }) => {
  const [subject, setSubject] = useState<Subject>('Toán');
  const [lessonName, setLessonName] = useState('Quy đồng mẫu số các phân số');
  const [bookSeries, setBookSeries] = useState('Kết nối tri thức với cuộc sống');
  const [periodCount, setPeriodCount] = useState(1);
  const [duration, setDuration] = useState('35 phút');
  const [aiLevel, setAiLevel] = useState('Ứng dụng AI vào luyện tập & đánh giá tương tác');

  const [loading, setLoading] = useState(false);
  const [planContent, setPlanContent] = useState<string>(`KẾ HOẠCH BÀI DẠY (GIÁO ÁN ĐIỆN TỬ GDPT 2018)
TRƯỜNG TIỂU HỌC KHOÁI CHÂU 1 - LỚP 4C
Giáo viên thực hiện: Phạm Thị Tính
Môn: Toán - Lớp: 4C
Tên bài: Quy đồng mẫu số các phân số
Thời lượng: 1 tiết (35 phút) - Bộ sách: Kết nối tri thức với cuộc sống

I. YÊU CẦU CẦN ĐẠT
1. Kiến thức, kĩ năng:
- Bước đầu nhận biết về quy đồng mẫu số hai phân số.
- Biết cách quy đồng mẫu số hai phân số trong trường hợp đơn giản (chọn tích hai mẫu số là mẫu số chung).
2. Năng lực chung:
- Tự chủ và tự học: Tự giác sử dụng Trợ lý AI Smart Class 4C để tìm hiểu quy tắc.
- Giao tiếp và hợp tác: Tương tác nhóm 4 tổ (Hoa Ban, Mặt Trời, Sao Sáng, Cầu Vồng) chia sẻ các cách chọn mẫu số chung.
- Giải quyết vấn đề và sáng tạo: Tìm ra mẫu số chung nhỏ nhất giúp tính toán nhanh gọn.
3. Phẩm chất:
- Chăm chỉ, cẩn thận, yêu thích khám phá vẻ đẹp của toán học.

II. ĐỒ DÙNG DẠY HỌC
- Giáo viên: Máy tính bảng, bảng thông minh, ứng dụng Trợ lý AI Smart Class 4C.
- Học sinh: Bảng con, bút dạ, thiết bị học tập kết nối lớp học.

III. TIẾN TRÌNH DẠY HỌC
1. Khởi động (5 phút):
- Tổ chức trò chơi "Vòng quay may mắn" trên Smart Class 4C ôn tập tính chất cơ bản của phân số.
2. Khám phá (12 phút):
- Tình huống: So sánh 1/3 và 1/4 cái bánh.
- Học sinh thảo luận theo tổ, Robot AI mắt xanh hướng dẫn 3 bước quy đồng mẫu số.
3. Luyện tập (13 phút):
- Làm việc cá nhân: Hoàn thành 4 bài tập phân hóa trên ứng dụng, nhận phản hồi ngay từ AI.
4. Vận dụng (5 phút):
- Bài toán thực tế phân chia hoa quả sinh nhật tổ.

IV. ĐÁNH GIÁ VÀ ĐIỀU CHỈNH
- Đánh giá theo Thông tư 27/2020/TT-BGDĐT.
- AI tổng hợp tỷ lệ học sinh nắm vững bài để giáo viên hỗ trợ kịp thời.`);

  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          lessonName,
          bookSeries,
          periodCount,
          grade: 4,
          aiLevel,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setPlanContent(data.plan);
        confetti({ particleCount: 50, spread: 60 });
        speechService.speak('Kế hoạch bài dạy đã được Robot AI tạo hoàn tất theo chuẩn GDPT 2018!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTaskToClass = () => {
    const newTask: LearningTask = {
      id: `task-${Date.now()}`,
      title: `Nhiệm vụ: ${lessonName}`,
      subject,
      deadline: '2026-11-10',
      description: `Áp dụng kiến thức bài học ${lessonName}. Hoàn thành các bài tập và ghi nhận phản hồi cùng Robot AI.`,
      criteria: ['Hiểu bản chất bài học', 'Trình bày rõ ràng', 'Tự giác hoàn thành'],
      completedBy: [],
      submissions: [],
    };
    onAssignTask(newTask);
    confetti({ particleCount: 40, spread: 50 });
    speechService.speak(`Đã giao nhiệm vụ "${lessonName}" cho toàn bộ 36 học sinh Lớp 4C!`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mb-1 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            CÔNG CỤ GIÁO VIÊN SOẠN BÀI CHUẨN GDPT 2018
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            Soạn Kế Hoạch Bài Dạy Bằng AI
          </h2>
          <p className="text-sm text-slate-500">
            Giáo viên phụ trách: <strong>Phạm Thị Tính</strong> • Trường Tiểu học Khoái Châu 1 • Lớp 4C
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportToWord(`KHBD-${subject}-${lessonName}`, planContent, `KHBD-${subject}-${lessonName}.doc`)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Xuất File Word (.doc)
          </button>

          <button
            onClick={() => printDocument(`Kế hoạch bài dạy: ${lessonName}`, planContent)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            In / Lưu PDF
          </button>

          <button
            onClick={handleAssignTaskToClass}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-4 h-4" />
            Giao Bài Cho Lớp 4C
          </button>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Môn học:</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800"
          >
            <option value="Toán">Toán Lớp 4</option>
            <option value="Tiếng Việt">Tiếng Việt Lớp 4</option>
            <option value="Khoa học">Khoa học Lớp 4</option>
            <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
            <option value="Tiếng Anh">Tiếng Anh</option>
            <option value="Tin học">Tin học</option>
            <option value="Công nghệ">Công nghệ</option>
            <option value="Đạo đức">Đạo đức</option>
            <option value="Hoạt động trải nghiệm">Hoạt động trải nghiệm</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Tên bài học:</label>
          <input
            type="text"
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800"
            placeholder="Tên bài học..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Bộ sách giáo khoa:</label>
          <select
            value={bookSeries}
            onChange={(e) => setBookSeries(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800"
          >
            <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức với cuộc sống</option>
            <option value="Cánh Diều">Cánh Diều</option>
            <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Thời lượng:</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ tích hợp AI trong tiết dạy:</label>
          <input
            type="text"
            value={aiLevel}
            onChange={(e) => setAiLevel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800"
          />
        </div>

        <div className="md:col-span-3 flex justify-end gap-2 pt-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'AI đang soạn giáo án 13 mục...' : 'TẠO KẾ HOẠCH BÀI DẠY GDPT 2018'}
          </button>
        </div>
      </div>

      {/* Editor & Plan Viewer */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs uppercase tracking-wider text-slate-600">
              Nội dung Kế hoạch bài dạy:
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
              13 Mục Chuẩn GDPT 2018
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              {isEditing ? 'Xem Bản In' : 'Chỉnh Sửa Văn Bản'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={planContent}
            onChange={(e) => setPlanContent(e.target.value)}
            rows={18}
            className="w-full p-4 rounded-xl border border-slate-300 bg-white text-xs md:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        ) : (
          <div className="p-6 rounded-xl bg-white border border-slate-200 text-xs md:text-sm text-slate-800 font-serif leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {planContent}
          </div>
        )}
      </div>
    </div>
  );
};
