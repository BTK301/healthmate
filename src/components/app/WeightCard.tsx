"use client";

import { useMemo, useState } from "react";
import { Plus, TrendingDown, TrendingUp, Minus } from "lucide-react";
import {
  stats as weightStats,
  windowOf,
  type WeightEntry,
} from "@/core/metrics/weight";
import { Card, SectionTitle } from "@/components/app/ui";
import { BMI_LABEL, bmiCategory } from "@/core/nutrition/targets";
import { cn } from "@/lib/cn";

const W = 640;
const H = 150;
const PAD = { top: 14, right: 12, bottom: 22, left: 34 };

function Chart({ points }: { points: WeightEntry[] }) {
  if (points.length < 2) {
    return (
      <div className="grid h-[150px] place-items-center rounded-xl bg-canvas/50">
        <p className="text-[11.5px] text-muted">
          Cần ít nhất 2 lần ghi để vẽ biểu đồ.
        </p>
      </div>
    );
  }

  const values = points.map((p) => p.weightKg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = Math.max(0.4, span * 0.15);
  const lo = min - pad;
  const hi = max + pad;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const x = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;
  const y = (v: number) => PAD.top + ((hi - v) / (hi - lo)) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.weightKg).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${H - PAD.bottom} L${x(0).toFixed(1)},${H - PAD.bottom} Z`;

  const labels = [hi - pad / 2, (hi + lo) / 2, lo + pad / 2].map((v) => Math.round(v * 10) / 10);
  const firstDate = points[0]!.date.slice(5).replace("-", "/");
  const lastDate = points[points.length - 1]!.date.slice(5).replace("-", "/");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[150px] w-full"
      role="img"
      aria-label={`Biểu đồ cân nặng từ ${firstDate} đến ${lastDate}`}
    >
      <defs>
        <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b7a46" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1b7a46" stopOpacity="0" />
        </linearGradient>
      </defs>

      {labels.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(v)}
            y2={y(v)}
            stroke="#1f3a68"
            strokeOpacity="0.07"
            strokeDasharray="3 4"
          />
          <text
            x={PAD.left - 7}
            y={y(v) + 3.5}
            textAnchor="end"
            className="fill-[#4e6072]"
            style={{ fontSize: 9, fontVariantNumeric: "tabular-nums" }}
          >
            {v}
          </text>
        </g>
      ))}

      <path d={area} fill="url(#weightFill)" />
      <path
        d={line}
        fill="none"
        stroke="#1b7a46"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <circle
          key={p.date}
          cx={x(i)}
          cy={y(p.weightKg)}
          r={i === points.length - 1 ? 3.4 : 2.2}
          fill="#fff"
          stroke="#1b7a46"
          strokeWidth={i === points.length - 1 ? 2.4 : 1.8}
        />
      ))}

      <text x={PAD.left} y={H - 6} style={{ fontSize: 9 }} className="fill-[#4e6072]">
        {firstDate}
      </text>
      <text
        x={W - PAD.right}
        y={H - 6}
        textAnchor="end"
        style={{ fontSize: 9 }}
        className="fill-[#4e6072]"
      >
        {lastDate}
      </text>
    </svg>
  );
}

export function WeightCard({
  entries,
  heightCm,
  onAdd,
  onClearSamples,
  days = 30,
}: {
  entries: WeightEntry[];
  heightCm: number;
  onAdd: (weightKg: number) => void;
  onClearSamples: () => void;
  days?: number;
}) {
  const [input, setInput] = useState("");

  const points = useMemo(() => windowOf(entries, days), [entries, days]);
  const s = useMemo(() => weightStats(entries, heightCm), [entries, heightCm]);

  const submit = () => {
    const v = Number(input.replace(",", "."));
    if (!Number.isFinite(v) || v <= 20 || v >= 300) return;
    onAdd(Math.round(v * 10) / 10);
    setInput("");
  };

  const trendIcon = s.delta === null || Math.abs(s.delta) < 0.05
    ? Minus
    : s.delta < 0
      ? TrendingDown
      : TrendingUp;

  return (
    <Card className="p-5">
      <SectionTitle title={`Cân nặng · ${days} ngày`} />

      <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
        <div>
          <p className="text-[10.5px] font-medium text-muted">Hiện tại</p>
          <p className="tabular font-display text-[26px] leading-none font-extrabold">
            {s.current ?? "—"}
            <span className="ml-0.5 text-[11px] font-medium text-muted">kg</span>
          </p>
        </div>

        {s.delta !== null ? (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-pill px-2 py-1 text-[11px] font-bold",
              s.delta < 0
                ? "bg-good-soft text-good"
                : s.delta > 0
                  ? "bg-peach-soft text-peach-ink"
                  : "bg-canvas text-muted",
            )}
          >
            {(() => {
              const Icon = trendIcon;
              return <Icon className="h-3 w-3" />;
            })()}
            {s.delta > 0 ? "+" : ""}
            {s.delta.toFixed(1)} kg
            {s.ratePerWeek !== null ? (
              <span className="font-medium opacity-70">
                · {s.ratePerWeek > 0 ? "+" : ""}
                {s.ratePerWeek.toFixed(2)} kg/tuần
              </span>
            ) : null}
          </div>
        ) : null}

        {s.bmi !== null ? (
          <p className="text-[11px] font-medium text-muted">
            BMI {s.bmi} · {BMI_LABEL[bmiCategory(s.bmi)]}
          </p>
        ) : null}

        <div className="ml-auto flex items-center gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            inputMode="decimal"
            placeholder="74,2"
            aria-label="Cân nặng hôm nay (kg)"
            className="h-9 w-[86px] rounded-pill border border-line bg-white px-3 text-[12px] font-medium tabular-nums outline-none focus:border-navy/40"
          />
          <button
            type="button"
            onClick={submit}
            className="inline-flex h-9 items-center gap-1 rounded-pill bg-navy px-3 text-[11.5px] font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Ghi
          </button>
        </div>
      </div>

      <div className="mt-3">
        <Chart points={points} />
      </div>

      {s.includesSample ? (
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-muted/80">
          Biểu đồ có dữ liệu mẫu để minh hoạ. Ghi cân nặng của bạn để thay thế.
          <button
            type="button"
            onClick={onClearSamples}
            className="font-semibold text-muted underline decoration-dotted underline-offset-2 hover:text-navy"
          >
            Xoá dữ liệu mẫu
          </button>
        </p>
      ) : null}
    </Card>
  );
}
