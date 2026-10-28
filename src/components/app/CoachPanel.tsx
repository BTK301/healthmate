"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, ShieldAlert, Sparkles, X } from "lucide-react";
import { askCoach, SUGGESTED_CHIPS, type CoachContext } from "@/core/coach/coach";
import { buildFacts } from "@/core/coach/prompt";
import { cn } from "@/lib/cn";

interface Msg {
  role: "user" | "coach";
  text: string;
  safety?: "red-flag" | "refusal";
  source?: "rules" | "llm";
}

export function CoachPanel({ ctx }: { ctx: CoachContext }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [usingLlm, setUsingLlm] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "coach",
      text: `Chào ${ctx.profile.name}. Mình đọc được hồ sơ, thực đơn và thuốc bạn đang dùng. Hỏi mình bất cứ điều gì về bữa ăn hôm nay.`,
      source: "rules",
    },
  ]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, busy]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;

    const local = askCoach(text, ctx);
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");

    // red flags and refusals never touch the network
    if (local.safety) {
      setMessages((m) => [
        ...m,
        { role: "coach", text: local.text, safety: local.safety, source: "rules" },
      ]);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, facts: buildFacts(ctx) }),
      });
      const data = (await res.json()) as {
        text?: string | null;
        source?: string;
      };

      if (data.source === "llm" && data.text) {
        setUsingLlm(true);
        setMessages((m) => [
          ...m,
          { role: "coach", text: data.text as string, source: "llm" },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "coach", text: local.text, source: "rules" },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "coach", text: local.text, source: "rules" },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-24 z-40 inline-flex h-12 w-12 items-center justify-center gap-2 rounded-pill bg-navy text-white shadow-float transition-transform hover:-translate-y-0.5 sm:right-6 sm:bottom-6 sm:w-auto sm:px-4"
      >
        <Sparkles className="h-4 w-4 shrink-0" />
        <span className="hidden text-[12.5px] font-semibold sm:inline">
          Hỏi HealthMate
        </span>
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
                    {usingLlm
                      ? "Số liệu từ engine · diễn đạt bởi AI"
                      : "Trả lời từ engine tính toán, không tự sinh số liệu"}
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
                    {m.safety ? (
                      <ShieldAlert className="mb-1 h-3.5 w-3.5" />
                    ) : null}
                    {m.text}
                  </div>
                ))}

                {busy ? (
                  <div className="flex max-w-[88%] items-center gap-1.5 rounded-2xl bg-canvas/80 px-3.5 py-2.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="border-t border-line/70 px-3 pt-2.5 pb-3">
                <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                  {SUGGESTED_CHIPS.map((c) => (
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
                    disabled={busy}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-white disabled:opacity-50"
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
