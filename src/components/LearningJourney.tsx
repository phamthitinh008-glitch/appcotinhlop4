import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Lightbulb, 
  Share2, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Star, 
  MessageSquare,
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';
import { speechService } from '../utils/speech';
import confetti from 'canvas-confetti';

interface StepItem {
  id: number;
  title: string;
  tagline: string;
  desc: string;
  icon: string;
  color: string;
  tasks: string[];
}

const STEPS: StepItem[] = [
  {
    id: 1,
    title: 'Bước 1 – Định hướng',
    tagline: 'Xác định mục tiêu & Tiêu chí',
    desc: 'Giáo viên Phạm Thị Tính giao nhiệm vụ, mô tả sản phẩm cần tạo và các tiêu chí đánh giá chuẩn xác.',
    icon: '🎯',
    color: '#3B82F6', // Blue
    tasks: [
      'Đọc kỹ yêu cầu bài tập và mục tiêu cần đạt',
      'Tìm hiểu tiêu chí đánh giá (Rubric) của cô giáo',
      'Xác định thành viên trong tổ tham gia (Hoa Ban, Mặt Trời, Sao Sáng, Cầu Vồng)',
    ],
  },
  {
    id: 2,
    title: 'Bước 2 – Khám phá',
    tagline: 'Tìm tòi kiến thức & Trao đổi AI',
    desc: 'Học sinh tìm hiểu kiến thức trong sách giáo khoa, đọc học liệu số và hỏi đáp cùng Robot AI mắt xanh.',
    icon: '🔍',
    color: '#8B5CF6', // Purple
    tasks: [
      'Đọc tài liệu và quan sát hình ảnh gợi ý',
      'Đặt câu hỏi với Gia sư AI theo 3 mức hỗ trợ',
      'Ghi chép các từ khóa và dữ kiện quan trọng',
    ],
  },
  {
    id: 3,
    title: 'Bước 3 – Sáng tạo',
    tagline: 'Chế tác & Thực hiện sản phẩm',
    desc: 'Học sinh làm việc cá nhân hoặc nhóm, tạo Sơ đồ tư duy, Tranh kể chuyện, Slide thuyết trình hoặc sản phẩm STEM 3D.',
    icon: '🎨',
    color: '#EC4899', // Pink
    tasks: [
      'Chọn hình thức sản phẩm: Sơ đồ tư duy, Truyện tranh hoặc STEM 3D',
      'Ứng dụng ý tưởng sáng tạo độc đáo của bản thân',
      'Hoàn thiện sản phẩm và kiểm tra tính thẩm mỹ',
    ],
  },
  {
    id: 4,
    title: 'Bước 4 – Trình bày',
    tagline: 'Thuyết minh & Chia sẻ',
    desc: 'Học sinh thuyết trình trước lớp hoặc quay video/ghi âm giải thích ý tưởng sản phẩm đến thầy cô và bạn bè.',
    icon: '🎤',
    color: '#10B981', // Emerald
    tasks: [
      'Lập dàn ý bài thuyết trình ngắn gọn 2-3 phút',
      'Luyện tập phát âm rõ ràng, tự tin',
      'Chia sẻ sản phẩm lên Góc sáng tạo Lớp 4C',
    ],
  },
  {
    id: 5,
    title: 'Bước 5 – Tự đánh giá',
    tagline: 'Đối chiếu & Hoàn thiện',
    desc: 'Học sinh tự nhận xét theo phiếu đánh giá (Rubric), tiếp nhận góp ý từ bạn bè và nhận xét gợi ý từ AI.',
    icon: '⭐',
    color: '#F59E0B', // Amber
    tasks: [
      'Chấm điểm tự đánh giá theo 4 mức độ',
      'Lắng nghe nhận xét của các bạn trong tổ',
      'Tiếp thu hướng dẫn của cô giáo Phạm Thị Tính để tiến bộ hơn',
    ],
  },
];

export const LearningJourney: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({
    '1-0': true,
    '1-1': true,
    '2-0': true,
  });

  // Rubric Self Assessment
  const [rubricScores, setRubricScores] = useState({
    clarity: 4, // 1 to 4 stars
    creativity: 4,
    collaboration: 4,
    presentation: 3,
  });

  const toggleTask = (stepId: number, taskIdx: number) => {
    const key = `${stepId}-${taskIdx}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeStepData = STEPS.find(s => s.id === currentStep)!;

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      confetti({ particleCount: 30, spread: 50 });
      speechService.speak(`Chúc mừng em đã hoàn thành ${activeStepData.title}! Chúng mình cùng bước sang chặng tiếp theo nhé!`);
    } else {
      speechService.speak('Tuyệt vời! Em đã hoàn thành trọn vẹn Hành trình học tập 5 bước của Lớp 4C!');
      confetti({ particleCount: 90, spread: 80 });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-1 border border-blue-200">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            MÔ HÌNH DẠY HỌC PHÁT TRIỂN NĂNG LỰC
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            Quy Trình Học Tập 5 Bước Lớp 4C
          </h2>
          <p className="text-sm text-slate-500">
            Hành trình: Định hướng → Khám phá → Sáng tạo → Trình bày → Tự đánh giá
          </p>
        </div>

        <button
          onClick={() => speechService.speak(`${activeStepData.title}: ${activeStepData.desc}`)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 self-start md:self-auto"
        >
          <Play className="w-3.5 h-3.5 text-blue-600" />
          Nghe Hướng Dẫn Bước Này
        </button>
      </div>

      {/* 5-Step Visual Stepper Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {STEPS.map((s) => {
          const isActive = s.id === currentStep;
          const isDone = s.id < currentStep;

          return (
            <button
              key={s.id}
              onClick={() => setCurrentStep(s.id)}
              className={`p-3 rounded-2xl flex flex-col items-center text-center transition border-2 ${
                isActive
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
                  : isDone
                  ? 'border-emerald-300 bg-emerald-50/50 text-emerald-800'
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xl">{s.icon}</span>
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <span className="text-xs font-black text-slate-800">{s.title.split('–')[1] || s.title}</span>
              <span className="text-[10px] text-slate-400 font-medium">{s.tagline}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Card */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm text-white font-black"
              style={{ backgroundColor: activeStepData.color }}
            >
              {activeStepData.icon}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Chặng {activeStepData.id} / 5
              </span>
              <h3 className="text-xl font-black text-slate-800">{activeStepData.title}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{activeStepData.tagline}</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            {activeStepData.tasks.filter((_, idx) => completedTasks[`${activeStepData.id}-${idx}`]).length} / {activeStepData.tasks.length} nhiệm vụ xong
          </span>
        </div>

        <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          {activeStepData.desc}
        </p>

        {/* Step Task Checklist */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Các nhiệm vụ em cần hoàn thành ở bước này:
          </h4>
          <div className="space-y-2">
            {activeStepData.tasks.map((task, idx) => {
              const isChecked = !!completedTasks[`${activeStepData.id}-${idx}`];
              return (
                <div
                  key={idx}
                  onClick={() => toggleTask(activeStepData.id, idx)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs md:text-sm">{task}</span>
                  </div>
                  {isChecked && <span className="text-[11px] font-bold text-emerald-600">Đã xong ✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rubric Section (Shown when in Step 5: Tự đánh giá) */}
        {currentStep === 5 && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-4">
            <h4 className="text-xs font-black text-amber-900 uppercase flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-600" />
              Phiếu Tự Đánh Giá Năng Lực (Rubric 4 Mức)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'clarity', label: '1. Nắm vững kiến thức bài học' },
                { key: 'creativity', label: '2. Tính sáng tạo của sản phẩm' },
                { key: 'collaboration', label: '3. Tinh thần hợp tác cùng tổ' },
                { key: 'presentation', label: '4. Khả năng tự tin trình bày' },
              ].map((item) => (
                <div key={item.key} className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700">{item.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRubricScores({ ...rubricScores, [item.key]: star })}
                        className={`text-base ${
                          (rubricScores as any)[item.key] >= star ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 disabled:opacity-40"
          >
            ← Chặng Trước
          </button>

          <button
            onClick={handleNextStep}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs md:text-sm shadow-md flex items-center gap-2"
          >
            <span>{currentStep === 5 ? 'Hoàn Thành Toàn Bộ Quy Trình 🎉' : 'Hoàn Thành & Chuyển Sang Bước Tiếp →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
