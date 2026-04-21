"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Plus, BedDouble, Trash2, ImagePlus, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Switch } from "@/shared/ui/switch";
import { useRoomingList } from "../context/RoomingListContext";
import type { BuildingTemplate, RoomTemplate, BedTypeEntry } from "../types/builder";

// ── Constants ─────────────────────────────────────────────────────────────────

const BED_OPTIONS = ["Single bed", "Double bed", "Queen bed", "King bed", "Bunk bed"];

const AVAILABLE_BUILDINGS = [
  { id: "b1", name: "Main Building" },
  { id: "b2", name: "Building 2" },
  { id: "b3", name: "Annex" },
];

const INITIAL_BUILDINGS: BuildingTemplate[] = [
  {
    id: "b1",
    name: "Main Building",
    rooms: [
      {
        id: "r1",
        name: "Large room",
        bedTypes: [{ id: "bt1", type: "Single bed", count: 2 }],
        privateBathroom: true,
        count: 8,
      },
      {
        id: "r2",
        name: "Twin room",
        bedTypes: [{ id: "bt2", type: "Single bed", count: 2 }],
        privateBathroom: false,
        count: 12,
      },
    ],
  },
  {
    id: "b2",
    name: "Building 2",
    rooms: [
      {
        id: "r3",
        name: "Large room",
        bedTypes: [{ id: "bt3", type: "Double bed", count: 1 }],
        privateBathroom: false,
        count: 6,
      },
      {
        id: "r4",
        name: "Family room",
        bedTypes: [
          { id: "bt4", type: "Double bed", count: 1 },
          { id: "bt5", type: "Single bed", count: 2 },
        ],
        privateBathroom: false,
        count: 4,
      },
      {
        id: "r5",
        name: "Twin room",
        bedTypes: [{ id: "bt6", type: "Single bed", count: 2 }],
        privateBathroom: false,
        count: 10,
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function describeBedTypes(bedTypes: BedTypeEntry[], privateBathroom: boolean): string {
  const parts = bedTypes.map((e) => `${e.count} ${e.type}${e.count > 1 ? "s" : ""}`);
  const base = parts.join(" + ");
  return privateBathroom ? `${base} · Private bathroom` : base;
}

function totalBedsInRoom(bedTypes: BedTypeEntry[]): number {
  return bedTypes.reduce((sum, e) => sum + e.count, 0);
}

// ── Bed type row inside the modal ─────────────────────────────────────────────

function BedTypeRow({
  entry,
  onChange,
  onRemove,
  canRemove,
}: {
  entry: BedTypeEntry;
  onChange: (updated: BedTypeEntry) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Type dropdown */}
      <div className="relative flex-1">
        <select
          value={entry.type}
          onChange={(e) => onChange({ ...entry, type: e.target.value })}
          className="w-full appearance-none border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 bg-white outline-none focus:border-gray-400 transition-colors pr-8"
        >
          {BED_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
          ▾
        </span>
      </div>

      {/* Count stepper */}
      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden shrink-0">
        <button
          type="button"
          onClick={() => onChange({ ...entry, count: Math.max(1, entry.count - 1) })}
          disabled={entry.count <= 1}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-25 border-r border-gray-200 transition-colors"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium text-gray-800">{entry.count}</span>
        <button
          type="button"
          onClick={() => onChange({ ...entry, count: entry.count + 1 })}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 border-l border-gray-200 transition-colors"
        >
          +
        </button>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 disabled:opacity-0 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ── Room Modal (add + edit) ────────────────────────────────────────────────────

function RoomModal({
  open,
  onClose,
  onAdd,
  onSave,
  initialBuildingId,
  initialRoom,
}: {
  open: boolean;
  onClose: () => void;
  onAdd?: (buildingId: string, room: Omit<RoomTemplate, "id">) => void;
  onSave?: (buildingId: string, room: RoomTemplate) => void;
  initialBuildingId?: string;
  initialRoom?: RoomTemplate;
}) {
  const isEditing = !!initialRoom;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [buildingId, setBuildingId] = useState(initialBuildingId ?? AVAILABLE_BUILDINGS[0].id);
  const [name, setName] = useState(initialRoom?.name ?? "");
  const [bedTypes, setBedTypes] = useState<BedTypeEntry[]>(
    initialRoom?.bedTypes ?? [{ id: "new-0", type: "Double bed", count: 1 }],
  );
  const [privateBathroom, setPrivateBathroom] = useState(initialRoom?.privateBathroom ?? false);
  const [count, setCount] = useState(initialRoom?.count ?? 1);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialRoom?.photoUrl);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function addBedType() {
    setBedTypes((prev) => [...prev, { id: `bt-${Date.now()}`, type: "Single bed", count: 1 }]);
  }

  function updateBedType(id: string, updated: BedTypeEntry) {
    setBedTypes((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }

  function removeBedType(id: string) {
    setBedTypes((prev) => prev.filter((e) => e.id !== id));
  }

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (isEditing && onSave && initialRoom) {
      onSave(buildingId, {
        ...initialRoom,
        name: trimmed,
        bedTypes,
        privateBathroom,
        count,
        photoUrl,
      });
    } else if (onAdd) {
      onAdd(buildingId, { name: trimmed, bedTypes, privateBathroom, count, photoUrl });
    }
    onClose();
  }

  const totalBeds = totalBedsInRoom(bedTypes);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[460px] max-w-[460px] p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-base font-bold text-gray-900">
            {isEditing ? "Edit room" : "Add room"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 flex flex-col gap-5 max-h-[540px] overflow-y-auto">
          {/* Building */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Accommodation</label>
            <div className="relative">
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 bg-white outline-none focus:border-gray-400 transition-colors pr-8"
              >
                {AVAILABLE_BUILDINGS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                ▾
              </span>
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Room name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="E.g. Deluxe room"
              autoFocus
              className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Room photo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Room photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {photoUrl ? (
              <div className="relative group w-full h-36 rounded-lg overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="Room" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-white text-gray-800 font-medium px-3 py-1.5 rounded-md shadow hover:bg-gray-50 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(undefined)}
                    className="w-7 h-7 bg-white text-gray-600 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-colors"
                  >
                    <XIcon size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <ImagePlus size={20} />
                <span className="text-xs">Upload a photo</span>
              </button>
            )}
          </div>

          {/* Bed types */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Beds
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {totalBeds} bed{totalBeds !== 1 ? "s" : ""} total
                </span>
              </label>
            </div>
            <div className="flex flex-col gap-2">
              {bedTypes.map((entry) => (
                <BedTypeRow
                  key={entry.id}
                  entry={entry}
                  onChange={(updated) => updateBedType(entry.id, updated)}
                  onRemove={() => removeBedType(entry.id)}
                  canRemove={bedTypes.length > 1}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addBedType}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors w-fit mt-1"
            >
              <Plus size={13} />
              Add bed type
            </button>
          </div>

          {/* Private bathroom */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Private bathroom</label>
            <Switch checked={privateBathroom} onCheckedChange={setPrivateBathroom} />
          </div>

          {/* Count */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Number of identical rooms</label>
            <p className="text-xs text-gray-400">
              If you have multiple rooms with the same configuration, enter the quantity here.
            </p>
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden w-fit">
              <button
                type="button"
                onClick={() => setCount(Math.max(1, count - 1))}
                disabled={count <= 1}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed border-r border-gray-200 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 h-8 text-center text-sm font-medium text-gray-800 bg-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setCount(count + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 border-l border-gray-200 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="text-sm px-4 py-2 bg-[#e8f747] text-gray-900 font-medium rounded-md hover:bg-[#ddf03f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isEditing ? "Save" : "Add"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function RoomingListBuilder() {
  const { setTemplates, publish, publishedAt } = useRoomingList();

  const [buildings, setBuildings] = useState<BuildingTemplate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0);
  const [editingRoom, setEditingRoom] = useState<{ buildingId: string; room: RoomTemplate } | null>(
    null,
  );
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    setTemplates(buildings);
  }, [buildings, setTemplates]);

  const allRooms = buildings.flatMap((b) => b.rooms);
  const totalRooms = allRooms.reduce((sum, r) => sum + r.count, 0);
  const totalBeds = allRooms.reduce((sum, r) => sum + r.count * totalBedsInRoom(r.bedTypes), 0);
  const hasRooms = allRooms.length > 0;

  function handleAddRoom(buildingId: string, room: Omit<RoomTemplate, "id">) {
    const newRoom: RoomTemplate = { ...room, id: `r-${Date.now()}` };
    setBuildings((prev) => {
      // Prototype shortcut: first room added jumps straight to the full demo state
      if (prev.length === 0) return INITIAL_BUILDINGS;

      const buildingName =
        AVAILABLE_BUILDINGS.find((b) => b.id === buildingId)?.name ?? "New Building";
      const exists = prev.find((b) => b.id === buildingId);
      if (exists) {
        return prev.map((b) => (b.id === buildingId ? { ...b, rooms: [...b.rooms, newRoom] } : b));
      }
      return [...prev, { id: buildingId, name: buildingName, rooms: [newRoom] }];
    });
  }

  function handleSaveRoom(buildingId: string, updated: RoomTemplate) {
    setBuildings((prev) =>
      prev.map((b) =>
        b.id !== buildingId
          ? b
          : { ...b, rooms: b.rooms.map((r) => (r.id === updated.id ? updated : r)) },
      ),
    );
  }

  function handleDelete(buildingId: string, roomId: string) {
    setBuildings((prev) =>
      prev
        .map((b) =>
          b.id !== buildingId ? b : { ...b, rooms: b.rooms.filter((r) => r.id !== roomId) },
        )
        .filter((b) => b.rooms.length > 0),
    );
  }

  function handleCountChange(buildingId: string, roomId: string, value: number) {
    setBuildings((prev) =>
      prev.map((b) =>
        b.id !== buildingId
          ? b
          : {
              ...b,
              rooms: b.rooms.map((r) =>
                r.id !== roomId ? r : { ...r, count: Math.max(1, value) },
              ),
            },
      ),
    );
  }

  function handleSave() {
    publish(buildings);
    toast.success("Rooming list published", {
      description: `${totalRooms} room${totalRooms !== 1 ? "s" : ""} · ${totalBeds} bed${totalBeds !== 1 ? "s" : ""}`,
      action: {
        label: "Go to rooming list →",
        onClick: () => (window.location.href = "/admin-v2"),
      },
      duration: 6000,
    });
  }

  // ── Shared header ──────────────────────────────────────────────────────────

  const pageHeader = (
    <div className="px-8 pt-6 pb-5 border-b border-gray-100 flex items-start justify-between shrink-0">
      <div>
        <p className="text-xs text-gray-400 mb-1">Admin settings &rsaquo; Rooming list</p>
        <h1 className="text-xl font-semibold text-gray-900">Build rooming list</h1>
      </div>
      <div className="flex items-center gap-4 mt-1">
        {publishedAt && (
          <span className="text-xs text-gray-400">
            Published at{" "}
            {publishedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-gray-500">Show to participants</span>
          <Switch checked={showParticipants} onCheckedChange={setShowParticipants} />
        </div>
        {hasRooms && (
          <button
            onClick={handleSave}
            className="text-sm px-4 py-2 bg-[#e8f747] text-gray-900 font-medium rounded-md hover:bg-[#ddf03f] transition-colors"
          >
            {publishedAt ? "Re-publish" : "Publish"}
          </button>
        )}
      </div>
    </div>
  );

  // ── Empty state ────────────────────────────────────────────────────────────

  if (!hasRooms) {
    return (
      <div className="flex flex-col h-full">
        {pageHeader}
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <BedDouble size={24} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">No rooms configured</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs leading-relaxed">
              Add the room types available for your event.
            </p>
          </div>
          <button
            onClick={() => {
              setAddModalKey((k) => k + 1);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <Plus size={14} />
            Add room
          </button>
        </div>
        <RoomModal
          key={addModalKey}
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddRoom}
        />
      </div>
    );
  }

  // ── Populated state ────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {pageHeader}

      {/* Toolbar */}
      <div className="px-8 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
        <span className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{totalRooms}</span> room
          {totalRooms !== 1 ? "s" : ""}
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{totalBeds}</span> beds total
        </span>
        <div className="flex-1" />
        <button
          onClick={() => {
            setAddModalKey((k) => k + 1);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-3.5 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          <Plus size={14} />
          Add room
        </button>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
        {buildings.map((building) => (
          <div key={building.id}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {building.name}
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {building.rooms.map((room, idx) => (
                <div
                  key={room.id}
                  className={`group flex items-center gap-4 px-5 py-4 bg-white hover:bg-gray-50/60 transition-colors ${
                    idx < building.rooms.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  {/* Room thumbnail */}
                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                    {room.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={room.photoUrl}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BedDouble size={16} className="text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{room.name}</span>
                      <button
                        onClick={() => setEditingRoom({ buildingId: building.id, room })}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-all"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {describeBedTypes(room.bedTypes, room.privateBathroom)}
                    </p>
                  </div>

                  {/* Room count stepper */}
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden shrink-0">
                    <button
                      onClick={() => handleCountChange(building.id, room.id, room.count - 1)}
                      disabled={room.count <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed border-r border-gray-200 transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={room.count}
                      onChange={(e) =>
                        handleCountChange(building.id, room.id, parseInt(e.target.value) || 1)
                      }
                      className="w-14 h-8 text-center text-sm font-medium text-gray-800 bg-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => handleCountChange(building.id, room.id, room.count + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 border-l border-gray-200 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(building.id, room.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <RoomModal
        key={addModalKey}
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddRoom}
      />
      <RoomModal
        key={editingRoom?.room.id ?? "edit-modal"}
        open={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        onSave={handleSaveRoom}
        initialBuildingId={editingRoom?.buildingId}
        initialRoom={editingRoom?.room}
      />
    </div>
  );
}
