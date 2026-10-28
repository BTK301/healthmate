import { NextResponse } from "next/server";
import { isUnsafeOutput, SYSTEM_PROMPT } from "@/core/coach/prompt";

export const runtime = "nodejs";

/**
 * Any OpenAI-compatible endpoint works:
 *  - Google AI Studio (free tier) — default
 *  - OpenRouter / Groq
 *  - local Ollama at http://localhost:11434/v1
 */
const BASE_URL =
  process.env.LLM_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai";
const MODEL = process.env.LLM_MODEL ?? "gemini-2.5-flash";
const KEY = process.env.LLM_API_KEY ?? "";

/** Crude in-memory limiter — enough for a demo, resets on cold start. */
const hits = new Map<string, { count: number; reset: number }>();
const LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

/** Tiny cache so repeated demo questions cost nothing. */
const cache = new Map<string, string>();
const CACHE_MAX = 200;

export async function POST(request: Request) {
  let body: { question?: string; facts?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const question = (body.question ?? "").slice(0, 500).trim();
  const facts = (body.facts ?? "").slice(0, 4000).trim();

  if (!question) {
    return NextResponse.json({ error: "missing question" }, { status: 400 });
  }

  // Without a key the client keeps its deterministic answer — nothing to do here.
  if (!KEY) {
    return NextResponse.json({ source: "no-key", text: null });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  if (rateLimited(ip)) {
    return NextResponse.json({ source: "limited", text: null });
  }

  const cacheKey = `${MODEL}:${question}:${facts}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json({ text: cached, source: "llm", cached: true });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 320,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `DỮ LIỆU (do hệ thống tính, hãy tin số liệu này):\n${facts}\n\nCÂU HỎI CỦA NGƯỜI DÙNG:\n${question}`,
          },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error("llm request failed", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ source: "error", text: null });
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();

    // Output validation — anything drifting into prescribing falls back.
    if (!text || isUnsafeOutput(text)) {
      return NextResponse.json({ source: "blocked", text: null });
    }

    if (cache.size > CACHE_MAX) cache.clear();
    cache.set(cacheKey, text);

    return NextResponse.json({ text, source: "llm" });
  } catch (error) {
    console.error("llm error", error);
    return NextResponse.json({ source: "error", text: null });
  }
}
