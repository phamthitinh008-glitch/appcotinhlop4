import React, { useState } from 'react';
import { 
  HeartHandshake, 
  CheckCircle2, 
  Clock, 
  Award, 
  Bell, 
  Lightbulb, 
  Calendar, 
  ShieldCheck, 
  Phone
} from 'lucide-react';
import { Student, LearningTask } from '../types';
import { speechService } from '../utils/speech';

interface ParentPortalProps {
  students: Student[];
  tasks: LearningTask[];
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ students, tasks }) => {
  // Parent can select their own child (in real app, authenticated to single child)
  const [selectedChildId, setSelectedChildId] = useState<string>(students[0]?.id || '');

  const child = students.find(s => s.id === selectedChildId);

  if (!child) return null;

  const completedCount = tasks.filter(t => t.completedBy.includes(child.id)).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-1 border border-emerald-200">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            CỔNG THÔNG TIN PHỤ HUYNH HỌC SINH
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            Đồng Hành Cùng Con Tại Nhà
          </h2>
          <p className="text-sm text-slate-500">
            Trường Tiểu học Khoái Châu 1 • Giáo viên chủ nhiệm: <strong>Phạm Thị Tính</strong>
          </p>
        </div>

        {/* Child Selector (Simulating logged-in parent view) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Xem thông tin con:</span>
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.code} - {s.group})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Child Overview Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
            👧
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold text-emerald-200">Học sinh Lớp 4C</div>
            <h3 className="text-2xl font-black">{child.fullName}</h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Tổ: <strong>{child.group}</strong> • Điểm rèn luyện: <strong>{child.points.cooperation + child.points.tasks + child.points.creativity} điểm</strong>
            </p>
          </div>
        </div>

        <div className="flex gap-3 text-center">
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <span className="text-[10px] text-emerald-200 font-bold block uppercase">Bài đã xong</span>
            <span className="text-xl font-black text-white">{completedCount}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <span className="text-[10px] text-emerald-200 font-bold block uppercase">Cần làm</span>
            <span className="text-xl font-black text-amber-300">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Teacher Announcements & Study Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teacher Notice */}
        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase">
            <Bell className="w-4 h-4 text-blue-600" />
            Thông báo từ Cô giáo Phạm Thị Tính
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            "Kính gửi quý phụ huynh! Tuần này Lớp 4C đang học chương Phân số và chuẩn bị sản phẩm STEM Ngôi nhà xanh. Kính nhờ quý phụ huynh nhắc nhở các con dành 15-20 phút tự học cùng Robot AI và khuyến khích con tự suy nghĩ trước khi xem gợi ý."
          </p>
        </div>

        {/* Home Study Advice */}
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            Gợi ý đồng hành cùng con tại nhà
          </div>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-medium leading-relaxed">
            <li>Hỏi con hôm nay đã khám phá được điều gì thú vị cùng Robot AI mắt xanh.</li>
            <li>Động viên con hoàn thành sơ đồ tư duy và tự tin thuyết trình trước gia đình.</li>
            <li>Tạo không gian học tập yên tĩnh, đủ ánh sáng và khen ngợi sự kiên trì của con.</li>
          </ul>
        </div>
      </div>

      {/* Assigned Tasks Status */}
      <div className="space-y-3">
        <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">
          Chi tiết nhiệm vụ của {child.fullName}:
        </h4>

        <div className="space-y-2.5">
          {tasks.map((task) => {
            const isCompleted = task.completedBy.includes(child.id);

            return (
              <div
                key={task.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-700 px-2 py-0.5 rounded-md bg-blue-50">
                      {task.subject}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Hạn nộp: {task.deadline}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-800 text-sm">{task.title}</h5>
                </div>

                {isCompleted ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã hoàn thành
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    Đang thực hiện
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
