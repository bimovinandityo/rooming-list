"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Search, Users } from "lucide-react";
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

interface AssignParticipantModalProps {
  open: boolean;
  onClose: () => void;
  participants: Participant[];
  assignedIds: Set<string>;
  onAssign: (participant: Participant) => void;
}

export function AssignParticipantModal({
  open,
  onClose,
  participants,
  assignedIds,
  onAssign,
}: AssignParticipantModalProps) {
  const [search, setSearch] = useState("");

  const available = participants.filter(
    (p) =>
      !assignedIds.has(p.id) &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase())),
  );
  const nameById = new Map(participants.map((p) => [p.id, p.name]));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[480px] max-w-[480px] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-base font-bold text-[#101f34]">
            Assign a participant
          </DialogTitle>
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

        <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-200/60">
          {available.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No participants available</p>
          )}
          {available.map((p) => {
            const nonStandardDates =
              (p.checkInDate && p.checkInDate !== EVENT_CHECK_IN_DATE) ||
              (p.checkOutDate && p.checkOutDate !== EVENT_CHECK_OUT_DATE);
            const showEarly =
              p.isEarlyCheckIn && (p.checkInDate ?? EVENT_CHECK_IN_DATE) === EVENT_CHECK_IN_DATE;
            const showLate =
              p.isLateCheckOut && (p.checkOutDate ?? EVENT_CHECK_OUT_DATE) === EVENT_CHECK_OUT_DATE;
            const hasPrefs = (p.roommatePreferences?.length ?? 0) > 0;

            return (
              <button
                key={p.id}
                onClick={() => {
                  onAssign(p);
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
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
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
