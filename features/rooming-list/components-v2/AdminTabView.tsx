"use client";

import { useState } from "react";
import { GestionDesChambres } from "./GestionDesChambres";
import { GuestList } from "./GuestList";
import { mockParticipants, mockBuildingsAssigned } from "../mock/data";

const TABS = ["Guest list", "Rooming list", "Attachments"] as const;
type Tab = (typeof TABS)[number];

export function AdminTabView() {
  const [activeTab, setActiveTab] = useState<Tab>("Rooming list");

  return (
    <>
      <div className="px-8 pt-6 shrink-0 bg-white border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Accommodation</h1>
        <div className="flex gap-6 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm pb-3 transition-colors ${
                activeTab === tab
                  ? "text-gray-900 font-medium border-b-2 border-gray-900 -mb-px"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {activeTab === "Guest list" && (
          <GuestList participants={mockParticipants} buildings={mockBuildingsAssigned} />
        )}
        {activeTab === "Rooming list" && <GestionDesChambres hideTitle />}
        {activeTab === "Attachments" && (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            Attachments coming soon
          </div>
        )}
      </div>
    </>
  );
}
