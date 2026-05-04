"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NabooShell, type ActiveKey } from "@/shared/components/NabooShell";
import { EventWebsiteView } from "@/features/event-website/components/EventWebsiteView";

function activeKeyForTab(tab: string | null): ActiveKey {
  return tab === "forms" ? "event-website-forms" : "event-website";
}

function PageInner() {
  const search = useSearchParams();
  const activeItem = activeKeyForTab(search?.get("tab") ?? null);
  return (
    <NabooShell activeItem={activeItem}>
      <EventWebsiteView />
    </NabooShell>
  );
}

export default function EventWebsitePage() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  );
}
