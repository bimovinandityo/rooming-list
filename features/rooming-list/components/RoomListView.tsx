"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/shared/utils";
import { RoomRow } from "./RoomRow";
import type { Building, Participant } from "../types";

interface RoomListViewProps {
  buildings: Building[];
  draggingParticipant: Participant | null;
  onRemove: (roomId: string, slotId: string) => void;
  onSlotClick: (roomId: string, slotId: string) => void;
  onDrop: (roomId: string, slotId: string) => void;
  onAddRoom: (buildingId: string) => void;
}

export function RoomListView({
  buildings,
  draggingParticipant,
  onRemove,
  onSlotClick,
  onDrop,
  onAddRoom,
}: RoomListViewProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  function toggle(id: string) {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
      {buildings.map((building) => {
        const isLate = building.isLateArrival;
        const isCollapsed = collapsed[building.id];

        return (
          <div key={building.id}>
            {/* Building header */}
            <div
              className={cn(
                "flex items-center justify-between px-4 py-2.5 rounded-t-lg border",
                isCollapsed ? "rounded-b-lg" : "border-b-0",
                isLate ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200",
              )}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggle(building.id)}
                  className={cn("transition-colors", isLate ? "text-orange-400" : "text-gray-400")}
                >
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </button>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isLate ? "text-orange-700" : "text-slate-700",
                  )}
                >
                  {building.name}
                </span>
                {isLate && (
                  <span className="text-[10px] font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    Hors liste
                  </span>
                )}
              </div>

              <button
                onClick={() => onAddRoom(building.id)}
                className={cn(
                  "flex items-center gap-1 text-xs px-2.5 py-1 rounded border transition-colors",
                  isLate
                    ? "text-orange-600 border-orange-300 hover:bg-orange-100"
                    : "text-gray-500 border-gray-200 hover:bg-white",
                )}
              >
                <Plus size={12} />
                {isLate ? "Ajouter arrivée tardive" : "Chambre"}
              </button>
            </div>

            {/* Room rows */}
            {!isCollapsed && (
              <div className="bg-white border border-gray-200 rounded-b-lg overflow-hidden">
                {building.rooms.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    Aucune chambre — cliquez sur &ldquo;+ Chambre&rdquo; pour en ajouter une.
                  </div>
                ) : (
                  building.rooms.map((room) => (
                    <RoomRow
                      key={room.id}
                      room={room}
                      draggingParticipant={draggingParticipant}
                      isDropTarget={dropTarget === room.id}
                      onRemove={(slotId) => onRemove(room.id, slotId)}
                      onSlotClick={(slotId) => onSlotClick(room.id, slotId)}
                      onDrop={(slotId) => {
                        onDrop(room.id, slotId);
                        setDropTarget(null);
                      }}
                      onDragOver={() => setDropTarget(room.id)}
                      onDragLeave={() => setDropTarget((prev) => (prev === room.id ? null : prev))}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
