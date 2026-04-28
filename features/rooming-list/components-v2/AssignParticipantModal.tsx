"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Search, Users, Check } from "lucide-react";
import { useState } from "react";
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

function sortPriority(p: Participant) {
  if (p.isVip) return 0;
  if (p.isAccessibility) return 1;
  return 2;
}

interface AssignParticipantModalProps {
  open: boolean;
  onClose: () => void;
  participants: Participant[];
  assignedIds: Set<string>;
  /** How many empty beds are available in the target room. ≥2 enables multi-select. */
  emptySlotCount?: number;
  /** Single-select assignment (1 empty slot). */
  onAssign?: (participant: Participant) => void;
  /** Multi-select assignment (≥2 empty slots). Receives participants in selection order. */
  onAssignMany?: (participants: Participant[]) => void;
}

export function AssignParticipantModal({
  open,
  onClose,
  participants,
  assignedIds,
  emptySlotCount = 1,
  onAssign,
  onAssignMany,
}: AssignParticipantModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const multi = emptySlotCount > 1;

  // Reset selection whenever the modal closes/reopens.
  if (!open && selected.length > 0) {
    setSelected([]);
  }

  const available = participants.filter(
    (p) =>
      !assignedIds.has(p.id) &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase())),
  );
  const nameById = new Map(participants.map((p) => [p.id, p.name]));

  // Same grouping/sort as the unassigned drawer:
  // Regular dates (VIP → PMR → rest), then Irregular dates (VIP → PMR → rest).
  const regular = available
    .filter((p) => !isIrregular(p))
    .sort((a, b) => sortPriority(a) - sortPriority(b));
  const irregular = available
    .filter((p) => isIrregular(p))
    .sort((a, b) => sortPriority(a) - sortPriority(b));

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= emptySlotCount) return prev; // cap at room capacity
      return [...prev, id];
    });
  }

  function handleConfirm() {
    if (!onAssignMany || selected.length === 0) return;
    const byId = new Map(participants.map((p) => [p.id, p]));
    const list = selected.map((id) => byId.get(id)).filter(Boolean) as Participant[];
    onAssignMany(list);
    setSelected([]);
    onClose();
  }

  function renderRow(p: Participant) {
    const nonStandardDates =
      (p.checkInDate && p.checkInDate !== EVENT_CHECK_IN_DATE) ||
      (p.checkOutDate && p.checkOutDate !== EVENT_CHECK_OUT_DATE);
    const showEarly =
      p.isEarlyCheckIn && (p.checkInDate ?? EVENT_CHECK_IN_DATE) === EVENT_CHECK_IN_DATE;
    const showLate =
      p.isLateCheckOut && (p.checkOutDate ?? EVENT_CHECK_OUT_DATE) === EVENT_CHECK_OUT_DATE;
    const hasPrefs = (p.roommatePreferences?.length ?? 0) > 0;
    const isSelected = selected.includes(p.id);
    const isCapped = !isSelected && selected.length >= emptySlotCount;

    return (
      <button
        key={p.id}
        disabled={multi && isCapped}
        onClick={() => {
          if (multi) {
            toggle(p.id);
          } else if (onAssign) {
            onAssign(p);
            onClose();
          }
        }}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
          multi && isCapped ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer",
          multi && isSelected && "bg-blue-50 hover:bg-blue-50",
        )}
      >
        {multi && (
          <span
            className={cn(
              "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
              isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 bg-white",
            )}
            aria-hidden
          >
            {isSelected && <Check size={11} strokeWidth={3} />}
          </span>
        )}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 truncate">{p.name}</p>
            <p
              className={cn(
                "text-[10px] leading-none mt-1",
                nonStandardDates ? "text-amber-600 font-medium" : "text-gray-400",
              )}
            >
              {fmt(p.checkInDate ?? EVENT_CHECK_IN_DATE)} →{" "}
              {fmt(p.checkOutDate ?? EVENT_CHECK_OUT_DATE)}
            </p>
            {hasPrefs && (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-violet-600 leading-tight">
                <Users size={10} className="shrink-0" />
                <span className="truncate">
                  {p
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
          <div className="flex items-center gap-1 shrink-0">
            {p.isVip && (
              <span className="text-[9px] font-bold bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded leading-none">
                VIP
              </span>
            )}
            {p.isAccessibility && (
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
      </button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[480px] max-w-[480px] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-base font-bold text-[#101f34]">
            {multi ? `Assign up to ${emptySlotCount} participants` : "Assign a participant"}
          </DialogTitle>
          {multi && (
            <p className="text-xs text-gray-500 mt-1">
              Select participants to fill the {emptySlotCount} empty beds in this room.
            </p>
          )}
        </DialogHeader>

        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto relative">
          {available.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No participants available</p>
          )}

          {regular.length > 0 && (
            <>
              <div className="sticky top-0 z-10 h-7 w-full flex items-center justify-between px-4 bg-gray-50 border-b border-gray-100">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Regular dates
                </span>
                <span className="text-[10px] text-gray-400 tabular-nums">{regular.length}</span>
              </div>
              <div className="divide-y divide-gray-200/60">{regular.map((p) => renderRow(p))}</div>
            </>
          )}

          {irregular.length > 0 && (
            <>
              <div className="sticky top-0 z-10 h-7 w-full flex items-center justify-between px-4 bg-gray-50 border-y border-gray-100">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Irregular dates
                </span>
                <span className="text-[10px] text-gray-400 tabular-nums">{irregular.length}</span>
              </div>
              <div className="divide-y divide-gray-200/60">
                {irregular.map((p) => renderRow(p))}
              </div>
            </>
          )}
        </div>

        {multi && (
          <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {selected.length} of {emptySlotCount} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="text-sm px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selected.length === 0}
                className="text-sm px-4 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Assign {selected.length > 0 ? `${selected.length} ` : ""}
                {selected.length === 1 ? "participant" : "participants"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
