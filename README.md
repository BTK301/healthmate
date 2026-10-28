# HealthMate

Trợ lý sức khỏe cá nhân cho người Việt: tính nhu cầu dinh dưỡng, gợi ý thực đơn
hằng ngày, lịch sinh hoạt theo nghề nghiệp và cảnh báo ràng buộc ăn uống dựa trên
thuốc đang dùng.

> Dự án portfolio. Đây là công cụ tham khảo giáo dục, không phải dịch vụ khám
> chữa bệnh và không thay thế tư vấn của bác sĩ hoặc dược sĩ.

## Vì sao kiến trúc này

Điểm quan trọng nhất: **mô hình ngôn ngữ không làm phép tính dinh dưỡng.**

```
Người dùng
    ↓
Engine tất định          BMR · TDEE · macro · ràng buộc thuốc–thực phẩm · lọc dị ứng
    ↓ dữ liệu có cấu trúc
LLM / coach              chỉ diễn giải kết quả thành lời khuyên dễ hiểu
    ↓
Validator                chặn đầu ra y tế không an toàn / số liệu không nguồn
    ↓
Giao diện
```

LLM sai số học 15–30% — không dùng được cho dữ liệu sức khỏe. Kiến trúc hybrid
giữ độ chính xác của engine và sự tự nhiên của ngôn ngữ.

## Tính năng

- **Tính nhu cầu** — Mifflin–St Jeor, hệ số vận động + nghề nghiệp, ngưỡng BMI
  châu Á, sàn calo an toàn, phân bổ đạm/béo/tinh bột.
- **Thực đơn Việt** — 22 món, macro tính từ nguyên liệu (không nhập tay), tối ưu
  đồng thời calo và đạm, đổi món vẫn giữ mục tiêu.
- **Thuốc & bệnh nền** — 25 hoạt chất, 8 bệnh nền, 17 quy tắc tương tác có mức
  bằng chứng và trích dẫn. Engine tự siết natri, chặn rượu bia, đổi gợi ý vận động.
- **Lịch sinh hoạt** — timeline hợp nhất giờ uống thuốc, bữa ăn và vận động theo
  nghề (văn phòng / ca đêm / lao động chân tay).
- **Coach** — trả lời dựa trên engine, có chặn câu hỏi về liều thuốc, chẩn đoán và
  dấu hiệu cấp cứu.

## Stack

- **Next.js 15** (App Router) + TypeScript strict
- **Tailwind CSS v4** với design tokens tập trung
- **Three.js / React Three Fiber** — một hiệu ứng duy nhất ở màn hình chính
- **Motion** cho micro-interaction
- Dữ liệu demo lưu client-side để bản công khai không phụ thuộc backend

## Chạy local

```bash
npm install
npm run dev      # http://localhost:3000  →  /demo
npm run build
```

## Cấu trúc

```
src/
├─ app/                 # routes
├─ components/
│  ├─ app/              # workspace, views, coach panel
│  ├─ brand/            # logo, wordmark
│  ├─ three/            # hiệu ứng WebGL
│  └─ ui/
├─ core/                # logic thuần — không phụ thuộc React hay DB
│  ├─ nutrition/        # BMR, TDEE, macro, BMI
│  ├─ planner/          # sinh và tối ưu thực đơn
│  ├─ rules/            # ràng buộc từ thuốc và bệnh nền
│  ├─ schedule/         # lịch sinh hoạt theo nghề
│  └─ coach/            # coach tất định + lớp thay thế LLM
├─ data/                # tri thức dạng dữ liệu (thêm món/thuốc = thêm dòng)
└─ lib/
```

## Giới hạn đã biết

- Bộ dữ liệu món ăn ở giai đoạn đầu còn nhỏ, ưu tiên món phổ biến.
- Giá trị dinh dưỡng của món tổ hợp là ước lượng, có trường `source` để phân biệt.
- Chưa hỗ trợ thai phụ, trẻ dưới 18 tuổi và bệnh thận nặng.
- Cảnh báo tương tác thuốc mang tính tham khảo, hiển thị kèm mức bằng chứng.
