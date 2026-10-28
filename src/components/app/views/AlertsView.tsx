"use client";

import { BookOpen, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import type { ActiveRule, Constraints } from "@/core/rules/types";
import { Card, EvidenceTag, SeverityPill } from "@/components/app/ui";
import { tagLabel } from "@/core/rules/labels";
import { nf } from "@/lib/format";

export function AlertsView({
  active,
  constraints,
}: {
  active: ActiveRule[];
  constraints: Constraints;
}) {
  const excluded = [...constraints.excludeTags];

  const chips = [
    { label: `Natri ≤ ${nf.format(constraints.sodiumMgMax)} mg`, tone: "bg-lime" },
    ...excluded.map((t) => ({
      label: `Tránh: ${tagLabel(t)}`,
      tone: "bg-peach-soft",
    })),
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
          Cảnh báo sức khỏe
        </p>
        <h1 className="mt-1 font-display text-[26px] font-extrabold">
          {active.length > 0
            ? `${active.length} ràng buộc đang áp dụng`
            : "Chưa có ràng buộc nào"}
        </h1>
        <p className="mt-1.5 max-w-[62ch] text-[12.5px] leading-relaxed text-muted">
          Mỗi cảnh báo được sinh từ một quy tắc có mã, kèm mức độ bằng chứng và
          nguồn tham khảo. Mô hình ngôn ngữ không tự tạo ra các cảnh báo này.
        </p>
      </div>

      {active.length > 0 ? (
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c.label}
                className={`rounded-pill ${c.tone} px-3 py-1.5 text-[11px] font-bold text-navy`}
              >
                {c.label}
              </span>
            ))}
          </div>
        </Card>
      ) : null}

      {active.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-7 w-7 text-good" />
          <p className="mt-3 font-display text-[16px] font-bold">
            Hồ sơ của bạn chưa có yếu tố cần lưu ý
          </p>
          <p className="mx-auto mt-1.5 max-w-[42ch] text-[12.5px] leading-relaxed text-muted">
            Thêm thuốc đang dùng hoặc bệnh nền ở tab Hồ sơ để HealthMate tính
            ràng buộc ăn uống phù hợp.
          </p>
        </Card>
      ) : null}

      <div className="space-y-3">
        {active.map(({ rule, source }) => (
          <Card key={rule.id} className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityPill severity={rule.severity} />
              <span className="text-[11px] font-semibold text-muted">
                Từ: {source}
              </span>
              <span className="ml-auto">
                <EvidenceTag level={rule.evidence} />
              </span>
            </div>

            <h3 className="mt-2.5 font-display text-[16px] leading-snug font-bold">
              {rule.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              {rule.effect.advice}
            </p>

            {rule.effect.lifestyle.length > 0 ? (
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {rule.effect.lifestyle.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-1.5 text-[12px] leading-snug text-navy"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-good" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-3 flex items-center gap-1.5 border-t border-line/70 pt-2.5 text-[10.5px] text-muted">
              <BookOpen className="h-3 w-3 shrink-0" />
              {rule.effect.citation}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-card bg-white/50 p-4">
        {active.some((a) => a.rule.severity === "warning") ? (
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        ) : (
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy/50" />
        )}
        <p className="text-[11.5px] leading-relaxed text-muted">
          Đây là thông tin tham khảo, không phải chỉ định y tế. Không tự ngừng
          hoặc đổi liều thuốc. Khi có dấu hiệu bất thường — đau ngực, khó thở,
          ngất — hãy gọi 115 hoặc đến cơ sở y tế gần nhất.
        </p>
      </div>
    </div>
  );
}
