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

- Landing (Server Component) + design tokens + orb three.js
- Engine thuần: BMR, TDEE, macro, BMI ngưỡng châu Á
- Dữ liệu: 61 thực phẩm, 22 món, 25 thuốc, 8 bệnh nền, 17 quy tắc tương tác
- Workspace 5 tab: Tổng quan · Thực đơn · Lịch · Cảnh báo · Hồ sơ
- **Nhật ký ăn**: ghi món (từ thực đơn hoặc tìm tự do), trừ calo/đạm/natri realtime
- Coach tất định + chặn câu hỏi liều thuốc / chẩn đoán / cấp cứu
- Lưu dữ liệu bằng localStorage
- Lighthouse: `/` 94 · `/demo` 95, a11y 100

## Việc tiếp theo (theo thứ tự ưu tiên)

### 1. Lịch sử cân nặng + biểu đồ — ~1,5h  ← làm tiếp

Hiện chỉ có cân nặng hiện tại trong hồ sơ, không có lịch sử nên không thấy
tiến độ theo thời gian.

Hướng làm:
- Thêm `src/core/metrics/` với mảng `{ date, weightKg, waistCm? }`
- Store riêng (giống `src/lib/diary-store.tsx`)
- Vẽ bằng SVG thuần (không thêm recharts) để giữ bundle nhẹ
- Đặt chart ở tab Tổng quan hoặc thêm tab "Tiến độ"

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
