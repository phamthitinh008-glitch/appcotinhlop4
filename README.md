# ỨNG DỤNG CÔNG NGHỆ AI VÀO GIẢNG DẠY VÀ HỌC TẬP VỚI TRỢ LÝ AI LỚP 4
## Smart Class 4C – AI Learning Companion
**Khẩu hiệu: TỰ HỌC – SÁNG TẠO – VƯỢT GIỚI HẠN**

- **Giáo viên phụ trách:** Phạm Thị Tính
- **Đơn vị:** Trường Tiểu học Khoái Châu 1, huyện Khoái Châu, tỉnh Hưng Yên
- **Lớp:** 4C (36 học sinh - 4 tổ học tập)
- **Chương trình:** Giáo dục phổ thông 2018 (GDPT 2018)
- **Công nghệ cốt lõi:** React 19, TypeScript, Google Gemini API, Tailwind CSS, Web Speech API (vi-VN), Express / Vercel Serverless.

---

## I. TỔNG QUAN TÍNH NĂNG ĐÃ TRIỂN KHAI HOÀN CHỈNH

1. **Gia sư AI cá nhân hóa:** Hỗ trợ 9 môn học lớp 4, 3 mức trợ giúp sư phạm (Gợi ý nhẹ -> Từng bước -> Chi tiết & Tương tự), chip hành động nhanh, giọng đọc tiếng Việt chuẩn `vi-VN`.
2. **Học tập thông minh 5 bước:** Định hướng -> Khám phá -> Sáng tạo -> Trình bày -> Tự đánh giá (Rubric 4 mức).
3. **8 Đấu trường Trò chơi kiến thức:** Ai là triệu phú (50:50, AI hint), Vòng quay may mắn, Ô cửa bí mật, Ghép đôi thông minh, Điền từ còn thiếu, Giải cứu Robot AI (nạp pin), Đua xe tri thức, Sắp xếp đáp án. Kèm công cụ AI sinh câu hỏi hàng loạt (10 câu, 20 câu, 50 câu).
4. **Xưởng sáng tạo AI:**
   - Sơ đồ tư duy AI (Mindmap tương tác phân nhánh).
   - Tranh kể chuyện AI (Soạn 4 trang truyện tranh đạo đức, in/xuất PDF).
   - Slide thuyết trình & Luyện tập thu âm.
   - Phòng thực hành STEM 3D tương tác (6 mô hình: Ngôi nhà xanh, Cầu vượt mini, Hệ Mặt Trời, Mạch điện cơ bản, Vườn cây thông minh, Thành phố tương lai với xoay 360 độ và bật tắt công tắc).
5. **Quản lý danh sách 36 học sinh lớp 4C:** Đủ 36 em đúng họ tên tiếng Việt có dấu, chia sẵn 4 tổ (Hoa Ban, Mặt Trời, Sao Sáng, Cầu Vồng), điểm danh, cộng điểm rèn luyện, bảo mật thông tin nhạy cảm (SĐT, ngày sinh, quy ước giới tính "1"). Xuất file CSV/Excel và sao lưu JSON.
6. **Soạn kế hoạch bài dạy bằng AI:** Chuẩn 13 mục GDPT 2018, tải file Word (.doc) và PDF thực sự.
7. **Báo cáo học tập & Minh chứng sản phẩm 2026:** Thống kê lớp học thời gian thực, hồ sơ tiến bộ cá nhân, xuất báo cáo sư phạm 6 trụ cột.
8. **Phân quyền 3 đối tượng:** Giáo viên quản trị, Không gian học sinh, Cổng phụ huynh đồng hành.
9. **Âm thanh tiếng Việt vi-VN:** Tích hợp đọc câu hỏi, giải thích và các câu khen thưởng tự nhiên.

---

## II. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY THỬ (LOCAL)

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Cấu hình biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc:
```env
GEMINI_API_KEY="AIzaSy..."
PORT=3000
```
*Lưu ý:* Nếu chưa cấu hình `GEMINI_API_KEY`, ứng dụng vẫn hoạt động bình thường nhờ cơ chế Fallback sư phạm được thiết kế sẵn.

### 3. Chạy môi trường phát triển
```bash
npm run dev
```
Truy cập: `http://localhost:3000`

### 4. Build kiểm thử Production
```bash
npm run build
```

---

## III. HƯỚNG DẪN TRIỂN KHAI LÊN VERCEL

1. Đưa mã nguồn lên GitHub repository cá nhân.
2. Đăng nhập vào [Vercel](https://vercel.com) và chọn **Add New Project** -> Chọn repository vừa tạo.
3. Trong phần **Environment Variables**, thêm biến:
   - `GEMINI_API_KEY`: Khóa API Google Gemini của bạn.
4. Framework Preset: **Vite**.
5. Nhấn **Deploy**. Vercel sẽ tự động build và cung cấp liên kết truy cập trực tuyến không bị lỗi 404 khi tải lại trang.

---

## IV. BẢO MẬT DỮ LIỆU HỌC SINH TIỂU HỌC

- Không công khai số điện thoại phụ huynh, địa chỉ nhà hay ngày sinh ra ngoài.
- Cột giới tính có mã quy ước `1` được lưu giữ nguyên trạng trong bảng dữ liệu giáo viên.
- Không gửi dữ liệu cá nhân của học sinh vào các prompt AI công khai.
