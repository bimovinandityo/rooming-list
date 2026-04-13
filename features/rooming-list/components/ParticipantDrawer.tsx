"use client";

import { useState, useRef } from "react";
import { X, GripVertical, Clock, UserPlus } from "lucide-react";
import { cn } from "@/shared/utils";
import type { Participant } from "../types";

interface ParticipantDrawerProps {
  open: boolean;
  onClose: () => void;
  participants: Participant[];
  assignedIds: Set<string>;
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onAssign: (participant: Participant) => void;
  onMarkLate: (id: string) => void;
  onAddLateArrival: (name: string, isVip: boolean, isPmr: boolean) => void;
}

export function ParticipantDrawer({
  open,
  onClose,
  participants,
  assignedIds,
  draggingId,
  onDragStart,
  onDragEnd,
  onAssign,
  onMarkLate,
  onAddLateArrival,
}: ParticipantDrawerProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "vip" | "pmr">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newVip, setNewVip] = useState(false);
  const [newPmr, setNewPmr] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

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

  return (
    <div className="w-72 shrink-0 flex flex-col border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3.5 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-slate-800">Non assignés</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {unassigned.length} participant{unassigned.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Search + filter */}
      <div className="px-3 py-3 border-b border-gray-100 flex flex-col gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
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
              {f === "all" ? "Tous" : f.toUpperCase()}
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
            onAssign={() => onAssign(p)}
            onMarkLate={() => onMarkLate(p.id)}
          />
        ))}

        {/* Late arrivals section */}
        <div className="flex items-center justify-between px-3 py-2 bg-orange-50 border-y border-orange-100 mt-1">
          <span className="text-xs font-medium text-orange-600">
            Arrivées tardives
            {lateArrivals.length > 0 && (
              <span className="ml-1.5 text-orange-400 font-normal">({lateArrivals.length})</span>
            )}
          </span>
          <button
            onClick={openAddForm}
            className="flex items-center gap-1 text-[11px] text-orange-600 hover:text-orange-800 font-medium transition-colors"
          >
            <UserPlus size={11} />
            Ajouter
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
              placeholder="Nom complet…"
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
                  Annuler
                </button>
                <button
                  onClick={handleAddSubmit}
                  disabled={!newName.trim()}
                  className="text-xs px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Ajouter
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
            onAssign={() => onAssign(p)}
            onMarkLate={() => onMarkLate(p.id)}
            isLate
          />
        ))}

        {isEmpty && (
          <div className="p-6 text-center text-sm text-gray-400">
            {unassigned.length === 0 ? "Tous les participants sont assignés ✓" : "Aucun résultat"}
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
  onAssign,
  onMarkLate,
  isLate,
}: {
  participant: Participant;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onAssign: () => void;
  onMarkLate: () => void;
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

      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600 shrink-0">
        {participant.name.charAt(0)}
      </div>

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
              Tardif
            </span>
          )}
        </div>
      </div>

      {/* Hover actions */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
        <button
          onClick={onMarkLate}
          title={isLate ? "Retirer le statut tardif" : "Marquer comme arrivée tardive"}
          className={cn(
            "p-1 rounded transition-colors",
            isLate
              ? "text-orange-500 hover:bg-orange-50"
              : "text-gray-400 hover:text-orange-500 hover:bg-orange-50",
          )}
        >
          <Clock size={12} />
        </button>
        <button
          onClick={onAssign}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
        >
          + Assigner
        </button>
      </div>
    </div>
  );
}
