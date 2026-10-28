# Đóng gói Android (TWA)

App chạy dưới dạng **Trusted Web Activity** — một APK mở đúng web app đã deploy
trong khung toàn màn hình. Không cần Android SDK trên máy.

## 1. Tạo gói bằng PWABuilder — đã làm

Bản APK/AAB đã được tạo bằng PWABuilder với cấu hình:

| | |
|---|---|
| Package ID | `app.vercel.healthmate_theta.twa` (PWABuilder tự sinh từ URL) |
| App name | HealthMate |
| Ký bằng | `signing.keystore` (alias `my-key-alias`) |
| SHA-256 | `A6:9D:11:07:…:B3:2C` |

File gốc nằm ngoài repo tại `C:\Users\Admin\Projects\healthmate-android\`:
`HealthMate.apk`, `HealthMate.aab`, `assetlinks.json`, `signing.keystore`,
`signing-key-info.txt`.

> **Sao lưu `signing.keystore` + mật khẩu ngay.** Mất là không update được app
> nữa, phải gỡ rồi cài lại với package id khác.

## 2. Xác thực domain — đã làm

`assetlinks.json` đã được nạp vào biến môi trường `ANDROID_ASSETLINKS` trên
Vercel (Production) và redeploy. Kiểm tra:

```bash
curl -s https://healthmate-theta.vercel.app/.well-known/assetlinks.json
```

Phải trả về mảng JSON chứa `package_name` và fingerprint ở trên.

## 3. Cài lên điện thoại

1. Chuyển file `.apk` sang máy (Zalo, Drive, cáp USB)
2. Mở file → Android hỏi **"Cài đặt ứng dụng không rõ nguồn gốc"** → bật cho ứng
   dụng đang mở file
3. **Cài đặt** → **Mở**

## 4. Cập nhật về sau

Vì là TWA, nội dung luôn lấy từ web — sửa code, deploy là app tự cập nhật.
Chỉ cần build APK mới khi đổi icon, tên app hoặc package id.

## Ghi chú

- `next.config.ts` map `/.well-known/assetlinks.json` → `/api/assetlinks`.
- Route đọc `ANDROID_ASSETLINKS`; nếu chưa set sẽ trả `[]` (hợp lệ nhưng chưa xác thực).
- Debug nhanh trên điện thoại: `adb shell pm get-app-links com.btk301.healthmate`
