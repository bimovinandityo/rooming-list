"use client";

import { useState } from "react";
import { BedDouble, Bath, X } from "lucide-react";

import { useRoomingList } from "../context/RoomingListContext";
import { mockBuildingsAssigned } from "../mock/data";
import { cn } from "@/shared/utils";
import type { Building } from "../types";

// ── Participant room row ────────────────────────────────────────────────────────

function ParticipantRoomRow({
  room,
  myRoomId,
  onChoose,
  onLeave,
}: {
  room: Building["rooms"][number];
  myRoomId: string | null;
  onChoose: () => void;
  onLeave: () => void;
}) {
  const isMyRoom = room.id === myRoomId;
  const isFull = room.slots.every((s) => s.participant) && !isMyRoom;
  const assignedSlots = room.slots.filter((s) => s.participant);

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0 transition-colors border-l-2",
        isMyRoom ? "border-l-emerald-400 bg-emerald-50/30" : "border-l-transparent",
      )}
    >
      {/* Photo thumbnail */}
      <div className="w-20 h-14 rounded-md overflow-hidden shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
        {room.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={room.photoUrl} alt={room.name} className="w-full h-full object-cover" />
        ) : (
          <BedDouble size={18} className="text-gray-300" />
        )}
      </div>

      {/* Room name + details (combined, no separate column) */}
      <div className="w-56 shrink-0">
        <div className="text-sm font-medium text-slate-800">{room.name}</div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-400">{room.bedDescription}</span>
          {room.privateBathroom && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              <Bath size={10} />
              Private bathroom
            </span>
          )}
        </div>
      </div>

      {/* Occupant chips + inline "you" */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0 py-1">
        {assignedSlots.map((slot) => (
          <div
            key={slot.id}
            className="flex items-center bg-gray-100 border border-gray-200 rounded px-2.5 py-1 text-sm text-slate-700 select-none"
          >
            {slot.participant!.name}
          </div>
        ))}
        {isMyRoom && (
          <div className="group flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded px-2.5 py-1 text-sm text-slate-700 select-none">
            Capucine Getten
            <button
              onClick={onLeave}
              className="ml-0.5 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={11} />
            </button>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="shrink-0 w-36 flex justify-end">
        {isMyRoom ? (
          <button
            onClick={onLeave}
            className="text-sm font-medium text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-md px-3 py-1.5 hover:bg-emerald-200 transition-colors"
          >
            Your room
          </button>
        ) : isFull ? (
          <span className="text-xs text-gray-300 font-medium">Full</span>
        ) : (
          <button
            onClick={onChoose}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Choose this room
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────

export function ParticipantRoomingView() {
  const { publishedBuildings } = useRoomingList();
  const buildings = publishedBuildings ?? mockBuildingsAssigned;

  const [myRoomId, setMyRoomId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Room list ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-6 flex flex-col gap-6">
          {buildings.map((building) => (
            <div key={building.id}>
              {/* Plain section label */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {building.name}
              </p>

              {/* Room rows */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {building.rooms.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    No available rooms in this building.
                  </div>
                ) : (
                  building.rooms.map((room) => (
                    <ParticipantRoomRow
                      key={room.id}
                      room={room}
                      myRoomId={myRoomId}
                      onChoose={() => setMyRoomId(room.id)}
                      onLeave={() => setMyRoomId(null)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
