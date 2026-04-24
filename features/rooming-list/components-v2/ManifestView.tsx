"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/shared/utils";
import {
  EVENT_CHECK_IN_DATE,
  EVENT_CHECK_OUT_DATE,
  EVENT_CHECK_IN_TIME,
  EVENT_CHECK_OUT_TIME,
} from "../mock/data";
import type { Building, Participant } from "../types";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

function getRoom(participantId: string, buildings: Building[]): string {
  for (const b of buildings) {
    for (const r of b.rooms) {
      for (const s of r.slots) {
        if (s.participant?.id === participantId) return r.name;
      }
    }
  }
  return "Unassigned";
}

function arrivalTiming(p: Participant): "Early" | "Normal" | "Late" {
  if (p.isEarlyCheckIn) return "Early";
  if (p.checkInDate && p.checkInDate > EVENT_CHECK_IN_DATE) return "Late";
  return "Normal";
}

function departureTiming(p: Participant): "Early" | "Normal" | "Late" {
  if (p.isLateCheckOut) return "Late";
  if (p.checkOutDate && p.checkOutDate < EVENT_CHECK_OUT_DATE) return "Early";
  return "Normal";
}

const TIMING_STYLE = {
  Early: "bg-amber-100 text-amber-700",
  Normal: "bg-gray-100 text-gray-500",
  Late: "bg-blue-100 text-blue-700",
};

// ── Inline edit form ───────────────────────────────────────────────────────────

function EditRow({
  participant,
  onSave,
  onCancel,
}: {
  participant: Participant;
  onSave: (updates: Partial<Participant>) => void;
  onCancel: () => void;
}) {
  const [checkInDate, setCheckInDate] = useState(participant.checkInDate ?? EVENT_CHECK_IN_DATE);
  const [checkOutDate, setCheckOutDate] = useState(
    participant.checkOutDate ?? EVENT_CHECK_OUT_DATE,
  );
  const [isEarlyCheckIn, setIsEarlyCheckIn] = useState(participant.isEarlyCheckIn ?? false);
  const [isLateCheckOut, setIsLateCheckOut] = useState(participant.isLateCheckOut ?? false);

  return (
    <tr className="bg-slate-50 border-b border-gray-100">
      <td colSpan={5} className="px-5 py-3">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 shrink-0">Check-in</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-slate-400"
            />
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={isEarlyCheckIn}
                onChange={(e) => setIsEarlyCheckIn(e.target.checked)}
                className="rounded accent-slate-800"
              />
              Early
            </label>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 shrink-0">Check-out</label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-slate-400"
            />
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={isLateCheckOut}
                onChange={(e) => setIsLateCheckOut(e.target.checked)}
                className="rounded accent-slate-800"
              />
              Late check-out
            </label>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onCancel}
              className="text-xs px-2.5 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <X size={12} />
            </button>
            <button
              onClick={() =>
                onSave({
                  checkInDate,
                  checkOutDate,
                  isEarlyCheckIn: isEarlyCheckIn || undefined,
                  isLateCheckOut: isLateCheckOut || undefined,
                })
              }
              className="text-xs px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <Check size={12} /> Save
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────

function ManifestSection({
  title,
  eventDate,
  eventTime,
  groups,
  buildings,
  getTiming,
  editingId,
  setEditingId,
  onUpdate,
}: {
  title: string;
  eventDate: string;
  eventTime: string;
  groups: Map<string, Participant[]>;
  buildings: Building[];
  getTiming: (p: Participant) => "Early" | "Normal" | "Late";
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<Participant>) => void;
}) {
  const total = Array.from(groups.values()).reduce((s, g) => s + g.length, 0);

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">{title}</h2>
        <span className="text-xs text-gray-400">
          Standard: {eventDate} · {eventTime}
        </span>
        <span className="ml-auto text-xs text-gray-400">
          {total} guest{total !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-400 px-5 py-2.5">Timing</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-2.5">Name</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-2.5">Date</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-2.5">Room</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-2.5 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {Array.from(groups.entries()).map(([date, participants]) => (
              <>
                {groups.size > 1 && (
                  <tr key={`header-${date}`} className="bg-gray-50/60">
                    <td
                      colSpan={5}
                      className="px-5 py-1.5 text-xs font-medium text-gray-500 border-b border-t border-gray-100"
                    >
                      {formatDate(date)}
                      <span className="ml-2 text-gray-400 font-normal">
                        {participants.length} guest{participants.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                  </tr>
                )}
                {participants.map((p) => {
                  const timing = getTiming(p);
                  const room = getRoom(p.id, buildings);
                  const isEditing = editingId === p.id;
                  return (
                    <>
                      <tr
                        key={p.id}
                        className={cn(
                          "border-b border-gray-100 last:border-0 group hover:bg-gray-50/50 transition-colors",
                          isEditing && "bg-slate-50",
                        )}
                      >
                        <td className="px-5 py-3">
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded",
                              TIMING_STYLE[timing],
                            )}
                          >
                            {timing}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-medium text-slate-800">{p.name}</span>
                          <div className="flex gap-1 mt-0.5">
                            {p.isVip && (
                              <span className="text-[9px] font-bold bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                                VIP
                              </span>
                            )}
                            {p.isAccessibility && (
                              <span className="text-[10px] text-blue-600">♿</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-500 text-xs">{formatDate(date)}</td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "text-sm",
                              room === "Unassigned" ? "text-gray-300 italic" : "text-slate-700",
                            )}
                          >
                            {room}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => setEditingId(isEditing ? null : p.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-600 transition-all"
                          >
                            <Pencil size={12} />
                          </button>
                        </td>
                      </tr>
                      {isEditing && (
                        <EditRow
                          key={`edit-${p.id}`}
                          participant={p}
                          onSave={(updates) => {
                            onUpdate(p.id, updates);
                            setEditingId(null);
                          }}
                          onCancel={() => setEditingId(null)}
                        />
                      )}
                    </>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export function ManifestView({
  participants,
  buildings,
  onUpdateParticipant,
}: {
  participants: Participant[];
  buildings: Building[];
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Group arrivals by check-in date (sorted)
  const arrivalGroups = new Map<string, Participant[]>();
  for (const p of [...participants].sort((a, b) => {
    const da = a.checkInDate ?? EVENT_CHECK_IN_DATE;
    const db = b.checkInDate ?? EVENT_CHECK_IN_DATE;
    if (da !== db) return da < db ? -1 : 1;
    // Within same date: Early first, Late last
    const ta = arrivalTiming(a);
    const tb = arrivalTiming(b);
    const order = { Early: 0, Normal: 1, Late: 2 };
    return order[ta] - order[tb];
  })) {
    const d = p.checkInDate ?? EVENT_CHECK_IN_DATE;
    if (!arrivalGroups.has(d)) arrivalGroups.set(d, []);
    arrivalGroups.get(d)!.push(p);
  }

  // Group departures by check-out date (sorted)
  const departureGroups = new Map<string, Participant[]>();
  for (const p of [...participants].sort((a, b) => {
    const da = a.checkOutDate ?? EVENT_CHECK_OUT_DATE;
    const db = b.checkOutDate ?? EVENT_CHECK_OUT_DATE;
    if (da !== db) return da < db ? -1 : 1;
    const ta = departureTiming(a);
    const tb = departureTiming(b);
    const order = { Early: 0, Normal: 1, Late: 2 };
    return order[ta] - order[tb];
  })) {
    const d = p.checkOutDate ?? EVENT_CHECK_OUT_DATE;
    if (!departureGroups.has(d)) departureGroups.set(d, []);
    departureGroups.get(d)!.push(p);
  }

  const earlyCheckIns = participants.filter((p) => p.isEarlyCheckIn).length;
  const lateCheckOuts = participants.filter((p) => p.isLateCheckOut).length;
  const earlyDepartures = participants.filter(
    (p) => p.checkOutDate && p.checkOutDate < EVENT_CHECK_OUT_DATE,
  ).length;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-8">
      {/* Summary bar */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Participants</span>
          <span className="font-semibold text-slate-800">{participants.length}</span>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Early check-ins</span>
          <span className="font-semibold text-amber-600">{earlyCheckIns}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Late check-outs</span>
          <span className="font-semibold text-blue-600">{lateCheckOuts}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Early departures</span>
          <span className="font-semibold text-slate-600">{earlyDepartures}</span>
        </div>
        <p className="ml-auto text-xs text-gray-400 italic">
          Hover a row and click ✎ to edit dates
        </p>
      </div>

      {/* Arrivals */}
      <ManifestSection
        title="Arrivals"
        eventDate={formatDate(EVENT_CHECK_IN_DATE)}
        eventTime={EVENT_CHECK_IN_TIME}
        groups={arrivalGroups}
        buildings={buildings}
        getTiming={arrivalTiming}
        editingId={editingId}
        setEditingId={setEditingId}
        onUpdate={onUpdateParticipant}
      />

      {/* Departures */}
      <ManifestSection
        title="Departures"
        eventDate={formatDate(EVENT_CHECK_OUT_DATE)}
        eventTime={EVENT_CHECK_OUT_TIME}
        groups={departureGroups}
        buildings={buildings}
        getTiming={departureTiming}
        editingId={editingId}
        setEditingId={setEditingId}
        onUpdate={onUpdateParticipant}
      />
    </div>
  );
}
