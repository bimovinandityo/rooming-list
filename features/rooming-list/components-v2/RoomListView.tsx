"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils";
import { RoomRow } from "./RoomRow";
import type { Building, Participant } from "../types";

interface RoomListViewProps {
  buildings: Building[];
  draggingParticipant: Participant | null;
  onRemove: (roomId: string, slotId: string) => void;
  onSlotClick: (roomId: string, slotId: string) => void;
  onDrop: (roomId: string, slotId: string) => void;
  onChipDragStart: (participantId: string, roomId: string, slotId: string) => void;
  onDragEnd: () => void;
}

export function RoomListView({
  buildings,
  draggingParticipant,
  onRemove,
  onSlotClick,
  onDrop,
  onChipDragStart,
  onDragEnd,
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
                    Late arrivals
                  </span>
                )}
              </div>
            </div>

            {/* Room rows */}
            {!isCollapsed && (
              <div className="bg-white border border-gray-200 rounded-b-lg overflow-hidden">
                {building.rooms.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    No rooms yet — click &ldquo;+ Room&rdquo; to add one.
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
                      onChipDragStart={(participantId, slotId) =>
                        onChipDragStart(participantId, room.id, slotId)
                      }
                      onDragEnd={onDragEnd}
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
