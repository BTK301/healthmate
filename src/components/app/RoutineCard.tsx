"use client";

import { CalendarClock } from "lucide-react";
import type { ScheduleItem } from "@/core/schedule/schedule";
import { KIND_LABEL } from "@/core/schedule/schedule";
import { Card, SectionTitle } from "@/components/app/ui";

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

export function RoutineCard({ items }: { items: ScheduleItem[] }) {
  const upcoming = items.slice(0, 4);

  return (
    <Card className="p-5">
      <SectionTitle
        title="Lịch sinh hoạt hôm nay"
        action={<CalendarClock className="h-4 w-4 text-muted" />}
      />

      <ul className="space-y-0">
        {upcoming.map((item, i) => (
          <li key={`${item.time}-${i}`} className="relative flex gap-3 pb-3 last:pb-0">
            <span className="tabular w-9 shrink-0 pt-0.5 text-right text-[11.5px] font-bold text-navy">
              {item.time}
            </span>
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[item.kind] ?? "bg-navy/30"}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-navy">{item.title}</p>
              {item.detail ? (
                <p className="mt-0.5 truncate text-[11px] text-muted">{item.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {items.length > upcoming.length ? (
        <details className="mt-2 border-t border-line/70 pt-2">
          <summary className="cursor-pointer text-[11.5px] font-semibold text-navy">
            Xem cả ngày ({items.length} mục)
          </summary>
          <ul className="mt-2 space-y-0">
            {items.map((item, i) => (
              <li key={`all-${item.time}-${i}`} className="flex gap-3 pb-2.5 last:pb-0">
                <span className="tabular w-9 shrink-0 text-right text-[11px] font-bold text-navy">
                  {item.time}
                </span>
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[item.kind] ?? "bg-navy/30"}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-semibold text-navy">
                    {item.title}
                    <span className="ml-1.5 rounded bg-canvas px-1 py-0.5 text-[9px] font-medium text-muted">
                      {KIND_LABEL[item.kind]}
                    </span>
                  </p>
                  {item.detail ? (
                    <p className="mt-0.5 text-[10.5px] leading-snug text-muted">
                      {item.detail}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </Card>
  );
}
