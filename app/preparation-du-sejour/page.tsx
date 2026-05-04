"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NabooShell, type ActiveKey } from "@/shared/components/NabooShell";
import { PreparationSejourView } from "@/features/preparation-sejour/components/PreparationSejourView";

function activeKeyForTab(tab: string | null): ActiveKey {
  if (tab === "information") return "logistics-information";
  if (tab === "schedule") return "logistics-schedule";
  if (tab === "menus") return "logistics-menus";
  return "logistics-contacts";
}

function PageInner() {
  const search = useSearchParams();
  const activeItem = activeKeyForTab(search?.get("tab") ?? null);
  return (
    <NabooShell activeItem={activeItem}>
      <PreparationSejourView />
    </NabooShell>
  );
}

export default function PreparationDuSejourPage() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  );
}
