# Bàn giao — trạng thái & việc tiếp theo

Cập nhật: 2026-10-28

## Đang ở đâu

Bản demo chạy được, đã deploy và có link công khai.

| | |
|---|---|
| Live demo | https://healthmate-theta.vercel.app/demo |
| Landing | https://healthmate-theta.vercel.app |
| Repo | https://github.com/BTK301/healthmate |
| Vercel | https://vercel.com/btk301/healthmate |

## Đã xong

- Định vị **quản lý bệnh mạn tính**: liều thuốc là trung tâm, không phải calo
- **Lịch uống thuốc**: thêm thuốc + giờ, đánh dấu đã uống, tuân thủ 7 ngày, chuỗi ngày
- **Quét đơn thuốc** bằng ảnh, kèm thông tin nhóm thuốc cho thuốc nhận diện được
- Gộp cảnh báo vào tab **Điều trị** (Lịch uống · Tương tác) — 4 tab thay vì 5
- Engine thuần: BMR, TDEE, macro, BMI ngưỡng châu Á
- Nhật ký ăn + tiến độ cân nặng (biểu đồ SVG)
- Coach tất định + chặn câu hỏi liều thuốc / chẩn đoán / cấp cứu
- PWA cài được + offline; APK Android (TWA) đã build và xác thực domain

## Việc tiếp theo (theo thứ tự ưu tiên)

### 1. Chỉ số theo bệnh nền — ~2 ngày  ← làm tiếp

Huyết áp (tăng huyết áp), đường huyết (tiểu đường), acid uric (gout), eGFR (suy thận).
Mỗi bệnh có ngưỡng cảnh báo riêng và biểu đồ riêng.

### 2. Nhắc nhở thực sự (Web Push) — ~1 ngày

Hiện lịch uống chỉ hiện khi mở app. Cần thông báo đúng giờ kể cả khi không mở.

### 3. Báo cáo PDF cho bác sĩ — ~1 ngày

Một trang A4: tuân thủ 2 tuần, chỉ số, thuốc đang dùng.

### 4. Bật API key — ~15 phút

`LLM_API_KEY` trên Vercel bật cả coach LLM và quét đơn thật (Gemini free tier).

### 2. Video 90 giây — ~30 phút

### 2. Lịch sử cân nặng + biểu đồ — ~1,5h

- Lưu mảng `{ date, weightKg }`
- Vẽ bằng SVG thuần (không thêm recharts) để giữ bundle nhẹ

### 3. Nối LLM thật — ~1,5h (cần API key)

- Thay phần thân `askCoach` trong `src/core/coach/coach.ts`
- Giữ nguyên interface `CoachAnswer` và các chốt chặn an toàn
- Key đặt trong `.env.local`, gọi qua API route để không lộ key

### 4. Video 90 giây — ~30 phút

Kịch bản: dùng dữ liệu mẫu → Tổng quan → Thực đơn đổi món → Cảnh báo →
Lịch → Coach hỏi "Phở bò có được không?" → thử câu hỏi bị chặn.

## Lệnh cần dùng

```bash
cd C:\Users\Admin\Projects\healthmate
npm run dev                 # http://localhost:3000/demo

# deploy sau khi sửa
git add -A && git commit -m "..." && git push
vercel deploy --environment production --yes
```

## Lưu ý kỹ thuật

- **Không chạy `npm run build` khi `next dev` đang chạy** — chung thư mục `.next`.
  Nếu lỗi lạ: xoá `.next` rồi chạy lại.
- Git và gh đã cấu hình sẵn (`git` chưa có trong PATH mặc định — dùng đường dẫn
  `C:\Program Files\Git\cmd` hoặc mở PowerShell mới).
- Script kiểm tra nhanh: `node scripts/check.mjs` (local),
  `node scripts/check-live.mjs` (bản deploy).
- Ảnh trong README tạo lại bằng `node scripts/shot-readme.mjs`.

## Đã cố ý bỏ

Đăng nhập, quét ảnh món ăn, thực đơn 7 ngày, dark mode, tiếng Anh, RAG.

## Giới hạn cần nói khi phỏng vấn

- Bộ dữ liệu món còn nhỏ (22 món), ưu tiên món phổ biến
- Giá trị dinh dưỡng món tổ hợp là ước lượng (`source: "estimate"`)
- Chưa hỗ trợ thai phụ, trẻ dưới 18, bệnh thận nặng
- Cảnh báo thuốc mang tính tham khảo, có ghi mức bằng chứng
