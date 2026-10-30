import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE_URL =
  process.env.LLM_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai";
const MODEL = process.env.LLM_VISION_MODEL ?? process.env.LLM_MODEL ?? "gemini-2.5-flash";
const KEY = process.env.LLM_API_KEY ?? "";

const MAX_BYTES = 4 * 1024 * 1024;

const PROMPT = `Bạn đọc ảnh một đơn thuốc của Việt Nam. Trả về DUY NHẤT một mảng JSON, không giải thích, không markdown.
Mỗi phần tử có dạng:
{"name": "<tên hoạt chất hoặc biệt dược, giữ nguyên tiếng Việt>", "dose": "<liều mỗi lần nếu đọc được, ví dụ '1 viên'>", "timesPerDay": <số nguyên 1-4 nếu suy ra được, else 0>}
Chỉ lấy tên thuốc thật sự đọc được. Nếu ảnh không phải đơn thuốc, trả về [].`;

export async function POST(request: Request) {
  let body: { image?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const image = body.image ?? "";
  if (!image.startsWith("data:image/")) {
    return NextResponse.json({ error: "missing image" }, { status: 400 });
  }
  if (image.length > MAX_BYTES * 1.4) {
    return NextResponse.json({ error: "image too large" }, { status: 413 });
  }

  if (!KEY) {
    return NextResponse.json({ source: "no-key", items: [] });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error("scan failed", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ source: "error", items: [] });
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content ?? "";

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1) {
      return NextResponse.json({ source: "error", items: [] });
    }

    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as unknown;
    if (!Array.isArray(parsed)) {
      return NextResponse.json({ source: "error", items: [] });
    }

    const items = parsed
      .filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null)
      .map((x) => ({
        name: String(x.name ?? "").trim(),
        dose: String(x.dose ?? "").trim(),
        timesPerDay: Math.max(0, Math.min(4, Number(x.timesPerDay) || 0)),
      }))
      .filter((x) => x.name.length > 1)
      .slice(0, 12);

    return NextResponse.json({ source: "llm", items });
  } catch (error) {
    console.error("scan error", error);
    return NextResponse.json({ source: "error", items: [] });
  }
}
