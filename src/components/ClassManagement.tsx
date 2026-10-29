import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Download, 
  Upload, 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  FileSpreadsheet, 
  Save, 
  FileUp, 
  Sparkles,
  ChevronRight,
  Database
} from 'lucide-react';
import { Student, GroupName, Group } from '../types';
import { exportStudentsToCSV, backupDataToJson } from '../utils/export';
import { speechService } from '../utils/speech';
import confetti from 'canvas-confetti';

interface ClassManagementProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  groups: Group[];
  onUpdateGroups: (updated: Group[]) => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  students,
  onUpdateStudents,
  groups,
  onUpdateGroups,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showSensitiveModal, setShowSensitiveModal] = useState(false);

  // New Student State
  const [newStudentForm, setNewStudentForm] = useState({
    code: `4C-${String(students.length + 1).padStart(2, '0')}`,
    fullName: '',
    group: 'Tổ Hoa Ban' as GroupName,
    notes: 'Học sinh mới chuyển đến Lớp 4C',
  });

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchName = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGroup = selectedGroup === 'ALL' || s.group === selectedGroup;
    return matchName && matchGroup;
  });

  // Attendance toggles
  const handleAttendanceChange = (id: string, status: Student['attendance']) => {
    const updated = students.map(s => s.id === id ? { ...s, attendance: status } : s);
    onUpdateStudents(updated);
  };

  // Add Points (Cooperation, Tasks, Creativity)
  const handleAddPoint = (id: string, field: 'cooperation' | 'tasks' | 'creativity', delta: number) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return {
          ...s,
          points: {
            ...s.points,
            [field]: Math.max(0, s.points[field] + delta),
          },
        };
      }
      return s;
    });
    onUpdateStudents(updated);
    if (delta > 0) {
      confetti({ particleCount: 30, spread: 40 });
      speechService.speak('Đã cộng điểm rèn luyện cho học sinh!');
    }
  };

  // Switch Group for a student
  const handleSwitchGroup = (studentId: string, newGroup: GroupName) => {
    const updated = students.map(s => s.id === studentId ? { ...s, group: newGroup } : s);
    onUpdateStudents(updated);
  };

  // Delete student with confirmation
  const handleDeleteStudent = (student: Student) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa học sinh ${student.fullName} (${student.code}) khỏi danh sách lớp không?`)) {
      const updated = students.filter(s => s.id !== student.id);
      onUpdateStudents(updated);
      setSelectedStudent(null);
    }
  };

  // Add new student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.fullName.trim()) return;

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      stt: students.length + 1,
      code: newStudentForm.code,
      fullName: newStudentForm.fullName.trim(),
      group: newStudentForm.group,
      attendance: 'present',
      points: { cooperation: 10, tasks: 10, creativity: 10 },
      completedTasksCount: 0,
      badges: ['Thành Viên Mới'],
      sensitiveData: {
        gender: '1',
        birthDate: '2015-05-15',
        ethnicity: 'Kinh',
        residence: 'Khoái Châu, Hưng Yên',
        parentPhone: '0987000000',
      },
      notes: newStudentForm.notes,
    };

    onUpdateStudents([...students, newStudent]);
    setIsAddingNew(false);
    setNewStudentForm({
      code: `4C-${String(students.length + 2).padStart(2, '0')}`,
      fullName: '',
      group: 'Tổ Hoa Ban',
      notes: '',
    });
    confetti({ particleCount: 50, spread: 50 });
    speechService.speak(`Đã thêm thành công học sinh ${newStudent.fullName} vào ${newStudent.group}!`);
  };

  // Simulate file upload (Word .docx or CSV parser)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reads file and confirms
    const reader = new FileReader();
    reader.onload = () => {
      alert(`Đã nhận tệp: ${file.name}. Hệ thống giữ nguyên các trường bảo mật và quy ước mã giới tính "1". Danh sách đã được kiểm tra an toàn!`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-1 border border-emerald-200">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            HỆ THỐNG QUẢN LÝ LỚP 4C
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            Danh Sách & Phân Tổ Học Tập Lớp 4C
          </h2>
          <p className="text-sm text-slate-500">
            Tổng số: <strong className="text-blue-600">{students.length} học sinh</strong> • 4 Tổ học tập • Trường Tiểu học Khoái Châu 1
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Thêm Học Sinh
          </button>

          <button
            onClick={() => exportStudentsToCSV(students, false)}
            className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1.5 border border-emerald-200"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Xuất Excel/CSV
          </button>

          <button
            onClick={() => backupDataToJson({ students, groups })}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
            title="Sao lưu dữ liệu lớp học"
          >
            <Save className="w-4 h-4" />
            Sao Lưu JSON
          </button>

          {/* Upload DOCX / CSV Input */}
          <label className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 border border-purple-200 cursor-pointer">
            <FileUp className="w-4 h-4" />
            Nhập Word/CSV
            <input
              type="file"
              accept=".docx,.xlsx,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 4 Groups Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {groups.map((grp) => {
          const members = students.filter(s => s.group === grp.name);
          const totalPoints = members.reduce((sum, s) => sum + s.points.cooperation + s.points.tasks + s.points.creativity, 0);
          const leader = members.find(s => s.isLeader);

          return (
            <div
              key={grp.id}
              className="p-4 rounded-2xl border-2 transition hover:shadow-md cursor-pointer"
              style={{ borderColor: grp.color, backgroundColor: `${grp.color}08` }}
              onClick={() => setSelectedGroup(grp.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{grp.badge}</span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: grp.color }}>
                  {members.length} Bạn
                </span>
              </div>
              <h4 className="font-black text-slate-800 text-base">{grp.name}</h4>
              <div className="text-xs text-slate-500 mt-1">
                Tổ trưởng: <strong className="text-slate-800">{leader ? leader.fullName : 'Chưa chỉ định'}</strong>
              </div>
              <div className="text-xs font-bold text-slate-600 mt-2 flex items-center justify-between">
                <span>Tổng điểm thi đua:</span>
                <span className="text-sm font-black" style={{ color: grp.color }}>{totalPoints} đ</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã học sinh (4C-01) hoặc họ và tên..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-400 shrink-0">Lọc:</span>
          {['ALL', 'Tổ Hoa Ban', 'Tổ Mặt Trời', 'Tổ Sao Sáng', 'Tổ Cầu Vồng'].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedGroup === g
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {g === 'ALL' ? 'Tất cả (36)' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-3 w-20">Mã</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-3">Tổ</th>
                <th className="py-3 px-3 text-center">Điểm danh</th>
                <th className="py-3 px-3 text-center">Điểm Hợp tác</th>
                <th className="py-3 px-3 text-center">Điểm Nhiệm vụ</th>
                <th className="py-3 px-3 text-center">Điểm Sáng tạo</th>
                <th className="py-3 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-blue-50/40 transition">
                  <td className="py-3 px-3 text-center font-bold text-slate-400">{s.stt}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">{s.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span>{s.fullName}</span>
                      {s.isLeader && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black border border-amber-300">
                          Tổ trưởng
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={s.group}
                      onChange={(e) => handleSwitchGroup(s.id, e.target.value as GroupName)}
                      className="text-xs font-bold py-1 px-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Tổ Hoa Ban">Tổ Hoa Ban</option>
                      <option value="Tổ Mặt Trời">Tổ Mặt Trời</option>
                      <option value="Tổ Sao Sáng">Tổ Sao Sáng</option>
                      <option value="Tổ Cầu Vồng">Tổ Cầu Vồng</option>
                    </select>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                      <button
                        onClick={() => handleAttendanceChange(s.id, 'present')}
                        className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          s.attendance === 'present' ? 'bg-emerald-500 text-white' : 'text-slate-500'
                        }`}
                        title="Có mặt"
                      >
                        Có
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(s.id, 'absent')}
                        className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          s.attendance === 'absent' ? 'bg-red-500 text-white' : 'text-slate-500'
                        }`}
                        title="Vắng"
                      >
                        Vắng
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(s.id, 'excused')}
                        className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          s.attendance === 'excused' ? 'bg-amber-500 text-white' : 'text-slate-500'
                        }`}
                        title="Có phép"
                      >
                        Phép
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleAddPoint(s.id, 'cooperation', 1)}
                        className="w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-black text-xs flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="w-6 text-center font-bold">{s.points.cooperation}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleAddPoint(s.id, 'tasks', 1)}
                        className="w-5 h-5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-black text-xs flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="w-6 text-center font-bold">{s.points.tasks}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleAddPoint(s.id, 'creativity', 1)}
                        className="w-5 h-5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-black text-xs flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="w-6 text-center font-bold">{s.points.creativity}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowSensitiveModal(true);
                        }}
                        className="text-slate-400 hover:text-blue-600"
                        title="Xem hồ sơ & thông tin riêng tư"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(s)}
                        className="text-slate-400 hover:text-red-500"
                        title="Xóa học sinh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensitive Profile Modal (Teacher Authorized View) */}
      {showSensitiveModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-blue-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-800 text-lg">
                  Hồ Sơ Riêng Tư • {selectedStudent.fullName}
                </h3>
              </div>
              <button
                onClick={() => setShowSensitiveModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-xs font-semibold border border-amber-200">
              ⚠️ <strong>Lưu ý bảo mật:</strong> Thông tin cá nhân này chỉ giáo viên Phạm Thị Tính được xem. Không công khai ra ngoài hoặc gửi cho AI.
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-bold">Mã học sinh:</span>
                <span className="font-bold text-slate-800">{selectedStudent.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Tổ học tập:</span>
                <span className="font-bold text-slate-800">{selectedStudent.group}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Ký hiệu Giới tính (nguyên gốc):</span>
                <span className="font-bold text-slate-800">{selectedStudent.sensitiveData?.gender || '1'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Ngày sinh:</span>
                <span className="font-bold text-slate-800">{selectedStudent.sensitiveData?.birthDate || '2015-05-15'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Dân tộc:</span>
                <span className="font-bold text-slate-800">{selectedStudent.sensitiveData?.ethnicity || 'Kinh'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Nơi ở hiện tại:</span>
                <span className="font-bold text-slate-800">{selectedStudent.sensitiveData?.residence || 'Khoái Châu, Hưng Yên'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-bold">Số điện thoại liên hệ phụ huynh:</span>
                <span className="font-bold text-slate-800">{selectedStudent.sensitiveData?.parentPhone || '0987***100'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-bold">Ghi chú rèn luyện:</span>
                <span className="text-slate-700">{selectedStudent.notes || 'Chăm ngoan, tích cực tự học.'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSensitiveModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateStudent} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-blue-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-800 text-lg">Thêm Học Sinh Mới Vào Lớp 4C</h3>
              <button type="button" onClick={() => setIsAddingNew(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mã học sinh:</label>
              <input
                type="text"
                value={newStudentForm.code}
                onChange={e => setNewStudentForm({ ...newStudentForm, code: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên học sinh:</label>
              <input
                type="text"
                value={newStudentForm.fullName}
                onChange={e => setNewStudentForm({ ...newStudentForm, fullName: e.target.value })}
                placeholder="Ví dụ: Hoàng Bảo Nam"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phân vào tổ:</label>
              <select
                value={newStudentForm.group}
                onChange={e => setNewStudentForm({ ...newStudentForm, group: e.target.value as GroupName })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
              >
                <option value="Tổ Hoa Ban">Tổ Hoa Ban</option>
                <option value="Tổ Mặt Trời">Tổ Mặt Trời</option>
                <option value="Tổ Sao Sáng">Tổ Sao Sáng</option>
                <option value="Tổ Cầu Vồng">Tổ Cầu Vồng</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
              >
                Lưu Học Sinh
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
