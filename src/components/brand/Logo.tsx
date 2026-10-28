import { cn } from "@/lib/cn";

export function LogoLockup({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "light";
}) {
  return (
    <span
      className={cn(
        "font-display text-[17px] font-extrabold tracking-[-0.045em]",
        tone === "light" ? "text-white" : "text-navy",
        className,
      )}
    >
      Health
      <span className={tone === "light" ? "text-lime" : "text-good"}>Mate</span>
    </span>
  );
}
