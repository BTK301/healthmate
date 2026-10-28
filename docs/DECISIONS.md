# Quyết định kiến trúc

Ghi lại các lựa chọn lớn để sau này không phải suy đoán lại.

## 1. Tri thức là dữ liệu, không phải code

`src/data/*.ts` chứa toàn bộ thực phẩm, món, thuốc, bệnh nền và quy tắc tương tác.
Thêm 300 món hay 50 thuốc chỉ là thêm dòng — planner, engine và UI không đổi.

## 2. `src/core/` là hàm thuần

Không import React, Next hay DB. Nhờ vậy engine test được độc lập và có thể tái sử
dụng nếu sau này chuyển sang mobile.

## 3. Một interface truy cập dữ liệu

Hiện dùng localStorage (`src/lib/profile-store.tsx`). Khi cần backend thật, viết
thêm một implementation của cùng interface — UI không phải sửa.

## 4. LLM không tính toán

Engine tất định sinh số liệu và ràng buộc. LLM (khi bật) chỉ diễn giải lại. Coach
hiện tại là bản tất định trong `src/core/coach/coach.ts`, đóng vai trò fallback
khi không có API key.

## 5. Design tokens tập trung

Mọi màu, bo góc, bóng nằm trong `@theme` của `src/app/globals.css`. Đổi nhận diện
thương hiệu = sửa một file.

## 6. Đơn vị dữ liệu

- Năng lượng: kcal. Macro: gam. Natri: mg.
- Khẩu phần luôn tính theo gram; macro của món suy ra từ nguyên liệu.
- Mỗi dòng thực phẩm có `source: "nin" | "estimate"` để phân biệt số liệu chuẩn
  và ước lượng.
