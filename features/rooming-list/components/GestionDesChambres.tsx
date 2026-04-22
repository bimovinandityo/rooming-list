"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Upload, Plus, Shuffle, RotateCcw } from "lucide-react";
import { RoomListView } from "./RoomListView";
import { ParticipantDrawer } from "./ParticipantDrawer";
import { AssignParticipantModal } from "./AssignParticipantModal";
import { mockBuildings, mockParticipants } from "../mock/data";
import { cn } from "@/shared/utils";
import type { Building, Participant } from "../types";

type RoomFilter = "all" | "incomplete" | "full";

const FILTERS: { key: RoomFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "incomplete", label: "Incomplete" },
  { key: "full", label: "Full" },
];

export function GestionDesChambres() {
  const [buildings, setBuildings] = useState<Building[]>(mockBuildings);
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingSource, setDraggingSource] = useState<{ roomId: string; slotId: string } | null>(
    null,
  );
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("all");
  const [targetSlot, setTargetSlot] = useState<{ roomId: string; slotId: string } | null>(null);

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

  const filteredBuildings = buildings.map((b) => ({
    ...b,
    rooms: b.rooms.filter((r) => {
      const filled = r.slots.filter((s) => s.participant).length;
      const total = r.slots.length;
      if (roomFilter === "incomplete") return filled < total;
      if (roomFilter === "full") return filled === total;
      return true;
    }),
  }));

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
      toast.success(`${draggingParticipant.name} → ${targetRoom?.name ?? "chambre"}`, {
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

  function handleDrawerAssign(participant: Participant) {
    for (const building of buildings) {
      for (const room of building.rooms) {
        const empty = room.slots.find((s) => !s.participant);
        if (empty) {
          assignToSlot(room.id, empty.id, participant);
          toast.success(`${participant.name} → ${room.name}`, { duration: 2000 });
          return;
        }
      }
    }
    toast.error("No beds available");
  }

  function handleModalAssign(participant: Participant) {
    if (!targetSlot) return;
    assignToSlot(targetSlot.roomId, targetSlot.slotId, participant);
    const room = allRooms.find((r) => r.id === targetSlot.roomId);
    toast.success(`${participant.name} → ${room?.name ?? "chambre"}`, { duration: 2000 });
    setTargetSlot(null);
  }

  function handleStartOver() {
    if (assignedIds.size === 0) {
      toast.info("No assignments to clear");
      return;
    }
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
    toast.success("All assignments cleared", {
      action: { label: "Undo", onClick: () => setBuildings(snapshot) },
      duration: 5000,
    });
  }

  function handleAutoAssign() {
    const unassigned = participants.filter((p) => !assignedIds.has(p.id));
    if (!unassigned.length) {
      toast.info("All participants are already assigned");
      return;
    }
    const snapshot = buildings;
    setBuildings((prev) => {
      const next = structuredClone(prev);
      for (const p of unassigned) {
        outer: for (const b of next) {
          for (const r of b.rooms) {
            const slot = r.slots.find((s) => !s.participant);
            if (slot) {
              slot.participant = p;
              break outer;
            }
          }
        }
      }
      return next;
    });
    toast.success(`${unassigned.length} participant(s) auto-assigned`, {
      action: { label: "Undo", onClick: () => setBuildings(snapshot) },
      duration: 5000,
    });
  }

  function handleMarkLate(id: string) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isLateArrival: !p.isLateArrival } : p)),
    );
  }

  function handleAddLateArrival(name: string, isVip: boolean, isAccessibility: boolean) {
    const newP: Participant = {
      id: `p-late-${Date.now()}`,
      name,
      isVip: isVip || undefined,
      isAccessibility: isAccessibility || undefined,
      isLateArrival: true,
    };
    setParticipants((prev) => [...prev, newP]);
  }

  function handleAddRoom(buildingId: string) {
    const ts = Date.now();
    const building = buildings.find((b) => b.id === buildingId);
    setBuildings((prev) =>
      prev.map((b) =>
        b.id !== buildingId
          ? b
          : {
              ...b,
              rooms: [
                ...b.rooms,
                {
                  id: `r-${ts}`,
                  name: "New room",
                  bedDescription: "1 single bed",
                  privateBathroom: false,
                  slots: [{ id: `s-${ts}` }],
                },
              ],
            },
      ),
    );
    toast.success(`Room added to ${building?.name ?? "building"}`);
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold text-slate-800">Rooming list</h1>
          <span className="text-sm text-gray-400">· {allRooms.length} rooms</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartOver}
            className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            <RotateCcw size={13} />
            Start over
          </button>
          <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">
            <Upload size={13} />
            Import
          </button>
          <button className="flex items-center gap-1.5 text-sm border border-slate-800 rounded-md px-3 py-1.5 text-slate-800 hover:bg-slate-50 transition-colors">
            <Plus size={13} />
            Add room
          </button>
          <button
            onClick={handleAutoAssign}
            className="flex items-center gap-1.5 text-sm bg-slate-800 text-white rounded-md px-3 py-1.5 hover:bg-slate-700 transition-colors"
          >
            <Shuffle size={13} />
            Auto-assign
          </button>
        </div>
      </div>

      {/* Filter + stats row */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100">
        <div className="flex items-center gap-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setRoomFilter(f.key)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full font-medium transition-colors",
                roomFilter === f.key
                  ? "bg-slate-800 text-white"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border",
            unassignedCount === 0
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-gray-200 bg-white text-gray-600",
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              unassignedCount === 0 ? "bg-green-500" : "bg-red-500",
            )}
          />
          {unassignedCount === 0 ? "All assigned ✓" : `${unassignedCount} unassigned`}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 bg-gray-50">
        <RoomListView
          buildings={filteredBuildings}
          draggingParticipant={draggingParticipant}
          onRemove={handleRemove}
          onSlotClick={handleSlotClick}
          onDrop={handleDrop}
          onAddRoom={handleAddRoom}
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
          onAssign={handleDrawerAssign}
          onMarkLate={handleMarkLate}
          onAddLateArrival={handleAddLateArrival}
          onUnassignDrop={() => {
            if (!draggingSource) return;
            handleRemove(draggingSource.roomId, draggingSource.slotId);
            handleDragEnd();
          }}
        />
      </div>

      <AssignParticipantModal
        open={!!targetSlot}
        onClose={() => setTargetSlot(null)}
        participants={participants}
        assignedIds={assignedIds}
        onAssign={handleModalAssign}
      />
    </div>
  );
}
