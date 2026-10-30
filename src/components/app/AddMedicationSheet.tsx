"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Plus, Search, Trash2, X } from "lucide-react";
import type { MouseEvent } from "react";
import type { MedicationPlan } from "@/core/meds/types";
import { FOOD_LABEL, TIME_PRESETS, dateKey } from "@/core/meds/types";
import { sortTimes } from "@/core/meds/schedule";
import { drugs } from "@/data/drugs";
import { normalize } from "@/data/foods";
import { Card } from "@/components/app/ui";
import { cn } from "@/lib/cn";

export function AddMedicationSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (plan: Omit<MedicationPlan, "id" | "createdAt">) => void;
}) {
  const [query, setQuery] = useState("");
  const [drugId, setDrugId] = useState<string | null>(null);
  const [dose, setDose] = useState("1 viên");
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [timing, setTiming] = useState<MedicationPlan["foodTiming"]>("after");
  const [longTerm, setLongTerm] = useState(true);
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");

  const q = normalize(query.trim());
  const results = useMemo(
    () =>
      drugs.filter(
        (d) =>
          !q ||
          normalize(d.name).includes(q) ||
          d.brands.some((b) => normalize(b).includes(q)),
      ),
    [q],
  );

  const selected = drugs.find((d) => d.id === drugId);

  const reset = () => {
    setQuery("");
    setDrugId(null);
    setDose("1 viên");
    setTimes(["08:00"]);
    setTiming("after");
    setLongTerm(true);
    setEndDate("");
    setNote("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    if (!drugId || times.length === 0) return;
    onSave({
      drugId,
      doseText: dose.trim() || "1 viên",
      times: sortTimes(times),
      startDate: dateKey(),
      endDate: longTerm ? null : endDate || null,
      foodTiming: timing,
      note: note.trim() || undefined,
    });
    close();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-navy/25 backdrop-blur-[2px]"
      onClick={close}
      role="presentation"
    >
      <div
        onClick={(e: MouseEvent) => e.stopPropagation()}
        role="dialog"
        aria-label="Thêm thuốc và giờ uống"
        className="absolute inset-x-3 bottom-3 flex max-h-[86dvh] flex-col overflow-hidden rounded-[26px] border border-white/70 bg-surface shadow-float sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[600px] sm:w-[430px]"
      >
        <header className="flex items-center gap-2.5 border-b border-line/70 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold">Thêm thuốc</p>
            <p className="text-[10.5px] text-muted">
              Chọn thuốc và giờ uống — app sẽ nhắc mỗi ngày
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-canvas"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {!selected ? (
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm tên thuốc hoặc biệt dược…"
                  className="h-10 w-full rounded-xl border border-line bg-white pr-3 pl-9 text-[12.5px] outline-none focus:border-navy/40"
                />
              </div>
              <ul className="mt-2 space-y-1">
                {results.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setDrugId(d.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-canvas/80"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-semibold text-navy">
                          {d.name}
                        </span>
                        <span className="block text-[10.5px] text-muted">
                          {d.brands.join(" · ")}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10.5px] text-muted">
                        {d.hint}
                      </span>
                    </button>
                  </li>
                ))}
                {results.length === 0 ? (
                  <li className="py-6 text-center text-[12px] text-muted">
                    Không tìm thấy thuốc trong danh mục.
                  </li>
                ) : null}
              </ul>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-canvas/70 px-3 py-2.5">
                <div>
                  <p className="text-[13px] font-bold text-navy">{selected.name}</p>
                  <p className="text-[10.5px] text-muted">{selected.hint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrugId(null)}
                  className="text-[10.5px] font-semibold text-muted underline underline-offset-2"
                >
                  Đổi
                </button>
              </div>

              <label className="block">
                <span className="text-[11.5px] font-semibold text-muted">
                  Liều mỗi lần
                </span>
                <input
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  placeholder="1 viên"
                  className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-[13px] outline-none focus:border-navy/40"
                />
              </label>

              <div>
                <span className="text-[11.5px] font-semibold text-muted">
                  Số lần uống
                </span>
                <div className="mt-1.5 flex gap-1.5">
                  {TIME_PRESETS.map((p) => {
                    const active =
                      p.times.length === times.length &&
                      p.times.every((t) => times.includes(t));
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setTimes(p.times)}
                        className={cn(
                          "flex-1 rounded-pill border px-2 py-2 text-[11px] font-semibold transition-colors",
                          active
                            ? "border-navy bg-navy text-white"
                            : "border-line bg-white text-navy hover:bg-canvas",
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {times.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-pill bg-navy-soft px-2.5 py-1 text-[11px] font-bold text-navy"
                    >
                      {t}
                      <button
                        type="button"
                        aria-label={`Xoá ${t}`}
                        onClick={() =>
                          setTimes((prev) =>
                            prev.length > 1 ? prev.filter((x) => x !== t) : prev,
                          )
                        }
                        className="text-navy/50 hover:text-navy"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="time"
                    aria-label="Thêm giờ uống"
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) setTimes((prev) => sortTimes([...prev, v]));
                      e.currentTarget.value = "";
                    }}
                    className="h-7 rounded-lg border border-dashed border-navy/25 bg-transparent px-2 text-[11px] text-muted"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11.5px] font-semibold text-muted">
                  Cách dùng với bữa ăn
                </span>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {(["before", "after", "any"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setTiming(f)}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-[10.5px] font-semibold transition-colors",
                        timing === f
                          ? "border-navy bg-navy text-white"
                          : "border-line bg-white text-navy hover:bg-canvas",
                      )}
                    >
                      {FOOD_LABEL[f]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11.5px] font-semibold text-muted">
                  Thời gian dùng
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLongTerm(true)}
                    className={cn(
                      "rounded-pill border px-3 py-1.5 text-[11px] font-semibold",
                      longTerm
                        ? "border-good bg-good-soft text-good"
                        : "border-line bg-white text-navy",
                    )}
                  >
                    Dài hạn
                  </button>
                  <button
                    type="button"
                    onClick={() => setLongTerm(false)}
                    className={cn(
                      "rounded-pill border px-3 py-1.5 text-[11px] font-semibold",
                      !longTerm
                        ? "border-good bg-good-soft text-good"
                        : "border-line bg-white text-navy",
                    )}
                  >
                    Có ngày kết thúc
                  </button>
                  {!longTerm ? (
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-8 flex-1 rounded-lg border border-line bg-white px-2 text-[11px]"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line/70 px-4 py-3">
          <button
            type="button"
            onClick={submit}
            disabled={!drugId}
            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-pill bg-navy text-[13px] font-semibold text-white disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Lưu lịch uống
          </button>
        </div>
      </div>
    </div>
  );
}

export function MedsEmptyHint() {
  return (
    <div className="rounded-2xl bg-canvas/60 px-4 py-6 text-center">
      <Clock className="mx-auto h-4 w-4 text-navy/40" />
      <p className="mt-2 text-[12px] font-medium text-muted">
        Chưa có thuốc nào trong lịch.
      </p>
    </div>
  );
}

export function TrashButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

export function TakenBadge({ taken }: { taken: boolean }) {
  return (
    <span
      className={cn(
        "grid h-6 w-6 place-items-center rounded-full border",
        taken ? "border-good bg-good text-white" : "border-line bg-white text-transparent",
      )}
    >
      <Check className="h-3.5 w-3.5" />
    </span>
  );
}

export function MedsHeaderCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-[10.5px] font-medium text-muted">{label}</p>
      <p className="tabular mt-1 font-display text-[18px] font-extrabold">{value}</p>
    </Card>
  );
}
