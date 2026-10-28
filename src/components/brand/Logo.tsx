import { cn } from "@/lib/cn";

/** Tight framing for the full mark (star + sails). */
const FULL_BOX = "110 20 660 510";
/** Tight framing for the compact star used at very small sizes. */
const STAR_BOX = "440 215 250 305";

/**
 * HealthMate mark — a four-point compass star surrounded by sails.
 * Single colour, strokes only, so it stays legible from 24px to 512px.
 */
export function LogoMark({
  className,
  strokeWidth = 11,
  variant = "star",
}: {
  className?: string;
  strokeWidth?: number;
  variant?: "star" | "full";
}) {
  const full = variant === "full";

  return (
    <svg
      viewBox={full ? FULL_BOX : STAR_BOX}
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* central four-point star */}
        <path d="M557 240c9 90 33 118 91 128-58 10-82 38-91 124-9-86-33-114-91-124 58-10 82-38 91-128Z" />

        {full ? (
          <>
            {/* tall north sail */}
            <path d="M552 230c8-80 14-140 20-182 73 122 116 222 128 282Z" />
            {/* large west sail */}
            <path d="M253 372 532 200l-74 152Z" />
            {/* long south-west needle */}
            <path d="M130 395 535 500l-87-126Z" />
            {/* south-east sail */}
            <path d="M660 400 745 412l-145 82Z" />
          </>
        ) : null}
      </g>
    </svg>
  );
}

export function LogoLockup({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark
        className={cn("h-7 w-7", markClassName)}
        strokeWidth={13}
      />      <span className="font-display text-[17px] font-extrabold tracking-[-0.04em]">
        Health<span className="text-good">Mate</span>
      </span>
    </span>
  );
}

/** Logo on the warm gradient from the original brand sheet. */
export function LogoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-[26%] text-navy shadow-float ring-1 ring-white/50",
        className,
      )}
      style={{
        background:
          "linear-gradient(165deg, #f8c48d 0%, #f5b173 45%, #fbe4c8 100%)",
      }}
    >
      <LogoMark className="h-[62%] w-[78%]" strokeWidth={18} variant="full" />
    </span>
  );
}

/** Small brand plaque pinned to a corner of the screen. */
export function BrandCorner({ className }: { className?: string }) {
  return (
    <a
      href="/"
      aria-label="HealthMate — về trang chủ"
      title="HealthMate"
      className={cn(
        "fixed bottom-5 left-5 z-30 block rounded-[26%] transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      <LogoBadge className="h-14 w-14" />
    </a>
  );
}
