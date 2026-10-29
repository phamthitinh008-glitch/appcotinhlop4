import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Award, 
  BookOpen, 
  Send, 
  Bot, 
  Star,
  FileCheck,
  Palette
} from 'lucide-react';
import { Student, LearningTask, StudentCreation } from '../types';
import { speechService } from '../utils/speech';
import confetti from 'canvas-confetti';

interface StudentPortalProps {
  student: Student;
  tasks: LearningTask[];
  creations: StudentCreation[];
  onOpenTutor: () => void;
  onOpenCreative: () => void;
  onSubmitTask: (taskId: string, content: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  tasks,
  creations,
  onOpenTutor,
  onOpenCreative,
  onSubmitTask,
}) => {
  const [submissionContent, setSubmissionContent] = useState<{ [key: string]: string }>({});

  const studentCreations = creations.filter(c => c.studentName === student.fullName || c.studentId === student.id);
  const totalPoints = student.points.cooperation + student.points.tasks + student.points.creativity;

  const handleSubmit = (taskId: string) => {
    const text = submissionContent[taskId];
    if (!text || !text.trim()) return;

    onSubmitTask(taskId, text);
    setSubmissionContent({ ...submissionContent, [taskId]: '' });
    confetti({ particleCount: 50, spread: 60 });
    speechService.praiseCorrect();
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Hero Banner */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md p-1 border-2 border-white/40 shadow-lg flex items-center justify-center text-4xl">
              🎓
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-200 block mb-1">
                Không Gian Tự Học Cá Nhân • {student.group}
              </span>
              <h2 className="text-2xl md:text-3xl font-black">
                Xin chào, {student.fullName}!
              </h2>
              <p className="text-xs md:text-sm text-blue-100 mt-1">
                Mã học sinh: <strong className="text-white font-mono">{student.code}</strong> • Trường Tiểu học Khoái Châu 1
              </p>
            </div>
          </div>

          {/* Quick Points Summary */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <div className="text-center px-3 border-r border-white/20">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Tổng điểm</span>
              <span className="text-2xl font-black text-amber-300">{totalPoints} đ</span>
            </div>
            <div className="text-center px-3 border-r border-white/20">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Nhiệm vụ xong</span>
              <span className="text-2xl font-black text-emerald-300">{student.completedTasksCount}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Huy hiệu</span>
              <span className="text-2xl font-black text-pink-300">{student.badges.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Tasks & Creations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Tasks */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-slate-800 text-lg">
                Nhiệm Vụ Học Tập Được Cô Giáo Giao
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {tasks.length} nhiệm vụ
            </span>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => {
              const isCompleted = task.completedBy.includes(student.id);

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 mr-2">
                        {task.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Hạn nộp: {task.deadline}
                      </span>
                      <h4 className="font-bold text-slate-800 text-base mt-1.5">
                        {task.title}
                      </h4>
                    </div>

                    {isCompleted ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã nộp bài
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        Cần làm
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {task.description}
                  </p>

                  {/* Submission Form if not completed */}
                  {!isCompleted && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <textarea
                        value={submissionContent[task.id] || ''}
                        onChange={(e) => setSubmissionContent({ ...submissionContent, [task.id]: e.target.value })}
                        placeholder="Nhập câu trả lời hoặc kết quả thực hiện của em..."
                        rows={2}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-between items-center">
                        <button
                          onClick={onOpenTutor}
                          className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          Hỏi gợi ý từ Robot AI
                        </button>
                        <button
                          onClick={() => handleSubmit(task.id)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Nộp Bài Cho Cô
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Badges & My Creations */}
        <div className="space-y-6">
          {/* My Badges */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-slate-800 text-base">Huy Hiệu Của Em</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {student.badges.map((b, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
                  <span className="text-2xl block mb-1">🏅</span>
                  <span className="text-xs font-bold text-amber-900 block">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions to Tutor and Creative Wing */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 space-y-3">
            <h4 className="font-black text-indigo-900 text-sm">Góc Sáng Tạo & Trợ Giúp</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Em muốn vẽ sơ đồ tư duy, viết truyện hay hỏi Robot AI?
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={onOpenTutor}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Bot className="w-4 h-4" />
                Mở Gia Sư AI Mắt Xanh
              </button>
              <button
                onClick={onOpenCreative}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Palette className="w-4 h-4" />
                Vào Xưởng Sáng Tạo AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
