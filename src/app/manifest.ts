import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HealthMate — Quản lý bệnh mạn tính",
    short_name: "HealthMate",
    description:
      "Nhắc lịch uống thuốc, quét đơn thuốc bằng ảnh, theo dõi cân nặng và gợi ý bữa ăn theo bệnh nền.",
    start_url: "/demo",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e8f5ec",
    theme_color: "#e8f5ec",
    lang: "vi",
    categories: ["health", "food", "lifestyle"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
