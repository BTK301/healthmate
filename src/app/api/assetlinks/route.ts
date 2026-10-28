import { NextResponse } from "next/server";

/**
 * Serves /.well-known/assetlinks.json (via a rewrite in next.config.ts).
 *
 * Android only hides the browser address bar in a Trusted Web Activity when the
 * site proves ownership of the app package. The fingerprint comes from the
 * keystore used to sign the APK, so it is injected through an environment
 * variable instead of being hard-coded.
 *
 * Set ANDROID_ASSETLINKS to the JSON array produced by PWABuilder.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const raw = process.env.ANDROID_ASSETLINKS?.trim();

  if (!raw) {
    return NextResponse.json([], {
      headers: { "cache-control": "public, max-age=60" },
    });
  }

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed, {
      headers: { "cache-control": "public, max-age=300" },
    });
  } catch {
    // never serve malformed JSON to Android — it would break verification
    return NextResponse.json([], {
      headers: { "cache-control": "no-store" },
    });
  }
}
