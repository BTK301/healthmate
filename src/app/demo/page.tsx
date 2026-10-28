import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoLockup } from "@/components/brand/Logo";

export const metadata = { title: "Bản demo — HealthMate" };

export default function DemoPage() {
  return (
    <div className="min-h-dvh px-5 py-6">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex items-center justify-between">
          <LogoLockup />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-pill border border-navy/15 bg-white/70 px-4 py-2 text-[13px] font-semibold text-navy"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Trang chủ
          </Link>
        </div>

        <div className="mt-16 grid place-items-center">
          <div className="max-w-[440px] rounded-card border border-white/70 bg-surface p-8 text-center shadow-card">
            <h1 className="font-display text-2xl font-extrabold">
              Bản demo đang được dựng
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              Luồng nhập liệu, thực đơn và cảnh báo thuốc sẽ hoàn thiện trong
              các bước tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
