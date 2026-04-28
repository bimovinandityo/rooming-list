"use client";

import { useState, useRef } from "react";
import { GripVertical, Users } from "lucide-react";
import { cn } from "@/shared/utils";
import { EVENT_CHECK_IN_DATE, EVENT_CHECK_OUT_DATE } from "../mock/data";
import type { Participant } from "../types";

function fmt(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function isIrregular(p: Participant) {
  return (
    (p.checkInDate && p.checkInDate !== EVENT_CHECK_IN_DATE) ||
    (p.checkOutDate && p.checkOutDate !== EVENT_CHECK_OUT_DATE)
  );
}

interface ParticipantDrawerProps {
  participants: Participant[];
  assignedIds: Set<string>;
  draggingId: string | null;
  isRoomChipDragging: boolean;
  searchTerm: string;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onUnassignDrop: () => void;
}

export function ParticipantDrawer({
  participants,
  assignedIds,
  draggingId,
  isRoomChipDragging,
  searchTerm,
  onDragStart,
  onDragEnd,
  onUnassignDrop,
}: ParticipantDrawerProps) {
  const [isOver, setIsOver] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const irregularAnchorRef = useRef<HTMLDivElement>(null);

  function scrollToTop() {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToIrregular() {
    const container = scrollRef.current;
    const anchor = irregularAnchorRef.current;
    if (!container || !anchor) return;
    container.scrollTo({ top: Math.max(0, anchor.offsetTop - 28), behavior: "smooth" });
  }

  const nameById = new Map(participants.map((p) => [p.id, p.name]));

  const unassigned = participants.filter((p) => !assignedIds.has(p.id));

  const searched = !searchTerm
    ? unassigned
    : unassigned.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  function sortPriority(p: Participant) {
    if (p.isVip) return 0;
    if (p.isAccessibility) return 1;
    return 2;
  }

  const regular = searched
    .filter((p) => !isIrregular(p))
    .sort((a, b) => sortPriority(a) - sortPriority(b));
  const irregular = searched
    .filter((p) => isIrregular(p))
    .sort((a, b) => sortPriority(a) - sortPriority(b));

  return (
    <div
      className={cn(
        "w-80 shrink-0 flex flex-col border-l border-gray-200 bg-white relative transition-colors",
        "animate-slide-in-right",
        isRoomChipDragging && isOver && "bg-red-50",
      )}
      onDragOver={(e) => {
        if (!isRoomChipDragging) return;
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        if (!isRoomChipDragging) return;
        e.preventDefault();
        setIsOver(false);
        onUnassignDrop();
      }}
    >
      {isRoomChipDragging && (
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity",
            isOver ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="bg-red-100 border border-red-300 text-red-600 text-sm font-medium px-4 py-2 rounded-lg shadow-sm">
            Drop to unassign
          </div>
        </div>
      )}

      {/* Compact header — title + count only; search is global at the top of the page */}
      <div className="px-4 py-2 border-b border-gray-100 shrink-0 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">Unassigned</p>
        <span className="text-xs font-normal text-gray-400 tabular-nums">{unassigned.length}</span>
      </div>

      {/* Single scroll with sticky-stacked headers */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto min-h-0">
        {unassigned.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">All participants assigned ✓</div>
        )}
        {unassigned.length > 0 && searched.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">No results</div>
        )}

        {regular.length > 0 && (
          <>
            <button
              onClick={scrollToTop}
              className="sticky top-0 z-20 h-7 w-full flex items-center justify-between px-4 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Regular dates
              </span>
              <span className="text-[10px] text-gray-400 tabular-nums">{regular.length}</span>
            </button>
            {regular.map((p) => (
              <DrawerRow
                key={p.id}
                participant={p}
                isDragging={draggingId === p.id}
                onDragStart={() => onDragStart(p.id)}
                onDragEnd={onDragEnd}
                nameById={nameById}
              />
            ))}
          </>
        )}

        {irregular.length > 0 && (
          <>
            <div ref={irregularAnchorRef} aria-hidden className="h-0" />
            {irregular.map((p) => (
              <DrawerRow
                key={p.id}
                participant={p}
                isDragging={draggingId === p.id}
                onDragStart={() => onDragStart(p.id)}
                onDragEnd={onDragEnd}
                nameById={nameById}
              />
            ))}
          </>
        )}
      </div>

      {/* Permanent Irregular dates bar — always visible at the drawer bottom */}
      {irregular.length > 0 && (
        <button
          onClick={scrollToIrregular}
          className="shrink-0 h-7 w-full flex items-center justify-between px-4 bg-gray-50 border-t border-gray-100 hover:bg-gray-100 transition-colors"
        >
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Irregular dates
          </span>
          <span className="text-[10px] text-gray-400 tabular-nums">{irregular.length}</span>
        </button>
      )}
    </div>
  );
}

function DrawerRow({
  participant,
  isDragging,
  onDragStart,
  onDragEnd,
  nameById,
}: {
  participant: Participant;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  nameById: Map<string, string>;
}) {
  const nonStandardDates =
    (participant.checkInDate && participant.checkInDate !== EVENT_CHECK_IN_DATE) ||
    (participant.checkOutDate && participant.checkOutDate !== EVENT_CHECK_OUT_DATE);

  const showEarly =
    participant.isEarlyCheckIn &&
    (participant.checkInDate ?? EVENT_CHECK_IN_DATE) === EVENT_CHECK_IN_DATE;
  const showLate =
    participant.isLateCheckOut &&
    (participant.checkOutDate ?? EVENT_CHECK_OUT_DATE) === EVENT_CHECK_OUT_DATE;

  const hasPrefs = (participant.roommatePreferences?.length ?? 0) > 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex items-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-grab active:cursor-grabbing transition-colors",
        isDragging && "opacity-40",
      )}
    >
      <GripVertical size={12} className="text-gray-300 shrink-0" />
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 truncate">{participant.name}</p>
          <p
            className={cn(
              "text-[10px] leading-none mt-1",
              nonStandardDates ? "text-amber-600 font-medium" : "text-gray-400",
            )}
          >
            {fmt(participant.checkInDate ?? EVENT_CHECK_IN_DATE)} →{" "}
            {fmt(participant.checkOutDate ?? EVENT_CHECK_OUT_DATE)}
          </p>
          {hasPrefs && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-violet-600 leading-tight">
              <Users size={10} className="shrink-0" />
              <span className="truncate">
                {participant
                  .roommatePreferences!.map((id) => {
                    const full = nameById.get(id);
                    if (!full) return "";
                    const [first, ...rest] = full.split(" ");
                    const last = rest[rest.length - 1];
                    return last ? `${first} ${last[0]}.` : first;
                  })
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
        </div>
        {/* Trailing badge cluster — right-aligned, single row */}
        <div className="flex items-center gap-1 shrink-0">
          {participant.isVip && (
            <span className="text-[9px] font-bold bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded leading-none">
              VIP
            </span>
          )}
          {participant.isAccessibility && (
            <span className="text-[10px] leading-none" title="Accessibility">
              ♿
            </span>
          )}
          {showEarly && (
            <span
              title="Early check-in"
              className="text-[9px] font-medium bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded leading-none"
            >
              Early
            </span>
          )}
          {showLate && (
            <span
              title="Late check-out"
              className="text-[9px] font-medium bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded leading-none"
            >
              Late
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
