import { Student } from '../types';

/**
 * Real Word Export (.doc UTF-8 HTML format compatible with MS Word)
 */
export function exportToWord(title: string, content: string, filename = 'Ke-Hoach-Bai-Day.doc') {
  const header = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; color: #111; margin: 2cm; }
    h1 { font-size: 16pt; color: #002060; text-align: center; text-transform: uppercase; margin-bottom: 8px; }
    h2 { font-size: 14pt; color: #1F497D; margin-top: 16px; border-bottom: 1px solid #B8CCE4; padding-bottom: 4px; }
    h3 { font-size: 13pt; color: #2E74B5; margin-top: 12px; }
    p { margin: 6px 0; text-align: justify; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #7F7F7F; padding: 6px 8px; text-align: left; }
    th { background-color: #DCE6F1; font-weight: bold; }
    .school-header { text-align: center; margin-bottom: 20px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="school-header">
    PHÒNG GD&ĐT KHOÁI CHÂU - TRƯỜNG TIỂU HỌC KHOÁI CHÂU 1<br/>
    LỚP 4C - NĂM HỌC 2025 - 2026<br/>
    ***
  </div>
  <h1>${title}</h1>
  <div>${content.replace(/\n/g, '<br/>')}</div>
</body>
</html>`;

  const blob = new Blob(['\ufeff', header], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print / Export PDF trigger
 */
export function printDocument(title: string, htmlContent: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Be Vietnam Pro', 'Times New Roman', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
        h1 { color: #1e40af; text-align: center; }
        .meta { text-align: center; margin-bottom: 30px; color: #64748b; font-size: 14px; }
        .content { white-space: pre-wrap; font-size: 15px; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div style="text-align: right; margin-bottom: 10px;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">In / Lưu PDF</button>
      </div>
      <h1>${title}</h1>
      <div class="meta">Trường Tiểu học Khoái Châu 1 - Lớp 4C | Giáo viên: Phạm Thị Tính</div>
      <div class="content">${htmlContent}</div>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Export Student Roster to CSV with UTF-8 BOM (Opens perfectly in Excel)
 */
export function exportStudentsToCSV(students: Student[], includePrivate = false) {
  const headers = includePrivate
    ? ['STT', 'Mã học sinh', 'Họ và tên', 'Tổ', 'Chức vụ', 'Điểm danh', 'Điểm Hợp tác', 'Điểm Nhiệm vụ', 'Điểm Sáng tạo', 'Giới tính', 'Ngày sinh', 'Dân tộc', 'Nơi ở', 'SĐT Phụ huynh']
    : ['STT', 'Mã học sinh', 'Họ và tên', 'Tổ', 'Chức vụ', 'Điểm danh', 'Điểm Hợp tác', 'Điểm Nhiệm vụ', 'Điểm Sáng tạo', 'Số bài hoàn thành'];

  const rows = students.map(s => {
    if (includePrivate) {
      return [
        s.stt,
        s.code,
        `"${s.fullName}"`,
        `"${s.group}"`,
        s.isLeader ? 'Tổ trưởng' : 'Thành viên',
        s.attendance === 'present' ? 'Có mặt' : s.attendance === 'absent' ? 'Vắng' : s.attendance === 'excused' ? 'Có phép' : 'Đi muộn',
        s.points.cooperation,
        s.points.tasks,
        s.points.creativity,
        s.sensitiveData?.gender || '1',
        s.sensitiveData?.birthDate || '2015-05-15',
        s.sensitiveData?.ethnicity || 'Kinh',
        `"${s.sensitiveData?.residence || 'Khoái Châu'}"`,
        `"${s.sensitiveData?.parentPhone || ''}"`,
      ];
    }
    return [
      s.stt,
      s.code,
      `"${s.fullName}"`,
      `"${s.group}"`,
      s.isLeader ? 'Tổ trưởng' : 'Thành viên',
      s.attendance === 'present' ? 'Có mặt' : s.attendance === 'absent' ? 'Vắng' : s.attendance === 'excused' ? 'Có phép' : 'Đi muộn',
      s.points.cooperation,
      s.points.tasks,
      s.points.creativity,
      s.completedTasksCount,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Danh-Sach-Lop-4C-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Backup state to JSON file
 */
export function backupDataToJson(data: any, filename = 'SmartClass4C-Backup.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
