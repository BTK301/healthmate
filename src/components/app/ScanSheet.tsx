"use client";

import { useRef, useState } from "react";
import { Camera, Check, Loader2, ScanLine, X } from "lucide-react";
import type { MedicationPlan } from "@/core/meds/types";
import { drugs } from "@/data/drugs";
import { normalize } from "@/data/foods";
import { TIME_PRESETS } from "@/core/meds/types";
import { cn } from "@/lib/cn";

interface Detected {
  name: string;
  dose: string;
  timesPerDay: number;
  drugId?: string;
  selected: boolean;
}

function matchDrug(name: string) {
  const q = normalize(name);
  return drugs.find(
    (d) =>
      normalize(d.name) === q ||
      normalize(d.name).includes(q) ||
      q.includes(normalize(d.name)) ||
      d.brands.some((b) => normalize(b) === q || normalize(b).includes(q) || q.includes(normalize(b))),
  );
}

export function ScanSheet({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (plans: Omit<MedicationPlan, "id" | "createdAt">[]) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [items, setItems] = useState<Detected[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPreview(null);
    setItems([]);
    setMessage(null);
    setLoading(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage("Chọn file ảnh (JPG/PNG).");
      return;
    }
    setMessage(null);
    setItems([]);

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });

    setPreview(dataUrl);
    setLoading(true);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = (await res.json()) as {
        source?: string;
        items?: { name: string; dose: string; timesPerDay: number }[];
      };

      if (data.source === "no-key") {
        setMessage(
          "Chưa cấu hình API key nên không đọc được ảnh. Bạn vẫn thêm thuốc bằng tay ở nút “Thêm thuốc”.",
        );
        return;
      }
      if (data.source === "error") {
        setMessage("Không đọc được ảnh. Thử chụp lại rõ hơn hoặc nhập tay.");
        return;
      }

      const detected: Detected[] = (data.items ?? []).map((it) => {
        const drug = matchDrug(it.name);
        return {
          name: it.name,
          dose: it.dose || "1 viên",
          timesPerDay: it.timesPerDay || 1,
          drugId: drug?.id,
          selected: Boolean(drug),
        };
      });

      setItems(detected);
      if (detected.length === 0) {
        setMessage("Không thấy tên thuốc nào trong ảnh.");
      } else if (detected.every((d) => !d.drugId)) {
        setMessage(
          "Đọc được tên thuốc nhưng chưa có trong danh mục 25 hoạt chất của app.",
        );
      }
    } catch {
      setMessage("Lỗi kết nối. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const selected = items.filter((i) => i.selected && i.drugId);

  const submit = () => {
    const plans = selected.map((item) => {
      const preset =
        TIME_PRESETS[Math.min(item.timesPerDay, 3) - 1] ?? TIME_PRESETS[0]!;
      return {
        drugId: item.drugId as string,
        doseText: item.dose,
        times: preset.times,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: null,
        foodTiming: "after" as const,
        note: "Thêm từ ảnh đơn thuốc",
      };
    });
    onImport(plans);
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
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Quét đơn thuốc"
        className="absolute inset-x-3 bottom-3 flex max-h-[86dvh] flex-col overflow-hidden rounded-[26px] border border-white/70 bg-surface shadow-float sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[430px]"
      >
        <header className="flex items-center gap-2.5 border-b border-line/70 px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-good-soft text-good">
            <ScanLine className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold">Quét đơn thuốc</p>
            <p className="text-[10.5px] text-muted">
              Chụp ảnh đơn — app đọc tên thuốc để bạn xác nhận
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
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.currentTarget.value = "";
            }}
          />

          {!preview ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-navy/25 bg-canvas/50 px-4 py-10 transition-colors hover:bg-canvas"
            >
              <Camera className="h-6 w-6 text-navy/50" />
              <span className="text-[12.5px] font-semibold text-navy">
                Chụp hoặc chọn ảnh đơn thuốc
              </span>
              <span className="text-[10.5px] text-muted">
                Để phẳng, đủ sáng, chụp rõ phần tên thuốc
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Ảnh đơn thuốc"
                  className="h-24 w-24 rounded-xl object-cover ring-1 ring-line"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-navy">
                    {loading ? "Đang đọc ảnh…" : "Ảnh đã chọn"}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mt-1 text-[10.5px] font-semibold text-muted underline underline-offset-2"
                  >
                    Chọn ảnh khác
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 rounded-xl bg-canvas/70 px-3 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-navy/50" />
                  <span className="text-[11.5px] text-muted">
                    Đang đọc tên thuốc trong ảnh…
                  </span>
                </div>
              ) : null}

              {items.length > 0 ? (
                <ul className="space-y-1.5">
                  {items.map((it, idx) => (
                    <li key={`${it.name}-${idx}`}>
                      <button
                        type="button"
                        disabled={!it.drugId}
                        onClick={() =>
                          setItems((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, selected: !x.selected } : x,
                            ),
                          )
                        }
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                          it.selected
                            ? "border-good/30 bg-good-soft/50"
                            : "border-line bg-white",
                          !it.drugId && "opacity-60",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                            it.selected
                              ? "border-good bg-good text-white"
                              : "border-line bg-white text-transparent",
                          )}
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-semibold text-navy">
                            {it.name}
                          </span>
                          <span className="block text-[10.5px] text-muted">
                            {it.drugId
                              ? `${it.dose} · ${it.timesPerDay} lần/ngày`
                              : "Chưa có trong danh mục — thêm tay"}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}

          {message ? (
            <p className="mt-3 rounded-xl bg-peach-soft/60 px-3 py-2.5 text-[11px] leading-relaxed text-[#7a4a17]">
              {message}
            </p>
          ) : null}
        </div>

        <div className="border-t border-line/70 px-4 py-3">
          <button
            type="button"
            onClick={submit}
            disabled={selected.length === 0}
            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-pill bg-navy text-[13px] font-semibold text-white disabled:opacity-40"
          >
            Thêm {selected.length > 0 ? selected.length : ""} thuốc vào lịch
          </button>
          <p className="mt-2 text-center text-[9.5px] leading-snug text-muted">
            Ảnh chỉ dùng để đọc tên thuốc, không lưu lại. Luôn kiểm tra lại với
            đơn giấy trước khi dùng.
          </p>
        </div>
      </div>
    </div>
  );
}
