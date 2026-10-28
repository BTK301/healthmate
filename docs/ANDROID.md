# Đóng gói Android (TWA)

App chạy dưới dạng **Trusted Web Activity** — một APK mở đúng web app đã deploy
trong khung toàn màn hình. Không cần Android SDK trên máy.

## 1. Tạo gói bằng PWABuilder

1. Mở <https://www.pwabuilder.com>
2. Dán `https://healthmate-theta.vercel.app` → **Start**
3. **Package for stores** → **Android**
4. Cấu hình:
   - Package ID: `com.btk301.healthmate`
   - App name: `HealthMate`
   - Signing key: **Create new** (tải về và giữ file `.keystore` + mật khẩu)
5. **Download** → nhận file zip gồm:
   - `*.apk` — cài trực tiếp
   - `*.aab` — nếu đưa lên Google Play
   - `assetlinks.json` — dùng cho bước 2
   - `signing.keystore`, `signing-key-info.txt` — **giữ kỹ, mất là không update được**

## 2. Xác thực domain (để mất thanh địa chỉ)

Android chỉ ẩn thanh địa chỉ khi domain chứng minh được quyền với package.

Lấy `assetlinks.json` trong zip và đặt nội dung của nó vào biến môi trường
`ANDROID_ASSETLINKS` trên Vercel (Settings → Environment Variables), rồi redeploy.

Kiểm tra:

```bash
curl -s https://healthmate-theta.vercel.app/.well-known/assetlinks.json
```

Phải trả về đúng mảng JSON, không phải `[]`.

> Không có bước này app vẫn chạy, chỉ là hiện thanh địa chỉ Chrome ở trên.

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
