"use client";

import { useState, useMemo, Fragment } from "react";
import { Pencil, Check, X, UserPlus, Search, Download, Star, Accessibility } from "lucide-react";
import { cn } from "@/shared/utils";
import { EVENT_CHECK_IN_DATE, EVENT_CHECK_OUT_DATE } from "../mock/data";
import type { Building, Participant } from "../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

// Two-tone Naboo palette: neutral gray + brand yellow
const AVATAR_COLORS = [
  { bg: "bg-gray-200", text: "text-gray-700" },
  { bg: "bg-[#EAEF9E]", text: "text-[#5C6200]" },
  { bg: "bg-stone-200", text: "text-stone-700" },
  { bg: "bg-[#EAEF9E]", text: "text-[#5C6200]" },
  { bg: "bg-zinc-200", text: "text-zinc-700" },
  { bg: "bg-[#EAEF9E]", text: "text-[#5C6200]" },
];

function avatarStyle(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function shortDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getAssignedRoom(id: string, buildings: Building[]): string | null {
  for (const b of buildings) {
    for (const r of b.rooms) {
      for (const s of r.slots) {
        if (s.participant?.id === id) return r.name;
      }
    }
  }
  return null;
}

// ── Inline edit row ───────────────────────────────────────────────────────────

function EditRow({
  participant,
  onSave,
  onCancel,
}: {
  participant: Participant;
  onSave: (updates: Partial<Participant>) => void;
  onCancel: () => void;
}) {
  const [gender, setGender] = useState<"M" | "F" | "">(participant.gender ?? "");
  const [checkInDate, setCheckInDate] = useState(participant.checkInDate ?? EVENT_CHECK_IN_DATE);
  const [checkOutDate, setCheckOutDate] = useState(
    participant.checkOutDate ?? EVENT_CHECK_OUT_DATE,
  );
  const [isEarlyCheckIn, setIsEarlyCheckIn] = useState(participant.isEarlyCheckIn ?? false);
  const [isLateCheckOut, setIsLateCheckOut] = useState(participant.isLateCheckOut ?? false);
  const [roomPreference, setRoomPreference] = useState(participant.roomPreference ?? "");

  return (
    <tr className="bg-gray-50 border-b border-gray-100">
      <td colSpan={8} className="px-6 py-4">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-400">Gender</span>
            <div className="flex gap-1">
              {(["M", "F"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(gender === g ? "" : g)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors",
                    gender === g
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-400",
                  )}
                >
                  {g === "M" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-400">Check-in</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-gray-400"
              />
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isEarlyCheckIn}
                  onChange={(e) => setIsEarlyCheckIn(e.target.checked)}
                  className="rounded accent-gray-900"
                />
                Early check-in
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-400">Check-out</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-gray-400"
              />
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isLateCheckOut}
                  onChange={(e) => setIsLateCheckOut(e.target.checked)}
                  className="rounded accent-gray-900"
                />
                Late check-out
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-400">Room with</span>
            <input
              type="text"
              value={roomPreference}
              onChange={(e) => setRoomPreference(e.target.value)}
              placeholder="e.g. Sophie Martin"
              className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-gray-400 w-44"
            />
          </div>

          <div className="flex items-end gap-2 ml-auto">
            <button
              onClick={onCancel}
              className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X size={13} />
            </button>
            <button
              onClick={() =>
                onSave({
                  gender: gender || undefined,
                  checkInDate,
                  checkOutDate,
                  isEarlyCheckIn: isEarlyCheckIn || undefined,
                  isLateCheckOut: isLateCheckOut || undefined,
                  roomPreference: roomPreference.trim() || undefined,
                })
              }
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Check size={12} /> Save
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function GuestList({
  participants: initial,
  buildings,
}: {
  participants: Participant[];
  buildings: Building[];
}) {
  const [participants, setParticipants] = useState(initial);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "dates" | "special">("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleUpdate(id: string, updates: Partial<Participant>) {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    setEditingId(null);
  }

  const nonStandardCount = participants.filter(
    (p) =>
      (p.checkInDate && p.checkInDate !== EVENT_CHECK_IN_DATE) ||
      (p.checkOutDate && p.checkOutDate !== EVENT_CHECK_OUT_DATE),
  ).length;

  const specialCount = participants.filter(
    (p) => p.isVip || p.isAccessibility || p.isEarlyCheckIn || p.isLateCheckOut,
  ).length;

  const filtered = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (tab === "dates")
        return (
          (!!p.checkInDate && p.checkInDate !== EVENT_CHECK_IN_DATE) ||
          (!!p.checkOutDate && p.checkOutDate !== EVENT_CHECK_OUT_DATE)
        );
      if (tab === "special")
        return !!p.isVip || !!p.isAccessibility || !!p.isEarlyCheckIn || !!p.isLateCheckOut;
      return true;
    });
  }, [participants, search, tab]);

  const TABS = [
    { key: "all" as const, label: "Tous", count: participants.length },
    { key: "dates" as const, label: "Non-standard dates", count: nonStandardCount },
    { key: "special" as const, label: "Special needs", count: specialCount },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 flex flex-col gap-5">
      {/* Section header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Guest list</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage participant details for this event</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm border border-gray-200 rounded-lg px-3.5 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
            Export list
          </button>
          <button className="flex items-center gap-1.5 text-sm font-medium bg-gray-900 text-white px-3.5 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            <UserPlus size={13} />
            Add participant
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "text-sm px-1 pb-3 mr-7 transition-colors border-b-2 -mb-px whitespace-nowrap",
              tab === key
                ? "text-gray-900 font-medium border-gray-900"
                : "text-gray-400 border-transparent hover:text-gray-600",
            )}
          >
            {label} <span className="text-gray-400 font-normal">({count})</span>
          </button>
        ))}
      </div>

      {/* Search row */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a participant…"
            className="text-sm pl-8 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors w-72"
          />
        </div>
        <button className="ml-auto flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3.5 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
          <Download size={13} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Participant</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">Gender</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">Check-in</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">Check-out</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">Room with</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">Room</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">VIP</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">
                Accessibility
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const isEditing = editingId === p.id;
              const assignedRoom = getAssignedRoom(p.id, buildings);
              const nonStandardCI = p.checkInDate && p.checkInDate !== EVENT_CHECK_IN_DATE;
              const nonStandardCO = p.checkOutDate && p.checkOutDate !== EVENT_CHECK_OUT_DATE;
              const av = avatarStyle(p.name);

              return (
                <Fragment key={p.id}>
                  <tr
                    className={cn(
                      "border-b border-gray-100 last:border-0 group transition-colors",
                      isEditing ? "bg-gray-50" : "hover:bg-gray-50/60",
                    )}
                  >
                    {/* Participant */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                            av.bg,
                            av.text,
                          )}
                        >
                          {initials(p.name)}
                        </div>
                        <span className="font-medium text-gray-900">{p.name}</span>
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="px-3 py-3 text-gray-500 text-sm">
                      {p.gender === "M" ? (
                        "Male"
                      ) : p.gender === "F" ? (
                        "Female"
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Check-in */}
                    <td className="px-3 py-3">
                      <p
                        className={cn(
                          "text-sm",
                          nonStandardCI ? "text-amber-600 font-medium" : "text-gray-500",
                        )}
                      >
                        {shortDate(p.checkInDate ?? EVENT_CHECK_IN_DATE)}
                      </p>
                      {p.isEarlyCheckIn && (
                        <span className="text-[10px] text-amber-600">Early check-in</span>
                      )}
                    </td>

                    {/* Check-out */}
                    <td className="px-3 py-3">
                      <p
                        className={cn(
                          "text-sm",
                          nonStandardCO ? "text-amber-600 font-medium" : "text-gray-500",
                        )}
                      >
                        {shortDate(p.checkOutDate ?? EVENT_CHECK_OUT_DATE)}
                      </p>
                      {p.isLateCheckOut && (
                        <span className="text-[10px] text-amber-600">Late check-out</span>
                      )}
                    </td>

                    {/* Room with */}
                    <td className="px-3 py-3 text-sm text-gray-500">
                      {p.roomPreference ?? <span className="text-gray-300">—</span>}
                    </td>

                    {/* Room */}
                    <td className="px-3 py-3">
                      {assignedRoom ? (
                        <div className="flex items-center gap-1.5">
                          <Check size={13} className="text-green-500 shrink-0" />
                          <span className="text-sm text-gray-700">{assignedRoom}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>

                    {/* VIP */}
                    <td className="px-3 py-3">
                      {p.isVip && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <Star size={12} fill="currentColor" />
                          <span className="text-xs font-medium">VIP</span>
                        </div>
                      )}
                    </td>

                    {/* Accessibility */}
                    <td className="px-3 py-3">
                      {p.isAccessibility && (
                        <div className="flex items-center gap-1 text-blue-500">
                          <Accessibility size={13} />
                          <span className="text-xs font-medium">PMR</span>
                        </div>
                      )}
                    </td>

                    {/* Edit */}
                    <td className="pr-4 py-3">
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
                      participant={p}
                      onSave={(updates) => handleUpdate(p.id, updates)}
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Row count */}
      <div className="pb-2">
        <span className="text-xs text-gray-400">
          {filtered.length} participant{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
