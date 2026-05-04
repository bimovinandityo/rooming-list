"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/shared/utils";
import { AnnouncementsView } from "@/features/announcements/components/AnnouncementsView";
import { FeedbackView } from "@/features/feedback/components/FeedbackView";

const TABS = [
  { key: "announcements", label: "Announcements" },
  { key: "feedback", label: "Feedback" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function CommunicationView({ defaultTab }: { defaultTab?: TabKey } = {}) {
  return (
    <Suspense fallback={null}>
      <Inner defaultTab={defaultTab ?? "announcements"} />
    </Suspense>
  );
}

function Inner({ defaultTab }: { defaultTab: TabKey }) {
  const search = useSearchParams();
  const fromUrl = search?.get("tab") as TabKey | null;
  const initial = fromUrl && TABS.some((t) => t.key === fromUrl) ? fromUrl : defaultTab;
  const [activeTab, setActiveTab] = useState<TabKey>(initial);

  useEffect(() => {
    if (fromUrl && TABS.some((t) => t.key === fromUrl) && fromUrl !== activeTab) {
      setActiveTab(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl]);

  return (
    <>
      {/* Page header */}
      <div className="px-8 pt-6 shrink-0 bg-white border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Communication</h1>
        <div className="flex gap-6 mt-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "text-sm pb-3 transition-colors whitespace-nowrap",
                activeTab === t.key
                  ? "text-gray-900 font-medium border-b-2 border-gray-900 -mb-px"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "announcements" ? <AnnouncementsView /> : <FeedbackView />}
    </>
  );
}
