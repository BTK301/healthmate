import type { Metadata, Viewport } from "next";
import { Manrope, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HealthMate — Trợ lý sức khỏe cá nhân",
  description:
    "Tính nhu cầu dinh dưỡng, gợi ý thực đơn Việt và cảnh báo tương tác thuốc — dựa trên chính cơ thể và công việc của bạn.",
  applicationName: "HealthMate",
};

export const viewport: Viewport = {
  themeColor: "#e8f5ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${manrope.variable} ${beVietnam.variable}`}>
      <body className="min-h-dvh bg-canvas font-sans text-navy antialiased">
        {children}
      </body>
    </html>
  );
}
