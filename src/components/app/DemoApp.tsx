"use client";

import { ProfileProvider, useProfile } from "@/lib/profile-store";
import { DiaryProvider } from "@/lib/diary-store";
import { MetricsProvider } from "@/lib/metrics-store";
import { MedsProvider } from "@/lib/meds-store";
import { Onboarding } from "@/components/app/Onboarding";
import { Workspace } from "@/components/app/Workspace";

function Gate() {
  const { profile, ready, save } = useProfile();

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy/15 border-t-navy" />
      </div>
    );
  }

  if (!profile) return <Onboarding onDone={save} />;

  return (
    <MetricsProvider seedWeight={profile.weightKg}>
      <MedsProvider seedDrugIds={profile.drugIds}>
        <Workspace profile={profile} />
      </MedsProvider>
    </MetricsProvider>
  );
}

export function DemoApp() {
  return (
    <ProfileProvider>
      <DiaryProvider>
        <Gate />
      </DiaryProvider>
    </ProfileProvider>
  );
}
