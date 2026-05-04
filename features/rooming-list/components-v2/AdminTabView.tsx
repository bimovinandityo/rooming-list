"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GestionDesChambres } from "./GestionDesChambres";
import { GuestList } from "./GuestList";
import { AttachmentsTab } from "./AttachmentsTab";
import { mockParticipants, mockBuildingsAssigned } from "../mock/data";

const TABS = [
  { key: "guests", label: "Guest list" },
  { key: "rooming", label: "Rooming list" },
  { key: "attachments", label: "Attachments" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function AdminTabView() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const search = useSearchParams();
  const fromUrl = search?.get("tab") as TabKey | null;
  const initial = fromUrl && TABS.some((t) => t.key === fromUrl) ? fromUrl : "rooming";
  const [activeTab, setActiveTab] = useState<TabKey>(initial);

  useEffect(() => {
    if (fromUrl && TABS.some((t) => t.key === fromUrl) && fromUrl !== activeTab) {
      setActiveTab(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl]);

  return (
    <>
      <div className="px-8 pt-6 shrink-0 bg-white border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Accommodation</h1>
        <div className="flex gap-6 mt-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`text-sm pb-3 transition-colors ${
                activeTab === t.key
                  ? "text-gray-900 font-medium border-b-2 border-gray-900 -mb-px"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {activeTab === "guests" && (
          <GuestList participants={mockParticipants} buildings={mockBuildingsAssigned} />
        )}
        {activeTab === "rooming" && <GestionDesChambres hideTitle />}
        {activeTab === "attachments" && <AttachmentsTab />}
      </div>
    </>
  );
}
