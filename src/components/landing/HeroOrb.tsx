"use client";

import dynamic from "next/dynamic";

const HealthOrb = dynamic(() => import("@/components/three/HealthOrb"), {
  ssr: false,
});

export function HeroOrb({ className }: { className?: string }) {
  return <HealthOrb className={className} />;
}
