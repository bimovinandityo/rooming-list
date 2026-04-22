"use client";

import { X } from "lucide-react";
import { cn } from "@/shared/utils";
import type { Room, Participant } from "../types";

interface RoomRowProps {
  room: Room;
  draggingParticipant: Participant | null;
  isDropTarget: boolean;
  onRemove: (slotId: string) => void;
  onSlotClick: (slotId: string) => void;
  onDrop: (slotId: string) => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onChipDragStart: (participantId: string, slotId: string) => void;
  onDragEnd: () => void;
}

export function RoomRow({
  room,
  draggingParticipant,
  isDropTarget,
  onRemove,
  onSlotClick,
  onDrop,
  onDragOver,
  onDragLeave,
  onChipDragStart,
  onDragEnd,
}: RoomRowProps) {
  const isFull = room.slots.every((s) => s.participant);
  const hasPmr = room.slots.some((s) => s.participant?.isAccessibility);

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0 transition-colors border-l-2",
        hasPmr && !isDropTarget ? "border-l-blue-300" : "border-l-transparent",
        isDropTarget && !isFull && "bg-blue-50",
        isDropTarget && isFull && "bg-red-50/50",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        const empty = room.slots.find((s) => !s.participant);
        if (empty) onDrop(empty.id);
      }}
    >
      {/* Room name */}
      <div className="w-44 shrink-0">
        <div className="text-sm font-medium text-slate-800">{room.name}</div>
        {room.privateBathroom && (
          <div className="text-[11px] text-gray-400 mt-0.5">Private bathroom</div>
        )}
      </div>

      {/* Bed description */}
      <div className="w-44 shrink-0">
        <span className="text-xs text-gray-400">{room.bedDescription}</span>
      </div>

      {/* Participant chips + empty slots */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0 py-1">
        {room.slots.map((slot) =>
          slot.participant ? (
            <div
              key={slot.id}
              draggable
              onDragStart={() => onChipDragStart(slot.participant!.id, slot.id)}
              onDragEnd={onDragEnd}
              className={cn(
                "group flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded px-2.5 py-1 text-sm text-slate-700 select-none cursor-grab active:cursor-grabbing transition-opacity",
                draggingParticipant?.id === slot.participant.id && "opacity-40",
              )}
            >
              {slot.participant.isVip && (
                <span className="text-[9px] font-bold bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded leading-none">
                  VIP
                </span>
              )}
              {slot.participant.isAccessibility && (
                <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1 py-0.5 rounded leading-none">
                  PMR
                </span>
              )}
              {slot.participant.isLateArrival && (
                <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-1 py-0.5 rounded leading-none">
                  Late
                </span>
              )}
              <span>{slot.participant.name}</span>
              <button
                onClick={() => onRemove(slot.id)}
                className="opacity-0 group-hover:opacity-100 ml-0.5 text-gray-400 hover:text-gray-700 transition-opacity"
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <button
              key={slot.id}
              onClick={() => onSlotClick(slot.id)}
              className={cn(
                "flex items-center border border-dashed rounded px-3 py-1 text-xs transition-colors",
                isDropTarget && draggingParticipant
                  ? "border-blue-400 text-blue-500 bg-blue-50"
                  : "border-gray-300 text-gray-400 hover:border-slate-400 hover:text-slate-500",
              )}
            >
              Empty
            </button>
          ),
        )}
      </div>
    </div>
  );
}
