"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Building } from "../types";
import type { BuildingTemplate, RoomTemplate } from "../types/builder";

// ── Conversion ────────────────────────────────────────────────────────────────

function describeBeds(rt: RoomTemplate): string {
  const parts = rt.bedTypes.map((e) => `${e.count} ${e.type}${e.count > 1 ? "s" : ""}`);
  const base = parts.join(" + ");
  return rt.privateBathroom ? `${base} · Private bathroom` : base;
}

function templatesToBuildings(templates: BuildingTemplate[]): Building[] {
  return templates.map((bt) => ({
    id: bt.id,
    name: bt.name,
    rooms: bt.rooms.flatMap((rt: RoomTemplate) => {
      const totalBeds = rt.bedTypes.reduce((sum, e) => sum + e.count, 0);
      return Array.from({ length: rt.count }, (_, i) => ({
        id: `${rt.id}-${i}`,
        name: rt.count > 1 ? `${rt.name} ${i + 1}` : rt.name,
        bedDescription: describeBeds(rt),
        privateBathroom: rt.privateBathroom,
        photoUrl: rt.photos?.[rt.primaryPhotoIndex ?? 0],
        floor: rt.floor,
        vipOnly: rt.vipOnly,
        slots: Array.from({ length: totalBeds }, (_, j) => ({
          id: `slot-${rt.id}-${i}-${j}`,
        })),
      }));
    }),
  }));
}

// ── Context ───────────────────────────────────────────────────────────────────

interface RoomingListContextType {
  // Builder state (live, unsaved edits)
  templates: BuildingTemplate[];
  setTemplates: (t: BuildingTemplate[]) => void;

  // Published snapshot consumed by the assignment tool
  publishedBuildings: Building[] | null;
  publishedAt: Date | null;
  publish: (templates: BuildingTemplate[]) => void;
}

const RoomingListContext = createContext<RoomingListContextType | null>(null);

export function RoomingListProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<BuildingTemplate[]>([]);
  const [publishedBuildings, setPublishedBuildings] = useState<Building[] | null>(null);
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);

  function publish(t: BuildingTemplate[]) {
    setPublishedBuildings(templatesToBuildings(t));
    setPublishedAt(new Date());
  }

  return (
    <RoomingListContext.Provider
      value={{ templates, setTemplates, publishedBuildings, publishedAt, publish }}
    >
      {children}
    </RoomingListContext.Provider>
  );
}

export function useRoomingList() {
  const ctx = useContext(RoomingListContext);
  if (!ctx) throw new Error("useRoomingList must be used inside RoomingListProvider");
  return ctx;
}
