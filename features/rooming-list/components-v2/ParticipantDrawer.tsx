"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { GripVertical, UserPlus } from "lucide-react";
import { cn } from "@/shared/utils";
import type { Participant } from "../types";

interface ParticipantDrawerProps {
  participants: Participant[];
  assignedIds: Set<string>;
  draggingId: string | null;
  isRoomChipDragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onAddLateArrival: (name: string, isVip: boolean, isPmr: boolean) => void;
  onUnassignDrop: () => void;
}

export function ParticipantDrawer({
  participants,
  assignedIds,
  draggingId,
  isRoomChipDragging,
  onDragStart,
  onDragEnd,
  onAddLateArrival,
  onUnassignDrop,
}: ParticipantDrawerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (searchParams.get("slide") === "1") {
      setShouldAnimate(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("slide");
      const newUrl = params.size > 0 ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "vip" | "pmr">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newVip, setNewVip] = useState(false);
  const [newPmr, setNewPmr] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const unassigned = participants.filter((p) => !assignedIds.has(p.id));
  const regular = unassigned.filter((p) => !p.isLateArrival);
  const lateArrivals = unassigned.filter((p) => p.isLateArrival);

  function applyFilter(list: Participant[]) {
    return list.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" || (filter === "vip" && p.isVip) || (filter === "pmr" && p.isPmr);
      return matchesSearch && matchesFilter;
    });
  }

  const filteredRegular = applyFilter(regular);
  const filteredLate = applyFilter(lateArrivals);
  const isEmpty = filteredRegular.length === 0 && filteredLate.length === 0 && !showAddForm;

  function handleAddSubmit() {
    const name = newName.trim();
    if (!name) return;
    onAddLateArrival(name, newVip, newPmr);
    setNewName("");
    setNewVip(false);
    setNewPmr(false);
    setShowAddForm(false);
  }

  function openAddForm() {
    setShowAddForm(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  }

  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={cn(
        "w-72 shrink-0 flex flex-col border-l border-gray-200 bg-white relative transition-colors",
        shouldAnimate && "animate-slide-in-right",
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
      <div className="px-4 py-3.5 border-b border-gray-100">
        <p className="text-sm font-semibold text-slate-800">Unassigned</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {unassigned.length} participant{unassigned.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search + filter */}
      <div className="px-3 py-3 border-b border-gray-100 flex flex-col gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-slate-400 transition-colors"
        />
        <div className="flex gap-1.5">
          {(["all", "vip", "pmr"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "text-xs px-3 py-1 rounded border font-medium transition-colors",
                filter === f
                  ? "bg-slate-800 text-white border-slate-800"
                  : "border-gray-200 text-gray-500 hover:border-gray-300",
              )}
            >
              {f === "all" ? "All" : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {/* Regular participants */}
        {filteredRegular.map((p) => (
          <DrawerRow
            key={p.id}
            participant={p}
            isDragging={draggingId === p.id}
            onDragStart={() => onDragStart(p.id)}
            onDragEnd={onDragEnd}
          />
        ))}

        {/* Late arrivals section */}
        <div className="flex items-center justify-between px-3 py-2 bg-orange-50 border-y border-orange-100 mt-1">
          <span className="text-xs font-medium text-orange-600">
            Late arrivals
            {lateArrivals.length > 0 && (
              <span className="ml-1.5 text-orange-400 font-normal">({lateArrivals.length})</span>
            )}
          </span>
          <button
            onClick={openAddForm}
            className="flex items-center gap-1 text-[11px] text-orange-600 hover:text-orange-800 font-medium transition-colors"
          >
            <UserPlus size={11} />
            Add
          </button>
        </div>

        {/* Add late arrival form */}
        {showAddForm && (
          <div className="px-3 py-3 border-b border-orange-100 bg-orange-50/50 flex flex-col gap-2">
            <input
              ref={nameInputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubmit();
                if (e.key === "Escape") setShowAddForm(false);
              }}
              placeholder="Full name…"
              className="w-full text-sm border border-orange-200 rounded-md px-3 py-1.5 outline-none focus:border-orange-400 bg-white transition-colors"
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newVip}
                  onChange={(e) => setNewVip(e.target.checked)}
                  className="rounded"
                />
                <span className="font-bold text-yellow-700">VIP</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newPmr}
                  onChange={(e) => setNewPmr(e.target.checked)}
                  className="rounded"
                />
                <span className="font-bold text-blue-700">PMR</span>
              </label>
              <div className="flex gap-1.5 ml-auto">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubmit}
                  disabled={!newName.trim()}
                  className="text-xs px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredLate.map((p) => (
          <DrawerRow
            key={p.id}
            participant={p}
            isDragging={draggingId === p.id}
            onDragStart={() => onDragStart(p.id)}
            onDragEnd={onDragEnd}
            isLate
          />
        ))}

        {isEmpty && (
          <div className="p-6 text-center text-sm text-gray-400">
            {unassigned.length === 0 ? "All participants are assigned ✓" : "No results"}
          </div>
        )}
      </div>
    </div>
  );
}

function DrawerRow({
  participant,
  isDragging,
  onDragStart,
  onDragEnd,
  isLate,
}: {
  participant: Participant;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  isLate?: boolean;
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
        <div className="flex gap-1 mt-0.5">
          {participant.isVip && (
            <span className="text-[9px] font-bold bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded leading-none">
              VIP
            </span>
          )}
          {participant.isPmr && (
            <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1 py-0.5 rounded leading-none">
              PMR
            </span>
          )}
          {isLate && (
            <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-1 py-0.5 rounded leading-none">
              Late
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
