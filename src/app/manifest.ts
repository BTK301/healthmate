import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HealthMate — Trợ lý sức khỏe cá nhân",
    short_name: "HealthMate",
    description:
      "Tính nhu cầu dinh dưỡng, gợi ý thực đơn Việt, theo dõi cân nặng và cảnh báo tương tác thuốc.",
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
