"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Plus, BedDouble, Trash2, ImagePlus, X as XIcon, Shuffle } from "lucide-react";
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

const STOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80",
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
      {
        id: "r6",
        name: "VIP suite",
        bedTypes: [{ id: "bt7", type: "King bed", count: 1 }],
        privateBathroom: true,
        vipOnly: true,
        count: 3,
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
  const [isDragOver, setIsDragOver] = useState(false);
  const [stockIdx, setStockIdx] = useState(0);

  const [buildingId, setBuildingId] = useState(initialBuildingId ?? AVAILABLE_BUILDINGS[0].id);
  const [name, setName] = useState(initialRoom?.name ?? "");
  const [floor, setFloor] = useState<string>(
    initialRoom?.floor != null ? String(initialRoom.floor) : "",
  );
  const [bedTypes, setBedTypes] = useState<BedTypeEntry[]>(
    initialRoom?.bedTypes ?? [{ id: "new-0", type: "Double bed", count: 1 }],
  );
  const [privateBathroom, setPrivateBathroom] = useState(initialRoom?.privateBathroom ?? false);
  const [vipOnly, setVipOnly] = useState(initialRoom?.vipOnly ?? false);
  const [count, setCount] = useState(initialRoom?.count ?? 1);
  const [photos, setPhotos] = useState<string[]>(initialRoom?.photos ?? []);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState(initialRoom?.primaryPhotoIndex ?? 0);

  function addStockPhoto() {
    if (photos.length >= 3) return;
    setPhotos((prev) => [...prev, STOCK_PHOTOS[stockIdx % STOCK_PHOTOS.length]]);
    setStockIdx((i) => i + 1);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - photos.length);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPhotos((prev) => (prev.length < 3 ? [...prev, ev.target?.result as string] : prev));
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 3 - photos.length);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPhotos((prev) => (prev.length < 3 ? [...prev, ev.target?.result as string] : prev));
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    if (primaryPhotoIndex >= idx && primaryPhotoIndex > 0) {
      setPrimaryPhotoIndex((p) => p - 1);
    }
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
    const floorVal = floor.trim() !== "" ? parseInt(floor) : undefined;
    const roomData = {
      name: trimmed,
      bedTypes,
      privateBathroom,
      vipOnly: vipOnly || undefined,
      count,
      floor: floorVal,
      photos,
      primaryPhotoIndex,
    };
    if (isEditing && onSave && initialRoom) {
      onSave(buildingId, { ...initialRoom, ...roomData });
    } else if (onAdd) {
      onAdd(buildingId, roomData);
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

        <div className="px-6 py-5 flex flex-col gap-5 max-h-[560px] overflow-y-auto">
          <p className="text-xs text-gray-500 -mb-1 flex items-center gap-1.5">
            Fields tagged{" "}
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded leading-none">
              <Shuffle size={9} />
              Auto-assign
            </span>{" "}
            improve auto-assign quality.
          </p>
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

          {/* Name + Floor row */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
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
            <div className="flex flex-col gap-1.5 w-44 shrink-0">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1 whitespace-nowrap">
                Floor
                <span
                  title="Used by auto-assign to place PMR participants on floor 1"
                  className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded leading-none"
                >
                  <Shuffle size={9} />
                  Auto-assign
                </span>
              </label>
              <input
                value={floor}
                onChange={(e) => setFloor(e.target.value.replace(/[^0-9-]/g, ""))}
                placeholder="E.g. 2"
                className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors"
              />
              <p className="text-[10px] text-gray-400">Helps auto-assign place PMR on floor 1.</p>
            </div>
          </div>

          {/* Room photos */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Photos
              <span className="ml-1.5 text-xs font-normal text-gray-400">{photos.length}/3</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex gap-2">
              {/* Existing photos */}
              {photos.map((url, idx) => {
                const isPrimary = idx === primaryPhotoIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setPrimaryPhotoIndex(idx)}
                    className={`relative group w-[120px] h-[84px] rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${
                      isPrimary ? "border-gray-800" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {isPrimary && (
                      <div className="absolute bottom-1.5 left-1.5 bg-gray-900/80 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                        Primary
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(idx);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                    >
                      <XIcon size={10} className="text-gray-700" />
                    </button>
                  </div>
                );
              })}

              {/* Add photo slot */}
              {photos.length < 3 && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-1.5 w-[120px] h-[84px] rounded-lg border-2 border-dashed transition-colors cursor-pointer shrink-0 ${
                    isDragOver
                      ? "border-gray-400 bg-gray-100 text-gray-600"
                      : "border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={addStockPhoto}
                >
                  <ImagePlus size={16} />
                  <span className="text-[11px] text-center leading-tight px-1">
                    Add photo
                    <br />
                    <span className="text-gray-300">or drag &amp; drop</span>
                  </span>
                </div>
              )}
            </div>

            {photos.length > 1 && (
              <p className="text-[11px] text-gray-400">
                Click a photo to set it as the primary thumbnail.
              </p>
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

          {/* VIP only */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                VIP only
                <span
                  title="Used by auto-assign to route VIPs into these rooms only"
                  className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded leading-none"
                >
                  <Shuffle size={9} />
                  Auto-assign
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                Reserved exclusively for VIP participants. Helps auto-assign route VIPs here.
              </p>
            </div>
            <Switch checked={vipOnly} onCheckedChange={setVipOnly} />
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

  const [buildings, setBuildings] = useState<BuildingTemplate[]>(INITIAL_BUILDINGS);
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

  function handleAddRoom(buildingId: string, room: Omit<RoomTemplate, "id">) {
    const newRoom: RoomTemplate = { ...room, id: `r-${Date.now()}` };
    setBuildings((prev) => {
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
        <button
          onClick={handleSave}
          className="text-sm px-4 py-2 bg-[#e8f747] text-gray-900 font-medium rounded-md hover:bg-[#ddf03f] transition-colors"
        >
          {publishedAt ? "Re-publish" : "Publish"}
        </button>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

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
                    {room.photos?.[room.primaryPhotoIndex ?? 0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={room.photos[room.primaryPhotoIndex ?? 0]}
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
                      {room.vipOnly && (
                        <span className="text-[9px] font-bold bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded leading-none">
                          VIP only
                        </span>
                      )}
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
