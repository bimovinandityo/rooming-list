"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Upload, Plus, Shuffle } from "lucide-react";
import { RoomListView } from "./RoomListView";
import { ParticipantDrawer } from "./ParticipantDrawer";
import { AssignParticipantModal } from "./AssignParticipantModal";
import { mockBuildings, mockParticipants } from "../mock/data";
import { cn } from "@/shared/utils";
import type { Building, Participant } from "../types";

type RoomFilter = "all" | "empty" | "partial" | "full";

const FILTERS: { key: RoomFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "empty", label: "Vides" },
  { key: "partial", label: "Incomplètes" },
  { key: "full", label: "Complètes" },
];

export function GestionDesChambres() {
  const [buildings, setBuildings] = useState<Building[]>(mockBuildings);
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
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
      if (roomFilter === "empty") return filled === 0;
      if (roomFilter === "partial") return filled > 0 && filled < total;
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

  function handleDrop(roomId: string, slotId: string) {
    if (!draggingParticipant || assignedIds.has(draggingParticipant.id)) return;
    assignToSlot(roomId, slotId, draggingParticipant);
    toast.success(`${draggingParticipant.name} assigné(e)`, { duration: 2000 });
    setDraggingId(null);
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
    toast.error("Aucun lit disponible");
  }

  function handleModalAssign(participant: Participant) {
    if (!targetSlot) return;
    assignToSlot(targetSlot.roomId, targetSlot.slotId, participant);
    const room = allRooms.find((r) => r.id === targetSlot.roomId);
    toast.success(`${participant.name} → ${room?.name ?? "chambre"}`, { duration: 2000 });
    setTargetSlot(null);
  }

  function handleAutoAssign() {
    const unassigned = participants.filter((p) => !assignedIds.has(p.id));
    if (!unassigned.length) {
      toast.info("Tous les participants sont déjà assignés");
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
    toast.success(`${unassigned.length} participant(s) assigné(s) aléatoirement`, {
      action: { label: "Annuler", onClick: () => setBuildings(snapshot) },
      duration: 5000,
    });
  }

  function handleMarkLate(id: string) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isLateArrival: !p.isLateArrival } : p)),
    );
  }

  function handleAddLateArrival(name: string, isVip: boolean, isPmr: boolean) {
    const newP: Participant = {
      id: `p-late-${Date.now()}`,
      name,
      isVip: isVip || undefined,
      isPmr: isPmr || undefined,
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
                  name: "Nouvelle chambre",
                  bedDescription: "1 lit simple",
                  privateBathroom: false,
                  slots: [{ id: `s-${ts}` }],
                },
              ],
            },
      ),
    );
    toast.success(`Chambre ajoutée dans ${building?.name ?? "le bâtiment"}`);
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold text-slate-800">Rooming list</h1>
          <span className="text-sm text-gray-400">· {allRooms.length} chambres</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">
            <Upload size={13} />
            Importer
          </button>
          <button className="flex items-center gap-1.5 text-sm border border-slate-800 rounded-md px-3 py-1.5 text-slate-800 hover:bg-slate-50 transition-colors">
            <Plus size={13} />
            Ajouter une chambre
          </button>
          <button
            onClick={handleAutoAssign}
            className="flex items-center gap-1.5 text-sm bg-slate-800 text-white rounded-md px-3 py-1.5 hover:bg-slate-700 transition-colors"
          >
            <Shuffle size={13} />
            Assigner aléatoirement
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

        <button
          onClick={() => setDrawerOpen((o) => !o)}
          className={cn(
            "flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border transition-colors",
            unassignedCount === 0
              ? "border-green-200 bg-green-50 text-green-700"
              : drawerOpen
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              unassignedCount === 0 ? "bg-green-500" : "bg-red-500",
            )}
          />
          {unassignedCount === 0
            ? "Tous assignés ✓"
            : `${unassignedCount} non assigné${unassignedCount !== 1 ? "s" : ""}`}
          {unassignedCount > 0 && (
            <span className="text-current opacity-50">{drawerOpen ? "×" : "→"}</span>
          )}
        </button>
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
        />

        <ParticipantDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          participants={participants}
          assignedIds={assignedIds}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDragEnd={() => setDraggingId(null)}
          onAssign={handleDrawerAssign}
          onMarkLate={handleMarkLate}
          onAddLateArrival={handleAddLateArrival}
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
