import { cn } from "@/lib/cn";

/**
 * HealthMate mark — a compass star with four sails.
 * Single-path, single colour so it works at 16px (favicon) and 512px (app icon).
 */
export function LogoMark({
  className,
  strokeWidth = 3.4,
  variant = "star",
}: {
  className?: string;
  strokeWidth?: number;
  variant?: "star" | "full";
}) {
  return (
    <svg
      viewBox="0 0 96 96"
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
        <path d="M48 27c2.1 14.6 6.4 18.9 21 21-14.6 2.1-18.9 6.4-21 21-2.1-14.6-6.4-18.9-21-21 14.6-2.1 18.9-6.4 21-21Z" />
        {variant === "full" ? (
          <>
            {/* north-east sail */}
            <path d="M64 32 79 5l14 40Z" />
            {/* south-east sail */}
            <path d="M64 64 93 45l-16 48Z" />
            {/* west sail — the thin needle */}
            <path d="M32 64 5 60l26-27Z" />
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
      <LogoMark className={cn("h-7 w-7", markClassName)} />
      <span className="font-display text-[17px] font-extrabold tracking-[-0.04em]">
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
        "inline-grid place-items-center rounded-[22%] text-navy",
        className,
      )}
      style={{
        background:
          "linear-gradient(165deg, #f8c48d 0%, #f5b173 45%, #fbe4c8 100%)",
      }}
    >
      <LogoMark className="h-[62%] w-[62%]" strokeWidth={4} variant="full" />
    </span>
  );
}
