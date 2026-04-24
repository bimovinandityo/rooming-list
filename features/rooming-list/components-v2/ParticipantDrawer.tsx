"use client";

import { useState } from "react";
import { GripVertical, ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils";
import { EVENT_CHECK_IN_DATE, EVENT_CHECK_OUT_DATE } from "../mock/data";
import type { Participant } from "../types";

function fmt(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function irregularityScore(p: Participant) {
  let score = 0;
  if (p.checkInDate && p.checkInDate !== EVENT_CHECK_IN_DATE) score += 2;
  if (p.checkOutDate && p.checkOutDate !== EVENT_CHECK_OUT_DATE) score += 2;
  if (p.isEarlyCheckIn && (p.checkInDate ?? EVENT_CHECK_IN_DATE) === EVENT_CHECK_IN_DATE)
    score += 1;
  if (p.isLateCheckOut && (p.checkOutDate ?? EVENT_CHECK_OUT_DATE) === EVENT_CHECK_OUT_DATE)
    score += 1;
  return score;
}

interface ParticipantDrawerProps {
  participants: Participant[];
  assignedIds: Set<string>;
  draggingId: string | null;
  isRoomChipDragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onUnassignDrop: () => void;
}

export function ParticipantDrawer({
  participants,
  assignedIds,
  draggingId,
  isRoomChipDragging,
  onDragStart,
  onDragEnd,
  onUnassignDrop,
}: ParticipantDrawerProps) {
  const [search, setSearch] = useState("");
  const [isOver, setIsOver] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    timing: true,
    dates: true,
  });
  const [activeFilter, setActiveFilter] = useState<"all" | "vip" | "pmr">("all");

  const unassigned = participants.filter((p) => !assignedIds.has(p.id));

  const filtered = unassigned.filter((p) => {
    if (activeFilter === "vip") return !!p.isVip;
    if (activeFilter === "pmr") return !!p.isAccessibility;
    return true;
  });

  const searched = !search
    ? filtered
    : filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const regular = searched.filter((p) => irregularityScore(p) === 0);
  const timing = searched.filter((p) => irregularityScore(p) === 1);
  const nonStandard = searched.filter((p) => irregularityScore(p) >= 2);

  const sections = [
    { key: "regular", label: "Regular dates", items: regular },
    { key: "timing", label: "Early CI / Late CO", items: timing },
    { key: "dates", label: "Irregular dates", items: nonStandard },
  ].filter((s) => s.items.length > 0);

  function toggleSection(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div
      className={cn(
        "w-72 shrink-0 flex flex-col border-l border-gray-200 bg-white relative transition-colors",
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

      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-start justify-between shrink-0">
        <div>
          <p className="text-sm font-semibold text-slate-800">Unassigned</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {unassigned.length} participant{unassigned.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* VIP / PMR filter tabs */}
      <div className="px-3 pt-2.5 pb-0 border-b border-gray-100 shrink-0 flex items-center gap-1">
        {(["all", "vip", "pmr"] as const).map((f) => {
          const label = f === "all" ? "All" : f === "vip" ? "VIP" : "PMR";
          const count =
            f === "all"
              ? unassigned.length
              : f === "vip"
                ? unassigned.filter((p) => p.isVip).length
                : unassigned.filter((p) => p.isAccessibility).length;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-t border-b-2 transition-colors",
                activeFilter === f
                  ? "border-slate-700 text-slate-800 font-semibold"
                  : "border-transparent text-gray-400 hover:text-slate-600",
              )}
            >
              {label}
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  activeFilter === f ? "text-slate-600" : "text-gray-300",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-gray-100 shrink-0">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-slate-400 transition-colors"
        />
      </div>

      {/* Scrollable regular section */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {unassigned.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">All participants assigned ✓</div>
        )}
        {unassigned.length > 0 && sections.every((s) => s.key !== "regular") && (
          <div className="p-6 text-center text-sm text-gray-400">No results</div>
        )}

        {sections
          .filter((s) => s.key === "regular")
          .map((section) => {
            const isCollapsed = !!collapsed[section.key];
            return (
              <div key={section.key}>
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    {section.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 tabular-nums">
                      {section.items.length}
                    </span>
                    <ChevronDown
                      size={11}
                      className={cn(
                        "text-gray-300 transition-transform duration-150",
                        isCollapsed && "-rotate-90",
                      )}
                    />
                  </div>
                </button>
                {!isCollapsed &&
                  section.items.map((p) => (
                    <DrawerRow
                      key={p.id}
                      participant={p}
                      isDragging={draggingId === p.id}
                      onDragStart={() => onDragStart(p.id)}
                      onDragEnd={onDragEnd}
                    />
                  ))}
              </div>
            );
          })}
      </div>

      {/* Pinned bottom: Early CI/CO + Irregular dates */}
      {sections.filter((s) => s.key === "timing" || s.key === "dates").length > 0 && (
        <div className="shrink-0 border-t border-gray-200">
          {sections
            .filter((s) => s.key === "timing" || s.key === "dates")
            .map((section) => {
              const isCollapsed = !!collapsed[section.key];
              return (
                <div key={section.key}>
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      {section.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 tabular-nums">
                        {section.items.length}
                      </span>
                      <ChevronDown
                        size={11}
                        className={cn(
                          "text-gray-300 transition-transform duration-150",
                          isCollapsed && "-rotate-90",
                        )}
                      />
                    </div>
                  </button>
                  {!isCollapsed && (
                    <div className="max-h-48 overflow-y-auto">
                      {section.items.map((p) => (
                        <DrawerRow
                          key={p.id}
                          participant={p}
                          isDragging={draggingId === p.id}
                          onDragStart={() => onDragStart(p.id)}
                          onDragEnd={onDragEnd}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

function DrawerRow({
  participant,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  participant: Participant;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex items-center gap-2 px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 cursor-grab active:cursor-grabbing transition-colors",
        isDragging && "opacity-40",
      )}
    >
      <GripVertical size={12} className="text-gray-300 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 truncate">{participant.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {participant.isVip && (
            <span className="text-[9px] font-bold bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded leading-none">
              VIP
            </span>
          )}
          {participant.isAccessibility && (
            <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1 py-0.5 rounded leading-none">
              ♿
            </span>
          )}
          <span
            className={cn(
              "text-[10px] leading-none",
              (participant.checkInDate && participant.checkInDate !== EVENT_CHECK_IN_DATE) ||
                (participant.checkOutDate && participant.checkOutDate !== EVENT_CHECK_OUT_DATE)
                ? "text-amber-600 font-medium"
                : "text-gray-400",
            )}
          >
            {fmt(participant.checkInDate ?? EVENT_CHECK_IN_DATE)} →{" "}
            {fmt(participant.checkOutDate ?? EVENT_CHECK_OUT_DATE)}
          </span>
          {participant.isEarlyCheckIn &&
            (participant.checkInDate ?? EVENT_CHECK_IN_DATE) === EVENT_CHECK_IN_DATE && (
              <span className="text-[9px] font-medium bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded leading-none">
                Early in
              </span>
            )}
          {participant.isLateCheckOut &&
            (participant.checkOutDate ?? EVENT_CHECK_OUT_DATE) === EVENT_CHECK_OUT_DATE && (
              <span className="text-[9px] font-medium bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded leading-none">
                Late out
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
