"use client";

import { CalendarClock, Clock, Pill } from "lucide-react";
import type { ScheduleItem } from "@/core/schedule/schedule";
import { KIND_LABEL } from "@/core/schedule/schedule";
import { Card } from "@/components/app/ui";
import { OCCUPATION_LABEL } from "@/core/nutrition/targets";
import type { ProfileInput } from "@/core/types";
import { cn } from "@/lib/cn";

const DOT: Record<string, string> = {
  wake: "bg-navy",
  med: "bg-peach",
  meal: "bg-good",
  move: "bg-navy/60",
  rest: "bg-warn",
  water: "bg-[#5aa9c9]",
  sleep: "bg-navy/40",
  work: "bg-muted/50",
};

export function ScheduleView({
  items,
  profile,
}: {
  items: ScheduleItem[];
  profile: ProfileInput;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
          Lịch sinh hoạt
        </p>
        <h1 className="mt-1 font-display text-[26px] font-extrabold">
          Một ngày của bạn
        </h1>
        <p className="mt-1.5 max-w-[62ch] text-[12.5px] leading-relaxed text-muted">
          Lịch được ghép từ giờ uống thuốc, bữa ăn trong thực đơn và khuyến nghị
          vận động. Chế độ:{" "}
          <b className="font-semibold text-navy">
            {OCCUPATION_LABEL[profile.occupation]}
          </b>
          .
        </p>
      </div>

      <Card className="p-5 sm:p-6">
        <ol className="relative space-y-0">
          {items.map((item, i) => (
            <li key={`${item.time}-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
              {/* rail */}
              {i < items.length - 1 ? (
                <span className="absolute top-3 left-[63px] h-full w-px bg-navy/10" />
              ) : null}

              <div className="w-[42px] shrink-0 pt-0.5 text-right">
                <span className="tabular text-[12px] font-bold text-navy">
                  {item.time}
                </span>
              </div>

              <span
                className={cn(
                  "relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-surface",
                  DOT[item.kind] ?? "bg-navy/30",
                )}
              />

              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13.5px] font-semibold text-navy">
                    {item.title}
                  </p>
                  {KIND_LABEL[item.kind] !== item.title ? (
                    <span className="rounded-md bg-canvas px-1.5 py-0.5 text-[9.5px] font-semibold text-muted">
                      {KIND_LABEL[item.kind]}
                    </span>
                  ) : null}
                </div>
                {item.detail ? (
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {item.detail}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: Pill,
            title: "Giờ uống thuốc",
            body: "Lấy từ thuốc bạn đã nhập và khuyến nghị uống lúc đói hay sau ăn.",
          },
          {
            icon: Clock,
            title: "Bữa ăn",
            body: "Khớp với thực đơn đang gợi ý, không phải giờ cố định cho mọi người.",
          },
          {
            icon: CalendarClock,
            title: "Vận động",
            body: "Điều chỉnh theo nghề nghiệp và loại thuốc đang dùng.",
          },
        ].map((c) => (
          <div key={c.title} className="rounded-card bg-white/55 p-4">
            <c.icon className="h-4 w-4 text-navy/60" />
            <p className="mt-2 text-[12.5px] font-semibold">{c.title}</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
