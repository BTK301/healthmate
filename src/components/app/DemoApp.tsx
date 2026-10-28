"use client";

import { ProfileProvider, useProfile } from "@/lib/profile-store";
import { DiaryProvider } from "@/lib/diary-store";
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

  return <Workspace profile={profile} />;
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
