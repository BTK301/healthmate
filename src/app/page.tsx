import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  Droplets,
  Footprints,
  HeartPulse,
  Pill,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import { BrandCorner, LogoLockup, LogoMark } from "@/components/brand/Logo";
import { HeroOrb } from "@/components/landing/HeroOrb";
import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */

function Nav() {
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-4">
        <div className="glass-card flex items-center rounded-pill px-4 py-2.5">
          <LogoLockup />
        </div>
        <nav className="hidden items-center gap-7 md:flex">
          <a
            href="#features"
            className="text-[13px] font-medium text-muted transition-colors hover:text-navy"
          >
            Tính năng
          </a>
          <a
            href="#how"
            className="text-[13px] font-medium text-muted transition-colors hover:text-navy"
          >
            Cách hoạt động
          </a>
          <Link
            href="/demo"
            className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-navy px-5 text-[13px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
          >
            Vào bản demo
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */

function Vitals() {
  const items = [
    { icon: Activity, label: "Đạm", value: "96", unit: "g", tone: "text-good" },
    { icon: Droplets, label: "Nước", value: "1,6", unit: "L", tone: "text-navy" },
    { icon: Footprints, label: "Bước chân", value: "6.240", unit: "b", tone: "text-navy" },
    { icon: HeartPulse, label: "Huyết áp", value: "118/76", unit: "", tone: "text-navy" },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-line/70 bg-white px-3.5 py-3"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
            <it.icon className="h-3.5 w-3.5" strokeWidth={2.2} />
            {it.label}
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={cn(
                "tabular font-display text-[19px] leading-none font-bold",
                it.tone,
              )}
            >
              {it.value}
            </span>
            {it.unit ? (
              <span className="text-[10px] font-medium text-muted">{it.unit}</span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function AppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[430px]">
      <div
        className="absolute -inset-8 rounded-[48px] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, #bfe9d5 0%, #f9d6b4 55%, transparent 100%)",
        }}
      />
      <div className="relative rounded-[32px] border border-white/70 bg-surface p-5 shadow-float">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] leading-tight font-semibold text-navy">
              Chào Nam 👋
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              Sẵn sàng cho ngày mới chưa?
            </p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-navy text-[12px] font-bold text-white">
            N
          </div>
        </div>

        <div className="relative mt-2 grid h-[182px] place-items-center">
          <HeroOrb className="absolute top-1/2 left-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2" />
          <div className="relative text-center">
            <div className="flex items-start justify-center gap-1">
              <span className="tabular font-display text-[58px] leading-none font-extrabold tracking-[-0.05em] text-good">
                1.850
              </span>
              <span className="mt-2 rounded-full bg-white/70 px-1.5 py-0.5 text-[9.5px] font-semibold text-good">
                kcal
              </span>
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-muted">
              còn lại hôm nay
            </p>
          </div>
          <span className="absolute top-1 right-3 grid h-8 w-8 place-items-center rounded-full bg-peach text-white shadow-sm">
            <Sparkles className="h-4 w-4" strokeWidth={2.2} />
          </span>
        </div>

        <div className="relative z-10 mt-2 flex items-center gap-2">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-lime px-3 py-2 text-[11px] font-bold whitespace-nowrap text-navy">
            <CircleAlert className="h-3.5 w-3.5" strokeWidth={2.6} />
            1 tương tác thuốc
          </span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-white text-navy">
            <Pill className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-white text-navy">
            <Utensils className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="ml-auto hidden text-[11px] font-semibold whitespace-nowrap text-muted sm:inline">
            Xem tất cả →
          </span>
        </div>

        <div className="mt-4">
          <Vitals />
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl bg-gradient-to-r from-lime-soft via-canvas to-peach-soft p-[1px]">
          <div className="flex items-center gap-3 rounded-[15px] bg-white/70 px-3.5 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-navy shadow-sm">
              <Utensils className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                Bữa tối gợi ý
              </p>
              <p className="truncate text-[12.5px] font-semibold text-navy">
                Cá hấp gừng · canh rau ngót
              </p>
            </div>
            <span className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-white">
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative mx-auto max-w-[1180px] px-5 pt-10 pb-20 sm:pt-14 lg:pb-28">
      <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-white/60 px-3 py-1.5 text-[11.5px] font-semibold text-navy">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-good" />
            </span>
            Bản demo · không cần đăng ký
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.45rem,5vw,3.95rem)] font-extrabold text-navy">
            Biết cơ thể mình cần gì —{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">ngay hôm nay</span>
              <span className="absolute inset-x-0 bottom-[0.06em] z-0 h-[0.32em] rounded-sm bg-lime/70" />
            </span>
            .
          </h1>

          <p className="mt-6 max-w-[48ch] text-[16.5px] leading-relaxed text-muted">
            HealthMate tính nhu cầu dinh dưỡng từ chính chỉ số của bạn, gợi ý
            thực đơn Việt quen thuộc — và cảnh báo khi món ăn không hợp với loại
            thuốc bạn đang dùng.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/demo"
              className="group inline-flex h-12 items-center gap-2 rounded-pill bg-navy px-6 text-[14px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Vào bản demo
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="inline-flex h-12 items-center gap-2 rounded-pill border border-navy/15 bg-white/60 px-6 text-[14px] font-semibold text-navy transition-colors hover:bg-white"
            >
              Cách hoạt động
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium text-muted">
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-good" strokeWidth={2.4} />
              Dữ liệu lưu trên máy bạn
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 text-good" strokeWidth={2.4} />
              60 món Việt
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Pill className="h-3.5 w-3.5 text-good" strokeWidth={2.4} />
              25 loại thuốc
            </li>
          </ul>
        </div>

        <AppPreview />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Activity,
    title: "Tính đúng cho người Việt",
    body: "BMR, TDEE và macro theo Mifflin-St Jeor, dùng ngưỡng BMI châu Á thay vì ngưỡng phương Tây. Mọi con số đều hiện công thức.",
    tint: "bg-good-soft text-good",
  },
  {
    icon: Utensils,
    title: "Thực đơn Việt, không phải salad",
    body: "Cơm tấm, phở, canh chua — gợi ý theo khẩu vị, ngân sách và thời gian nấu. Đổi món mà vẫn giữ đúng calo.",
    tint: "bg-peach-soft text-peach-ink",
  },
  {
    icon: Pill,
    title: "Cảnh báo từ thuốc bạn uống",
    body: "Nhập thuốc đang dùng, app suy ra ràng buộc ăn uống và vận động — kèm mức độ bằng chứng và nguồn tham khảo.",
    tint: "bg-lime-soft text-navy",
  },
] as const;

function Features() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-[1180px] scroll-mt-24 px-5 pb-24"
    >
      <h2 className="sr-only">Tính năng chính</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.07}>
            <article className="group h-full rounded-card border border-white/70 bg-surface p-6 shadow-card transition-transform duration-300 hover:-translate-y-1">
              <span
                className={cn("grid h-11 w-11 place-items-center rounded-2xl", f.tint)}
              >
                <f.icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <h3 className="mt-5 font-display text-[19px] font-bold">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{f.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const steps = [
  {
    n: "01",
    title: "Nhập chỉ số",
    body: "Chiều cao, cân nặng, mức vận động và nghề nghiệp. 3 bước, khoảng 30 giây.",
  },
  {
    n: "02",
    title: "Nhận thực đơn",
    body: "Bữa ăn được ghép theo mục tiêu calo và macro, có thể đổi món tùy thích.",
  },
  {
    n: "03",
    title: "Thêm thuốc & bệnh nền",
    body: "App tự siết ràng buộc ăn uống, nhắc giờ uống thuốc và gợi ý vận động phù hợp.",
  },
] as const;

function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-24 px-5 pb-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="rounded-[32px] border border-white/70 bg-white/55 p-8 backdrop-blur-sm sm:p-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
                Cách hoạt động
              </p>
              <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-extrabold">
                Ba bước, rồi để app lo phần còn lại.
              </h2>
            </div>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-navy underline decoration-navy/20 decoration-2 underline-offset-4 hover:decoration-navy sm:self-auto"
            >
              Thử ngay
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ol className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {steps.map((s) => (
              <li key={s.n} className="relative">
                <span className="tabular font-display text-[13px] font-extrabold text-peach-ink">
                  {s.n}
                </span>
                <div className="mt-2 h-px w-full bg-navy/10" />
                <h3 className="mt-4 font-display text-[17px] font-bold">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="relative border-t border-navy/8 px-5 py-10">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <LogoLockup />
          <p className="max-w-[52ch] text-[11.5px] leading-relaxed text-muted">
            Dự án portfolio. HealthMate là công cụ tham khảo giáo dục, không phải
            dịch vụ khám chữa bệnh và không thay thế tư vấn của bác sĩ hoặc dược
            sĩ.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11.5px] font-medium text-muted">
          <LogoMark className="h-5 w-5 text-navy/40" />
          <span>Next.js · TypeScript · Three.js</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div id="top" className="relative min-h-dvh overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px]"
        style={{
          background:
            "radial-gradient(90% 60% at 78% -8%, #fbe3c9 0%, transparent 60%), radial-gradient(70% 55% at 6% 4%, #d8f0e4 0%, transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="halftone pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-60"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, black 35%, transparent 92%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 35%, transparent 92%)",
        }}
      />

      <Nav />
      <main className="relative">
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
      <BrandCorner className="hidden sm:block" />
    </div>
  );
}
