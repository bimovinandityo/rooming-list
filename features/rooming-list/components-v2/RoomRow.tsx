"use client";

import { X, Users } from "lucide-react";
import { cn } from "@/shared/utils";
import { EVENT_CHECK_IN_DATE, EVENT_CHECK_OUT_DATE } from "../mock/data";
import type { Room, Participant } from "../types";

function isParticipantPresent(p: Participant, night: string): boolean {
  const checkIn = p.checkInDate ?? EVENT_CHECK_IN_DATE;
  const checkOut = p.checkOutDate ?? EVENT_CHECK_OUT_DATE;
  return checkIn <= night && checkOut > night;
}

function shortDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface RoomRowProps {
  room: Room;
  draggingParticipant: Participant | null;
  isDropTarget: boolean;
  selectedNight: string | null;
  participantsById: Map<string, Participant>;
  searchTerm?: string;
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
  selectedNight,
  participantsById,
  searchTerm,
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
        <div className="flex items-center gap-1.5">
          <div className="text-sm font-medium text-slate-800">{room.name}</div>
          {room.vipOnly && (
            <span className="text-[9px] font-bold bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded leading-none shrink-0">
              VIP only
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {room.floor != null && (
            <span className="text-[11px] text-gray-400">Floor {room.floor}</span>
          )}
          {room.privateBathroom && (
            <span className="text-[11px] text-gray-400">
              {room.floor != null ? "· " : ""}Private bathroom
            </span>
          )}
        </div>
      </div>

      {/* Bed description */}
      <div className="w-44 shrink-0">
        <span className="text-xs text-gray-400">{room.bedDescription}</span>
      </div>

      {/* Participant chips + empty slots */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0 py-1">
        {room.slots.map((slot) => {
          if (!slot.participant) {
            return (
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
            );
          }

          const p = slot.participant;
          const absent = selectedNight !== null && !isParticipantPresent(p, selectedNight);
          const arrivingLater =
            absent && (p.checkInDate ?? EVENT_CHECK_IN_DATE) > (selectedNight ?? "");
          const leftAlready = absent && !arrivingLater;

          const nonStandardCheckIn = p.checkInDate && p.checkInDate !== EVENT_CHECK_IN_DATE;
          const nonStandardCheckOut = p.checkOutDate && p.checkOutDate !== EVENT_CHECK_OUT_DATE;

          const checkIn = p.checkInDate ?? EVENT_CHECK_IN_DATE;
          const checkOut = p.checkOutDate ?? EVENT_CHECK_OUT_DATE;
          const nonStandard = nonStandardCheckIn || nonStandardCheckOut;

          return (
            <div
              key={slot.id}
              draggable={!absent}
              onDragStart={() => !absent && onChipDragStart(p.id, slot.id)}
              onDragEnd={onDragEnd}
              className={cn(
                "group flex flex-col rounded px-2.5 py-1.5 select-none transition-all",
                absent
                  ? "border border-dashed border-gray-200 bg-gray-50 text-gray-300 cursor-default"
                  : "bg-gray-100 border border-gray-200 text-slate-700 cursor-grab active:cursor-grabbing",
                !absent && draggingParticipant?.id === p.id && "opacity-40",
                searchTerm &&
                  p.name.toLowerCase().includes(searchTerm) &&
                  "ring-2 ring-yellow-400 bg-yellow-50 border-yellow-300",
              )}
            >
              {/* Line 1: name + VIP/PMR icons + remove */}
              <div className="flex items-center gap-1.5">
                <span className={cn("text-sm leading-tight", absent && "line-through")}>
                  {p.name}
                </span>
                {!absent && p.isVip && (
                  <span className="shrink-0 text-[9px] font-bold bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded leading-none">
                    VIP
                  </span>
                )}
                {!absent && p.isAccessibility && (
                  <span className="shrink-0 text-[10px] leading-none">♿</span>
                )}
                {!absent && (
                  <button
                    onClick={() => onRemove(slot.id)}
                    className="opacity-0 group-hover:opacity-100 ml-0.5 text-gray-400 hover:text-gray-700 transition-opacity shrink-0"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
              {/* Line 2: dates + Early in/Late out (matches drawer row) */}
              {!absent && (
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span
                    className={cn(
                      "text-[10px] leading-none",
                      nonStandard ? "text-amber-600 font-medium" : "text-gray-400",
                    )}
                  >
                    {shortDate(checkIn)} → {shortDate(checkOut)}
                  </span>
                  {p.isEarlyCheckIn && checkIn === EVENT_CHECK_IN_DATE && (
                    <span className="text-[9px] font-medium bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded leading-none">
                      Early in
                    </span>
                  )}
                  {p.isLateCheckOut && checkOut === EVENT_CHECK_OUT_DATE && (
                    <span className="text-[9px] font-medium bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded leading-none">
                      Late out
                    </span>
                  )}
                </div>
              )}
              {/* Roommate preferences with met/unmet state */}
              {!absent && p.roommatePreferences && p.roommatePreferences.length > 0 && (
                <div className="flex items-center gap-1 mt-0.5 text-[10px] leading-tight">
                  <Users size={10} className="shrink-0 text-violet-500" />
                  <span className="flex flex-wrap gap-x-1">
                    {p.roommatePreferences.map((prefId, i) => {
                      const full = participantsById.get(prefId)?.name;
                      if (!full) return null;
                      const [first, ...rest] = full.split(" ");
                      const last = rest[rest.length - 1];
                      const prefName = last ? `${first} ${last[0]}.` : first;
                      const isInSameRoom = room.slots.some((s) => s.participant?.id === prefId);
                      return (
                        <span
                          key={prefId}
                          className={cn(
                            isInSameRoom ? "text-emerald-600 font-medium" : "text-violet-600",
                          )}
                        >
                          {isInSameRoom && "✓ "}
                          {prefName}
                          {i < p.roommatePreferences!.length - 1 ? "," : ""}
                        </span>
                      );
                    })}
                  </span>
                </div>
              )}
              {/* Per-night absence reason */}
              {arrivingLater && (
                <span className="text-[9px] font-medium bg-orange-50 text-orange-400 px-1.5 py-0.5 rounded leading-none mt-0.5">
                  arrives {shortDate(p.checkInDate ?? EVENT_CHECK_IN_DATE)}
                </span>
              )}
              {leftAlready && (
                <span className="text-[9px] font-medium bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded leading-none mt-0.5">
                  left {shortDate(p.checkOutDate ?? EVENT_CHECK_OUT_DATE)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
