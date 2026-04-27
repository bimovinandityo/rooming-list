"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Shuffle, RotateCcw, X, Search } from "lucide-react";
import { RoomListView } from "./RoomListView";
import { ParticipantDrawer } from "./ParticipantDrawer";
import { AssignParticipantModal } from "./AssignParticipantModal";
import {
  mockBuildings,
  mockParticipants,
  EVENT_CHECK_IN_DATE,
  EVENT_CHECK_OUT_DATE,
} from "../mock/data";
import { cn } from "@/shared/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { useRoomingList } from "../context/RoomingListContext";
import type { Building, Participant } from "../types";

export function GestionDesChambres({ hideTitle = false }: { hideTitle?: boolean }) {
  const { publishedBuildings, publishedAt } = useRoomingList();

  const [buildings, setBuildings] = useState<Building[]>(() => publishedBuildings ?? mockBuildings);
  const participants = mockParticipants;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingSource, setDraggingSource] = useState<{ roomId: string; slotId: string } | null>(
    null,
  );
  const [targetSlot, setTargetSlot] = useState<{ roomId: string; slotId: string } | null>(null);
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
  const [showBuilderBanner, setShowBuilderBanner] = useState(true);
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);
  const [roomFilter, setRoomFilter] = useState<"all" | "incomplete" | "full">("all");
  const [roomSearch, setRoomSearch] = useState("");
  const [rules, setRules] = useState({
    noGenderMix: true,
    vipAlone: true,
    accessibilityFirstFloor: true,
    includeEarlyCiLateCo: false,
    includeIrregularDates: false,
    respectRoommatePrefs: true,
  });

  // ── Derived ──────────────────────────────────────────────────────────────────
  const assignedIds = new Set(
    buildings
      .flatMap((b) => b.rooms)
      .flatMap((r) => r.slots)
      .map((s) => s.participant?.id)
      .filter(Boolean) as string[],
  );

  const draggingParticipant = draggingId
    ? (participants.find((p) => p.id === draggingId) ?? null)
    : null;

  const allRooms = buildings.flatMap((b) => b.rooms);
  const unassignedCount = participants.length - assignedIds.size;

  const incompleteCount = allRooms.filter((r) => r.slots.some((s) => !s.participant)).length;
  const fullCount = allRooms.filter((r) => r.slots.every((s) => s.participant)).length;

  const searchTerm = roomSearch.trim().toLowerCase();

  const filteredBuildings = buildings
    .map((b) => ({
      ...b,
      rooms: b.rooms.filter((r) => {
        if (roomFilter === "incomplete" && !r.slots.some((s) => !s.participant)) return false;
        if (roomFilter === "full" && !r.slots.every((s) => s.participant)) return false;
        return true;
      }),
    }))
    .filter((b) => b.rooms.length > 0);

  // ── Actions ───────────────────────────────────────────────────────────────────
  const assignToSlot = useCallback((roomId: string, slotId: string, participant: Participant) => {
    setBuildings((prev) =>
      prev.map((b) => ({
        ...b,
        rooms: b.rooms.map((r) => {
          if (r.id !== roomId) return r;
          return {
            ...r,
            slots: r.slots.map((s) => (s.id === slotId ? { ...s, participant } : s)),
          };
        }),
      })),
    );
  }, []);

  function handleRemove(roomId: string, slotId: string) {
    setBuildings((prev) =>
      prev.map((b) => ({
        ...b,
        rooms: b.rooms.map((r) => {
          if (r.id !== roomId) return r;
          return {
            ...r,
            slots: r.slots.map((s) => (s.id === slotId ? { ...s, participant: undefined } : s)),
          };
        }),
      })),
    );
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDraggingSource(null);
  }

  function handleChipDragStart(participantId: string, roomId: string, slotId: string) {
    setDraggingId(participantId);
    setDraggingSource({ roomId, slotId });
  }

  function handleDrop(roomId: string, slotId: string) {
    if (!draggingParticipant) return;

    if (draggingSource) {
      // Room-to-room move — remove from source, place in target
      if (draggingSource.roomId === roomId && draggingSource.slotId === slotId) {
        handleDragEnd();
        return;
      }
      setBuildings((prev) =>
        prev.map((b) => ({
          ...b,
          rooms: b.rooms.map((r) => {
            if (r.id === draggingSource.roomId) {
              return {
                ...r,
                slots: r.slots.map((s) =>
                  s.id === draggingSource.slotId ? { ...s, participant: undefined } : s,
                ),
              };
            }
            if (r.id === roomId) {
              return {
                ...r,
                slots: r.slots.map((s) =>
                  s.id === slotId ? { ...s, participant: draggingParticipant } : s,
                ),
              };
            }
            return r;
          }),
        })),
      );
      const targetRoom = allRooms.find((r) => r.id === roomId);
      toast.success(`${draggingParticipant.name} → ${targetRoom?.name ?? "room"}`, {
        duration: 2000,
      });
    } else {
      // Drawer → room
      if (assignedIds.has(draggingParticipant.id)) {
        handleDragEnd();
        return;
      }
      assignToSlot(roomId, slotId, draggingParticipant);
      toast.success(`${draggingParticipant.name} assigned`, { duration: 2000 });
    }

    handleDragEnd();
  }

  function handleSlotClick(roomId: string, slotId: string) {
    setTargetSlot({ roomId, slotId });
  }

  function handleModalAssign(participant: Participant) {
    if (!targetSlot) return;
    assignToSlot(targetSlot.roomId, targetSlot.slotId, participant);
    const room = allRooms.find((r) => r.id === targetSlot.roomId);
    toast.success(`${participant.name} → ${room?.name ?? "room"}`, { duration: 2000 });
    setTargetSlot(null);
  }

  function handleStartOver() {
    if (assignedIds.size === 0) {
      toast.info("No assignments to clear");
      return;
    }
    setShowStartOverConfirm(true);
  }

  function handleConfirmStartOver() {
    const snapshot = buildings;
    setBuildings((prev) =>
      prev.map((b) => ({
        ...b,
        rooms: b.rooms.map((r) => ({
          ...r,
          slots: r.slots.map((s) => ({ ...s, participant: undefined })),
        })),
      })),
    );
    setShowStartOverConfirm(false);
    toast.success("All assignments cleared", {
      action: { label: "Undo", onClick: () => setBuildings(snapshot) },
      duration: 5000,
    });
  }

  function handleAutoAssign() {
    const allUnassigned = participants.filter((p) => !assignedIds.has(p.id));
    if (!allUnassigned.length) {
      toast.info("All participants are already assigned");
      return;
    }
    const snapshot = buildings;

    function hasEarlyCiLateCo(p: Participant) {
      const onStandardIn = (p.checkInDate ?? EVENT_CHECK_IN_DATE) === EVENT_CHECK_IN_DATE;
      const onStandardOut = (p.checkOutDate ?? EVENT_CHECK_OUT_DATE) === EVENT_CHECK_OUT_DATE;
      return (p.isEarlyCheckIn && onStandardIn) || (p.isLateCheckOut && onStandardOut);
    }

    function hasIrregularDates(p: Participant) {
      return (
        (p.checkInDate && p.checkInDate !== EVENT_CHECK_IN_DATE) ||
        (p.checkOutDate && p.checkOutDate !== EVENT_CHECK_OUT_DATE)
      );
    }

    let skippedIrregular = 0;
    let skippedEarlyLate = 0;
    const unassigned = allUnassigned.filter((p) => {
      // Irregular dates wins over early/late if both apply (a person with non-standard dates
      // is by definition not "early on day 1" — they arrive on day 2 etc.)
      if (!rules.includeIrregularDates && hasIrregularDates(p)) {
        skippedIrregular++;
        return false;
      }
      if (!rules.includeEarlyCiLateCo && hasEarlyCiLateCo(p)) {
        skippedEarlyLate++;
        return false;
      }
      return true;
    });

    const skippedByFilter = skippedIrregular + skippedEarlyLate;

    // Sort: accessibility first, then VIP, then participants with prefs (so anchors land early), then regular
    const sorted = [...unassigned].sort((a, b) => {
      if (a.isAccessibility && !b.isAccessibility) return -1;
      if (!a.isAccessibility && b.isAccessibility) return 1;
      if (a.isVip && !b.isVip) return -1;
      if (!a.isVip && b.isVip) return 1;
      const aHasPrefs = (a.roommatePreferences?.length ?? 0) > 0;
      const bHasPrefs = (b.roommatePreferences?.length ?? 0) > 0;
      if (aHasPrefs && !bHasPrefs) return -1;
      if (!aHasPrefs && bHasPrefs) return 1;
      return 0;
    });

    const next = structuredClone(buildings) as Building[];
    let placed = 0;
    let skipped = 0;
    const placedIds = new Set<string>();
    const byId = new Map(unassigned.map((p) => [p.id, p]));
    {
      // Build mutual-pref clusters: if A prefers B and B prefers A, they form a group.
      // We use union-find on mutual edges only (one-way prefs are too weak to force grouping).
      function buildCluster(seedId: string): Participant[] {
        const cluster: Participant[] = [];
        const queue: string[] = [seedId];
        const seen = new Set<string>();
        while (queue.length) {
          const id = queue.shift()!;
          if (seen.has(id)) continue;
          seen.add(id);
          const person = byId.get(id);
          if (!person || placedIds.has(id)) continue;
          cluster.push(person);
          for (const prefId of person.roommatePreferences ?? []) {
            const other = byId.get(prefId);
            if (!other || placedIds.has(prefId) || seen.has(prefId)) continue;
            // Mutual check
            if (other.roommatePreferences?.includes(id)) queue.push(prefId);
          }
        }
        return cluster;
      }

      function fitsInRoom(group: Participant[], r: Building["rooms"][0]): boolean {
        const free = r.slots.filter((s) => !s.participant).length;
        if (free < group.length) return false;

        const occupants = r.slots.map((s) => s.participant).filter(Boolean) as Participant[];

        // VIP rule: all-or-nothing. If any group member is VIP and !r.vipOnly, fail. If !VIP and r.vipOnly, fail.
        if (rules.vipAlone) {
          for (const g of group) {
            if (g.isVip && !r.vipOnly) return false;
            if (!g.isVip && r.vipOnly) return false;
          }
        }

        // Gender rule: all group members + occupants must share a gender (if any have one)
        if (rules.noGenderMix) {
          const allGenders = [...occupants, ...group].map((o) => o.gender).filter(Boolean);
          const unique = new Set(allGenders);
          if (unique.size > 1) return false;
        }

        return true;
      }

      function scoreRoom(group: Participant[], r: Building["rooms"][0]): number {
        const occupants = r.slots.map((s) => s.participant).filter(Boolean) as Participant[];
        let score = 0;
        const hasAccessibility = group.some((g) => g.isAccessibility);
        if (rules.accessibilityFirstFloor && hasAccessibility) {
          score += r.floor === 1 ? -100 : 50;
        }
        if (group.some((g) => g.isVip) && r.vipOnly) score -= 20;
        if (occupants.length > 0) score -= 5;
        // Prefer rooms that already contain any preferred roommate of any group member
        if (rules.respectRoommatePrefs) {
          for (const g of group) {
            const matches = occupants.filter((o) => g.roommatePreferences?.includes(o.id)).length;
            if (matches > 0) score -= 40 * matches;
          }
        }
        // Prefer rooms whose free-slot count matches group size exactly (snug fit)
        const free = r.slots.filter((s) => !s.participant).length;
        if (free === group.length) score -= 8;
        return score;
      }

      function placeGroup(group: Participant[]): boolean {
        type RoomRef = { room: Building["rooms"][0]; score: number };
        const candidates: RoomRef[] = [];
        for (const b of next) {
          for (const r of b.rooms) {
            if (!fitsInRoom(group, r)) continue;
            candidates.push({ room: r, score: scoreRoom(group, r) });
          }
        }
        if (!candidates.length) return false;
        candidates.sort((a, b) => a.score - b.score);
        const room = candidates[0].room;
        for (const g of group) {
          const slot = room.slots.find((s) => !s.participant)!;
          slot.participant = g;
          placedIds.add(g.id);
          placed++;
        }
        return true;
      }

      for (const p of sorted) {
        if (placedIds.has(p.id)) continue;

        // Try to place the entire mutual cluster together first
        if (rules.respectRoommatePrefs && p.roommatePreferences?.length) {
          const cluster = buildCluster(p.id);
          if (cluster.length >= 2) {
            // Try the full cluster first; fall back to smaller groups if it doesn't fit anywhere
            for (let size = cluster.length; size >= 2; size--) {
              const group = cluster.slice(0, size);
              if (placeGroup(group)) {
                break;
              }
              if (size === 2) {
                // Couldn't even place the seed pair — fall through to single placement
              }
            }
            if (placedIds.has(p.id)) continue;
          }
        }

        // Single placement fallback
        if (!placeGroup([p])) {
          skipped++;
        }
      }

      // Count unmet roommate preferences (placed participants whose room has none of their prefs)
      let unmetPrefs = 0;
      if (rules.respectRoommatePrefs) {
        const finalAssignments = new Map<string, string>();
        for (const b of next) {
          for (const r of b.rooms) {
            for (const s of r.slots) {
              if (s.participant) finalAssignments.set(s.participant.id, r.id);
            }
          }
        }
        for (const p of sorted) {
          if (!p.roommatePreferences?.length) continue;
          const myRoom = finalAssignments.get(p.id);
          if (!myRoom) continue;
          const anyMet = p.roommatePreferences.some(
            (prefId) => finalAssignments.get(prefId) === myRoom,
          );
          if (!anyMet) unmetPrefs++;
        }
      }

      const parts: string[] = [];
      if (skippedByFilter > 0) {
        const reasons: string[] = [];
        if (skippedIrregular > 0) reasons.push("irregular dates");
        if (skippedEarlyLate > 0) reasons.push("early CI / late CO");
        parts.push(`${skippedByFilter} skipped (${reasons.join(", ")})`);
      }
      if (unmetPrefs > 0)
        parts.push(`${unmetPrefs} roommate preference${unmetPrefs !== 1 ? "s" : ""} unmet`);
      const suffix = parts.length ? ` · ${parts.join(" · ")}` : "";

      if (skipped > 0) {
        toast.warning(
          `${placed} assigned · ${skipped} couldn't be placed (rule conflicts)${suffix}`,
          {
            action: { label: "Undo", onClick: () => setBuildings(snapshot) },
            duration: 6000,
          },
        );
      } else {
        toast.success(`${placed} participant${placed !== 1 ? "s" : ""} assigned${suffix}`, {
          action: { label: "Undo", onClick: () => setBuildings(snapshot) },
          duration: 5000,
        });
      }
    }

    setBuildings(next);
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
        {!hideTitle && (
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-800">Rooming list</h1>
            <span className="text-sm text-gray-400">· {allRooms.length} rooms</span>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleStartOver}
            className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-md px-4 py-2 text-gray-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            <RotateCcw size={13} />
            Start over
          </button>
          <button
            onClick={() => setShowAutoAssignModal(true)}
            className="flex items-center gap-1.5 text-sm bg-[#e8f747] text-gray-900 font-medium rounded-md px-4 py-2 hover:bg-[#ddf03f] transition-colors"
          >
            <Shuffle size={13} />
            Auto-assign
          </button>
        </div>
      </div>

      {/* Builder source banner */}
      {publishedBuildings && publishedAt && showBuilderBanner && (
        <div className="flex items-center justify-between px-6 py-2 bg-blue-50 border-b border-blue-100">
          <span className="text-xs text-blue-600">
            Rooms configured via Rooming list builder · Published at{" "}
            {publishedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <div className="flex items-center gap-3">
            <a
              href="/rooming-list-builder"
              className="text-xs text-blue-600 font-medium hover:text-blue-800 underline underline-offset-2"
            >
              Edit configuration
            </a>
            <button
              onClick={() => setShowBuilderBanner(false)}
              className="text-blue-400 hover:text-blue-700 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      <>
        {/* Tabs row */}
        <div className="flex items-end px-6 border-b border-gray-100">
          {(["all", "incomplete", "full"] as const).map((f) => {
            const label = f === "all" ? "All" : f === "incomplete" ? "Incomplete" : "Full";
            const count =
              f === "all" ? allRooms.length : f === "incomplete" ? incompleteCount : fullCount;
            return (
              <button
                key={f}
                onClick={() => setRoomFilter(f)}
                className={cn(
                  "text-sm py-3 mr-6 -mb-px border-b-2 transition-colors",
                  roomFilter === f
                    ? "border-gray-900 text-gray-900 font-medium"
                    : "border-transparent text-gray-500 hover:text-gray-800",
                )}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search + status row */}
        <div className="flex items-center px-6 py-3 border-b border-gray-100 gap-3">
          <div className="relative w-[280px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              placeholder="Rechercher un participant…"
              className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-8 py-2 outline-none focus:border-gray-400 transition-colors"
            />
            {roomSearch && (
              <button
                onClick={() => setRoomSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="ml-auto flex items-center">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md",
                unassignedCount === 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
              )}
            >
              {unassignedCount === 0 ? "✓ All assigned" : `✗ ${unassignedCount} unassigned`}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 min-h-0 bg-gray-50">
          <RoomListView
            buildings={filteredBuildings}
            draggingParticipant={draggingParticipant}
            selectedNight={null}
            participantsById={new Map(participants.map((p) => [p.id, p]))}
            searchTerm={searchTerm}
            onRemove={handleRemove}
            onSlotClick={handleSlotClick}
            onDrop={handleDrop}
            onChipDragStart={handleChipDragStart}
            onDragEnd={handleDragEnd}
          />

          <ParticipantDrawer
            participants={participants}
            assignedIds={assignedIds}
            draggingId={draggingId}
            isRoomChipDragging={draggingSource !== null}
            onDragStart={setDraggingId}
            onDragEnd={handleDragEnd}
            onUnassignDrop={() => {
              if (!draggingSource) return;
              handleRemove(draggingSource.roomId, draggingSource.slotId);
              handleDragEnd();
            }}
          />
        </div>
      </>

      <AssignParticipantModal
        open={!!targetSlot}
        onClose={() => setTargetSlot(null)}
        participants={participants}
        assignedIds={assignedIds}
        onAssign={handleModalAssign}
      />

      {/* Auto-assign modal */}
      <Dialog open={showAutoAssignModal} onOpenChange={(v) => !v && setShowAutoAssignModal(false)}>
        <DialogContent className="w-[420px] max-w-[420px] p-0 gap-0">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
            <DialogTitle className="text-base font-bold text-slate-800">Auto-assign</DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4 flex flex-col gap-1">
            <p className="text-sm text-gray-500 mb-3">
              Select the rules to apply when assigning participants to rooms.
            </p>
            {[
              {
                key: "noGenderMix" as const,
                label: "No gender mixing",
                description: "Participants in the same room must be the same gender.",
              },
              {
                key: "vipAlone" as const,
                label: "VIP in premium rooms only",
                description:
                  "VIP participants are placed in VIP-only rooms. Non-VIPs are excluded from those rooms.",
              },
              {
                key: "accessibilityFirstFloor" as const,
                label: "PMR → floor 1",
                description: "PMR participants are assigned to ground-floor rooms first.",
              },
              {
                key: "respectRoommatePrefs" as const,
                label: "Respect roommate preferences",
                description:
                  "Prefer rooms that already contain a participant's requested roommate. Soft preference — other rules still win.",
              },
              {
                key: "includeEarlyCiLateCo" as const,
                label: "Include early CI / late CO",
                description:
                  "Include participants with early check-in or late check-out time requests.",
              },
              {
                key: "includeIrregularDates" as const,
                label: "Include irregular dates",
                description:
                  "Include participants whose check-in or check-out date differs from the event dates.",
              },
            ].map(({ key, label, description }) => (
              <label
                key={key}
                className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 cursor-pointer select-none group"
              >
                <input
                  type="checkbox"
                  checked={rules[key]}
                  onChange={(e) => setRules((r) => ({ ...r, [key]: e.target.checked }))}
                  className="mt-0.5 rounded accent-slate-800 shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <button
              onClick={() => setShowAutoAssignModal(false)}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowAutoAssignModal(false);
                handleAutoAssign();
              }}
              className="flex items-center gap-1.5 text-sm px-4 py-1.5 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
            >
              <Shuffle size={13} />
              Assign
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showStartOverConfirm}
        onOpenChange={(v) => !v && setShowStartOverConfirm(false)}
      >
        <DialogContent className="w-[400px] max-w-[400px] p-0 gap-0">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
            <DialogTitle className="text-base font-bold text-slate-800">Start over?</DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-500">
              This will clear all {assignedIds.size} assignment{assignedIds.size !== 1 ? "s" : ""}.
              You can undo right after.
            </p>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <button
              onClick={() => setShowStartOverConfirm(false)}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmStartOver}
              className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Clear all
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
