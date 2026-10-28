"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, ShieldAlert, Sparkles, X } from "lucide-react";
import { askCoach, SUGGESTED_CHIPS, type CoachContext } from "@/core/coach/coach";
import { cn } from "@/lib/cn";

interface Msg {
  role: "user" | "coach";
  text: string;
  safety?: "red-flag" | "refusal";
}

export function CoachPanel({ ctx }: { ctx: CoachContext }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "coach",
      text: `Chào ${ctx.profile.name}. Mình đọc được hồ sơ, thực đơn và thuốc bạn đang dùng. Hỏi mình bất cứ điều gì về bữa ăn hôm nay.`,
    },
  ]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const answer = askCoach(text, ctx);
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "coach", text: answer.text, safety: answer.safety },
    ]);
    setInput("");
  };

  const lastChips =
    messages[messages.length - 1]?.role === "coach" ? SUGGESTED_CHIPS : SUGGESTED_CHIPS;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-24 z-40 inline-flex h-12 items-center gap-2 rounded-pill bg-navy px-4 text-[12.5px] font-semibold text-white shadow-float transition-transform hover:-translate-y-0.5 sm:right-6 sm:bottom-6"
      >
        <Sparkles className="h-4 w-4" />
        Hỏi HealthMate
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/25 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Trợ lý HealthMate"
              className="absolute inset-x-3 bottom-3 flex max-h-[80dvh] flex-col overflow-hidden rounded-[26px] border border-white/70 bg-surface shadow-float sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[560px] sm:w-[400px]"
            >
              <header className="flex items-center gap-2.5 border-b border-line/70 px-4 py-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-good-soft text-good">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold">HealthMate Coach</p>
                  <p className="text-[10px] text-muted">
                    Trả lời từ engine tính toán, không tự sinh số liệu
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Đóng"
                  className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-canvas"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div
                ref={scroller}
                className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                      m.role === "user"
                        ? "ml-auto bg-navy text-white"
                        : m.safety
                          ? "bg-danger/10 text-[#8c3423]"
                          : "bg-canvas/80 text-navy",
                    )}
                  >
                    {m.safety === "red-flag" ? (
                      <ShieldAlert className="mb-1 h-3.5 w-3.5" />
                    ) : null}
                    {m.safety === "refusal" ? (
                      <ShieldAlert className="mb-1 h-3.5 w-3.5" />
                    ) : null}
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="border-t border-line/70 px-3 pt-2.5 pb-3">
                <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                  {lastChips.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => send(c)}
                      className="shrink-0 rounded-pill border border-line bg-white px-2.5 py-1 text-[10.5px] font-medium whitespace-nowrap text-muted hover:border-navy/30 hover:text-navy"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi về bữa ăn, thuốc, vận động…"
                    className="h-10 flex-1 rounded-pill border border-line bg-white px-4 text-[12.5px] outline-none focus:border-navy/40"
                  />
                  <button
                    type="submit"
                    aria-label="Gửi"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-white"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </form>
                <p className="mt-2 px-1 text-[9.5px] leading-snug text-muted">
                  Thông tin tham khảo, không thay thế bác sĩ hoặc dược sĩ.
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
