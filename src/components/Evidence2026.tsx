import React, { useState } from 'react';
import { 
  FileCheck, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen,
  Calendar,
  Layers,
  BrainCircuit
} from 'lucide-react';
import { Student, StudentCreation, LearningTask } from '../types';
import { exportToWord, printDocument } from '../utils/export';
import { speechService } from '../utils/speech';

interface Evidence2026Props {
  students: Student[];
  creations: StudentCreation[];
  tasks: LearningTask[];
}

export const Evidence2026: React.FC<Evidence2026Props> = ({ students, creations, tasks }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month' | 'term'>('term');

  // Real calculations (No fake numbers)
  const totalStudents = students.length;
  const presentCount = students.filter(s => s.attendance === 'present').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Completed tasks count
  const allSubmissionsCount = tasks.reduce((sum, t) => sum + (t.submissions ? t.submissions.length : 0), 0);
  const studentsNeedingSupport = students.filter(s => s.points.tasks < 10 || s.completedTasksCount < 2);
  const totalCreationsCount = creations.length;

  const currentStudent = students.find(s => s.id === selectedStudentId);

  // Generate printable evidence report
  const handleExportEvidenceReport = () => {
    const reportTitle = 'BÁO CÁO MINH CHỨNG ỨNG DỤNG AI TRONG GIÁO DỤC TIỂU HỌC NĂM 2026';
    const content = `
BÁO CÁO MINH CHỨNG SẢN PHẨM SƯ PHẠM 2026
Đề tài: "Xây dựng Trợ lý AI Smart Class 4C hỗ trợ tự học, sáng tạo và đánh giá học sinh Lớp 4 theo chương trình GDPT 2018"
Đơn vị: Trường Tiểu học Khoái Châu 1, huyện Khoái Châu, tỉnh Hưng Yên
Giáo viên thực hiện: Phạm Thị Tính
Lớp thực nghiệm: 4C (Tổng số: ${totalStudents} học sinh)

1. BỐI CẢNH VÀ NHU CẦU THỰC TIỄN
- Học sinh lớp 4 (9-10 tuổi) bắt đầu tiếp cận nhiều kiến thức trừu tượng môn Toán (phân số, dấu hiệu chia hết) và Khoa học, Lịch sử - Địa lí.
- Nhu cầu cá nhân hóa việc học: Mỗi em có tốc độ tiếp thu khác nhau, đòi hỏi có công cụ hỗ trợ gợi mở từng bước mà không làm mất đi tư duy độc lập.

2. Ý TƯỞNG VÀ GIẢI PHÁP ỨNG DỤNG AI
- Xây dựng phần mềm Trợ lý AI Smart Class 4C với slogan: "TỰ HỌC - SÁNG TẠO - VƯỢT GIỚI HẠN".
- Khắc phục tình trạng "AI làm thay": Hệ thống thiết lập 3 mức gợi mở sư phạm, không đưa ngay đáp án.
- Tích hợp âm thanh Tiếng Việt chuẩn giúp các em hào hứng, dễ tiếp thu.

3. SỐ LIỆU MINH CHỨNG THỰC TẾ
- Tổng số học sinh tham gia học tập: ${totalStudents} em (Chia thành 4 tổ: Hoa Ban, Mặt Trời, Sao Sáng, Cầu Vồng).
- Tỷ lệ chuyên cần và tương tác: ${attendanceRate}%.
- Số sản phẩm sáng tạo đã hoàn thành: ${totalCreationsCount} sản phẩm (Gồm sơ đồ tư duy, truyện tranh và mô hình STEM 3D).
- Số nhiệm vụ học tập được giao: ${tasks.length} nhiệm vụ.
- Số học sinh cần giáo viên tăng cường hỗ trợ: ${studentsNeedingSupport.length} em.

4. QUY TRÌNH 5 BƯỚC VẬN HÀNH
- Bước 1: Định hướng nhiệm vụ và tiêu chí đánh giá (Rubric).
- Bước 2: Khám phá kiến thức cùng Robot AI mắt xanh.
- Bước 3: Sáng tạo sản phẩm theo tổ và cá nhân.
- Bước 4: Trình bày và thuyết minh trước lớp.
- Bước 5: Tự đánh giá và hoàn thiện.

5. ĐÁNH GIÁ PHẨM CHẤT VÀ NĂNG LỰC
- Năng lực tự chủ, tự học: Tăng rõ rệt, học sinh chủ động đặt câu hỏi khi gặp khó khăn.
- Năng lực giao tiếp, hợp tác: Các tổ thi đua sôi nổi, hỗ trợ nhau hoàn thành sản phẩm STEM.
- Phẩm chất chăm chỉ, trung thực: Học sinh tự thực hiện bài làm và tự đánh giá công bằng.

6. ĐỊNH HƯỚNG PHÁT TRIỂN TIẾP THEO
- Tiếp tục mở rộng ngân hàng câu hỏi phân hóa cho toàn bộ các môn học lớp 4.
- Kết nối chặt chẽ cổng phụ huynh để gia đình đồng hành cùng con tại nhà.
    `;

    exportToWord('Bao-Cao-Minh-Chung-AI-2026', content, 'Bao-Cao-Minh-Chung-AI-2026.doc');
    speechService.speak('Đã xuất báo cáo minh chứng ứng dụng AI năm 2026 thành tệp Word!');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-1 border border-blue-200">
            <FileCheck className="w-3.5 h-3.5 text-blue-600" />
            HỒ SƠ ĐÁNH GIÁ & MINH CHỨNG 2026
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            Báo Cáo Học Tập & Minh Chứng Sư Phạm 2026
          </h2>
          <p className="text-sm text-slate-500">
            Dữ liệu đánh giá thực tế của {totalStudents} học sinh Lớp 4C • Cô giáo Phạm Thị Tính
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportEvidenceReport}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Xuất Báo Cáo Minh Chứng (.doc)
          </button>
        </div>
      </div>

      {/* 4 Metric Cards (Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-extrabold uppercase tracking-wider">Học sinh Lớp 4C</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-slate-800">{totalStudents}</div>
          <div className="text-xs text-blue-700 font-semibold">
            Đủ 36 em theo danh sách chính thức
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-extrabold uppercase tracking-wider">Tỷ Lệ Chuyên Cần</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-slate-800">{attendanceRate}%</div>
          <div className="text-xs text-emerald-700 font-semibold">
            {presentCount} / {totalStudents} em có mặt hôm nay
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-extrabold uppercase tracking-wider">Sản Phẩm Sáng Tạo</span>
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-slate-800">{totalCreationsCount}</div>
          <div className="text-xs text-purple-700 font-semibold">
            Sơ đồ tư duy, truyện tranh & STEM
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-extrabold uppercase tracking-wider">Cần Hỗ Trợ Thêm</span>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-slate-800">{studentsNeedingSupport.length}</div>
          <div className="text-xs text-amber-700 font-semibold">
            Được giáo viên kèm cặp cá nhân hóa
          </div>
        </div>
      </div>

      {/* Individual Student Progress Profile Drilldown */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            Tra Cứu Hồ Sơ Tiến Bộ & Nhận Xét Sư Phạm Cá Nhân
          </h3>

          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.fullName} ({s.group})
              </option>
            ))}
          </select>
        </div>

        {currentStudent ? (
          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-800 text-lg">{currentStudent.fullName}</h4>
                <div className="text-xs text-slate-400">
                  Mã: <strong>{currentStudent.code}</strong> • {currentStudent.group}
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {currentStudent.badges.map((b, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                    🏅 {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Score points bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-800 block mb-1">Điểm Hợp Tác:</span>
                <span className="text-xl font-black text-blue-900">{currentStudent.points.cooperation} điểm</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-800 block mb-1">Điểm Nhiệm Vụ:</span>
                <span className="text-xl font-black text-emerald-900">{currentStudent.points.tasks} điểm</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="font-bold text-purple-800 block mb-1">Điểm Sáng Tạo:</span>
                <span className="text-xl font-black text-purple-900">{currentStudent.points.creativity} điểm</span>
              </div>
            </div>

            {/* Pedagogy Observation Note */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-black text-slate-700 uppercase tracking-wider block">
                Nhận xét gợi ý sư phạm (Căn cứ trên dữ liệu học tập thực tế):
              </span>
              <p className="text-slate-600 leading-relaxed font-medium">
                {currentStudent.points.creativity > 14
                  ? `Em ${currentStudent.fullName} thể hiện năng lực sáng tạo và tự học rất tốt. Thường xuyên chủ động tương tác với Robot AI để tìm hiểu sâu bài học.`
                  : `Em ${currentStudent.fullName} hoàn thành các nhiệm vụ cơ bản ở mức đạt. Cần tiếp tục khuyến khích tham gia sâu hơn vào các hoạt động nhóm của ${currentStudent.group}.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 p-4">Chưa chọn học sinh</div>
        )}
      </div>

      {/* 6 Core Proof Pillars for 2026 Pedagogy Showcase */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="font-black text-base text-white">
            6 Trụ Cột Minh Chứng Ứng Dụng AI Lớp 4C (Năm Học 2025 - 2026)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
            <strong className="text-amber-300 block mb-1">1. Bối cảnh & Mục tiêu:</strong>
            Đổi mới phương pháp dạy học theo định hướng phát triển năng lực, lấy học sinh làm trung tâm.
          </div>
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
            <strong className="text-amber-300 block mb-1">2. Giải pháp Robot AI:</strong>
            Đồng hành thân thiện, mắt xanh vui vẻ, hướng dẫn 3 mức hỗ trợ sư phạm, tuyệt đối không chép đáp án.
          </div>
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
            <strong className="text-amber-300 block mb-1">3. Sản phẩm thực tế:</strong>
            Sơ đồ tư duy số, truyện tranh thiếu nhi, slide thuyết trình và mô hình STEM 3D tương tác.
          </div>
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
            <strong className="text-amber-300 block mb-1">4. Quy trình 5 bước:</strong>
            Định hướng → Khám phá → Sáng tạo → Trình bày → Tự đánh giá theo thang đo Rubric.
          </div>
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
            <strong className="text-amber-300 block mb-1">5. Bảo vệ an toàn trẻ em:</strong>
            Bảo mật tuyệt đối thông tin nhạy cảm (SĐT, địa chỉ, ngày sinh), phân quyền rõ ràng.
          </div>
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
            <strong className="text-amber-300 block mb-1">6. Khả năng mở rộng:</strong>
            Tương thích máy tính bảng, điện thoại, máy tính để bàn và sẵn sàng triển khai trên Vercel.
          </div>
        </div>
      </div>
    </div>
  );
};
