import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-white/70 bg-surface shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-[10.5px] font-bold tracking-[0.16em] text-muted uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 font-display text-[17px] font-bold">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Bar({
  value,
  max,
  tone = "bg-good",
  className,
}: {
  value: number;
  max: number;
  tone?: string;
  className?: string;
}) {
  const p = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-navy/8", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", tone)}
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

const SEVERITY_STYLE = {
  warning: {
    chip: "bg-danger/12 text-danger",
    dot: "bg-danger",
    label: "Cần chú ý",
  },
  caution: {
    chip: "bg-warn/15 text-[#8a5a10]",
    dot: "bg-warn",
    label: "Lưu ý",
  },
  info: {
    chip: "bg-navy-soft text-navy",
    dot: "bg-navy/40",
    label: "Tham khảo",
  },
} as const;

export function SeverityPill({
  severity,
}: {
  severity: keyof typeof SEVERITY_STYLE;
}) {
  const s = SEVERITY_STYLE[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[10.5px] font-bold",
        s.chip,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function EvidenceTag({ level }: { level: "A" | "B" | "C" | "D" }) {
  const text =
    level === "A"
      ? "Bằng chứng mạnh"
      : level === "B"
        ? "Bằng chứng khá"
        : level === "C"
          ? "Bằng chứng hạn chế"
          : "Kinh nghiệm dân gian";
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
      <span className="tabular font-bold text-navy">{level}</span>
      {text}
    </span>
  );
}
