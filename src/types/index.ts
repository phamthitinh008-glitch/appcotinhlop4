export type UserRole = 'teacher' | 'student' | 'parent';

export type GroupName = 'Tổ Hoa Ban' | 'Tổ Mặt Trời' | 'Tổ Sao Sáng' | 'Tổ Cầu Vồng';

export interface SensitiveStudentData {
  gender?: string; // e.g. "1" or "Nam" / "Nữ" (kept intact as in docx)
  birthDate?: string;
  ethnicity?: string;
  residence?: string;
  parentPhone?: string;
}

export interface Student {
  id: string;
  stt: number;
  code: string; // e.g. "4C-01"
  fullName: string;
  group: GroupName;
  isLeader?: boolean;
  avatarId?: number;
  attendance: 'present' | 'absent' | 'excused' | 'late';
  points: {
    cooperation: number; // Điểm hợp tác
    tasks: number;       // Điểm nhiệm vụ
    creativity: number;  // Điểm sáng tạo
  };
  completedTasksCount: number;
  badges: string[];
  sensitiveData?: SensitiveStudentData;
  notes?: string;
}

export interface Group {
  id: string;
  name: GroupName;
  leaderId: string;
  memberIds: string[];
  color: string;
  badge: string;
}

export type Subject = 
  | 'Toán'
  | 'Tiếng Việt'
  | 'Tiếng Anh'
  | 'Khoa học'
  | 'Lịch sử và Địa lí'
  | 'Đạo đức'
  | 'Tin học'
  | 'Công nghệ'
  | 'Hoạt động trải nghiệm';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint?: string;
  subject?: Subject;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface MindmapBranch {
  id: string;
  title: string;
  color: string;
  subBranches: string[];
}

export interface MindmapData {
  topic: string;
  color: string;
  branches: MindmapBranch[];
}

export interface StoryPage {
  pageNumber: number;
  scene: string;
  narration: string;
  dialogue?: string;
  illustrationPrompt?: string;
}

export interface StoryData {
  title: string;
  moral: string;
  pages: StoryPage[];
}

export interface LearningTask {
  id: string;
  title: string;
  subject: Subject;
  deadline: string;
  description: string;
  criteria: string[];
  completedBy: string[]; // student ids
  submissions: {
    studentId: string;
    studentName: string;
    submittedAt: string;
    content: string;
    score?: number;
    feedback?: string;
  }[];
}

export interface ResourceItem {
  id: string;
  title: string;
  subject: Subject;
  type: 'video' | 'worksheet' | 'slide' | 'stem' | 'mindmap';
  description: string;
  url?: string;
  downloads: number;
  createdAt: string;
  author: string;
}

export interface StudentCreation {
  id: string;
  title: string;
  studentId: string;
  studentName: string;
  group: GroupName;
  type: 'mindmap' | 'story' | 'stem' | 'presentation';
  summary: string;
  likes: number;
  featured: boolean;
  teacherComment?: string;
  badgeAwarded?: string;
  createdAt: string;
}

export interface TeacherProfile {
  name: string;
  role: string;
  school: string;
  classRoom: string;
  bio: string;
  avatar: string;
  bannerTheme: 'blue' | 'gradient' | 'sunny' | 'rainbow';
}
