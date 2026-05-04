"use client";

import { useState } from "react";
import { Pencil, Plus, Shuffle, Trash2, X as XIcon, ChevronDown, Check } from "lucide-react";
import { cn } from "@/shared/utils";
import { mockParticipants } from "../mock/data";
import type { Participant } from "../types";

interface DocumentItem {
  id: string;
  name: string;
  participantIds: string[];
}

interface Folder {
  id: string;
  name: string;
  documents: DocumentItem[];
}

const PARTICIPANTS = mockParticipants;
const PARTICIPANT_BY_ID = new Map(PARTICIPANTS.map((p) => [p.id, p]));

const pickIds = (...indices: number[]) =>
  indices.map((i) => PARTICIPANTS[i % PARTICIPANTS.length]?.id).filter(Boolean);

const INITIAL_FOLDERS: Folder[] = [
  {
    id: "f1",
    name: "Train tickets",
    documents: [
      { id: "d1", name: "Ticket 1", participantIds: pickIds(0, 1, 2) },
      { id: "d2", name: "Ticket 2", participantIds: pickIds(3) },
      { id: "d3", name: "Ticket 3", participantIds: pickIds(4, 5, 6) },
      { id: "d4", name: "Ticket 4", participantIds: pickIds(7) },
      { id: "d5", name: "Ticket 5", participantIds: pickIds(8, 9, 10) },
      { id: "d6", name: "Ticket 6", participantIds: pickIds(11) },
      { id: "d7", name: "Ticket 7", participantIds: pickIds(12, 13, 14) },
      { id: "d8", name: "Ticket 8", participantIds: pickIds(15, 16, 17, 18) },
    ],
  },
  {
    id: "f2",
    name: "Registration confirmations",
    documents: [
      { id: "d9", name: "Confirmation - group A", participantIds: pickIds(0, 1, 2, 3) },
      { id: "d10", name: "Confirmation - group B", participantIds: pickIds(4, 5, 6) },
    ],
  },
];

export function AttachmentsTab() {
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);

  function handleAddFolder() {
    const name = window.prompt("Folder name", "New folder");
    if (!name) return;
    setFolders((prev) => [...prev, { id: `f-${Date.now()}`, name, documents: [] }]);
  }

  function handleRenameFolder(folderId: string, name: string) {
    setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, name } : f)));
  }

  function handleDeleteFolder(folderId: string) {
    if (!window.confirm("Delete this folder?")) return;
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
  }

  function handleAddDocument(folderId: string) {
    setFolders((prev) =>
      prev.map((f) =>
        f.id !== folderId
          ? f
          : {
              ...f,
              documents: [
                ...f.documents,
                {
                  id: `d-${Date.now()}`,
                  name: `Document ${f.documents.length + 1}`,
                  participantIds: [],
                },
              ],
            },
      ),
    );
  }

  function handleDeleteDocument(folderId: string, docId: string) {
    setFolders((prev) =>
      prev.map((f) =>
        f.id !== folderId ? f : { ...f, documents: f.documents.filter((d) => d.id !== docId) },
      ),
    );
  }

  function handleSetParticipants(folderId: string, docId: string, ids: string[]) {
    setFolders((prev) =>
      prev.map((f) =>
        f.id !== folderId
          ? f
          : {
              ...f,
              documents: f.documents.map((d) =>
                d.id !== docId ? d : { ...d, participantIds: ids },
              ),
            },
      ),
    );
  }

  function handleRandomAssign(folderId: string) {
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id !== folderId) return f;
        const assigned = new Set(f.documents.flatMap((d) => d.participantIds));
        const pool = PARTICIPANTS.filter((p) => !assigned.has(p.id)).map((p) => p.id);
        // Round-robin spread across docs
        const docs = f.documents.map((d) => ({ ...d, participantIds: [...d.participantIds] }));
        let i = 0;
        for (const id of pool) {
          if (docs.length === 0) break;
          docs[i % docs.length].participantIds.push(id);
          i++;
        }
        return { ...f, documents: docs };
      }),
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Manage your documents</h2>
        <button
          onClick={handleAddFolder}
          className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-md px-3.5 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Plus size={13} />
          Add folder
        </button>
      </div>

      {folders.map((f) => {
        const assigned = new Set(f.documents.flatMap((d) => d.participantIds));
        const unassignedCount = PARTICIPANTS.length - assigned.size;
        return (
          <FolderCard
            key={f.id}
            folder={f}
            unassignedCount={unassignedCount}
            onRename={(name) => handleRenameFolder(f.id, name)}
            onDelete={() => handleDeleteFolder(f.id)}
            onAddDocument={() => handleAddDocument(f.id)}
            onDeleteDocument={(docId) => handleDeleteDocument(f.id, docId)}
            onSetParticipants={(docId, ids) => handleSetParticipants(f.id, docId, ids)}
            onRandomAssign={() => handleRandomAssign(f.id)}
          />
        );
      })}

      {folders.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-12">
          No folders yet — click &ldquo;Add folder&rdquo; to get started.
        </p>
      )}
    </div>
  );
}

function FolderCard({
  folder,
  unassignedCount,
  onRename,
  onDelete,
  onAddDocument,
  onDeleteDocument,
  onSetParticipants,
  onRandomAssign,
}: {
  folder: Folder;
  unassignedCount: number;
  onRename: (name: string) => void;
  onDelete: () => void;
  onAddDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onSetParticipants: (id: string, ids: string[]) => void;
  onRandomAssign: () => void;
}) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white">
      {/* Folder header */}
      <header className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{folder.name}</h3>
          <button
            type="button"
            onClick={() => {
              const next = window.prompt("Rename folder", folder.name);
              if (next && next.trim()) onRename(next.trim());
            }}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Rename"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
            title="Delete folder"
          >
            <Trash2 size={13} />
          </button>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-gray-500">
            {unassignedCount} participant{unassignedCount !== 1 ? "s" : ""} unassigned
          </span>
          <button
            type="button"
            onClick={onRandomAssign}
            className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Shuffle size={13} />
            Random assign
          </button>
          <button
            type="button"
            onClick={onAddDocument}
            className="flex items-center gap-1.5 text-sm bg-gray-900 text-white rounded-md px-3 py-2 hover:bg-gray-700 transition-colors"
          >
            <Plus size={13} />
            Add document
          </button>
        </div>
      </header>

      <div className="divide-y divide-gray-100">
        {folder.documents.map((d) => (
          <DocumentRow
            key={d.id}
            doc={d}
            onSetParticipants={(ids) => onSetParticipants(d.id, ids)}
            onDelete={() => onDeleteDocument(d.id)}
          />
        ))}
        {folder.documents.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No documents — click &ldquo;Add document&rdquo;.
          </p>
        )}
      </div>
    </article>
  );
}

function DocumentRow({
  doc,
  onSetParticipants,
  onDelete,
}: {
  doc: DocumentItem;
  onSetParticipants: (ids: string[]) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className="w-24 shrink-0 text-sm font-medium text-gray-800">{doc.name}</span>
      <div className="flex-1">
        <ParticipantPicker selectedIds={doc.participantIds} onChange={onSetParticipants} />
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-50 hover:text-red-500 transition-colors shrink-0"
        title="Delete document"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ParticipantPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = selectedIds
    .map((id) => PARTICIPANT_BY_ID.get(id))
    .filter(Boolean) as Participant[];

  const filtered = !search
    ? PARTICIPANTS
    : PARTICIPANTS.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  function toggle(id: string) {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((x) => x !== id));
    else onChange([...selectedIds, id]);
  }

  function remove(id: string) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5 text-sm text-left bg-white hover:border-gray-400 transition-colors"
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selected.length === 0 && (
            <span className="text-gray-400 px-1">Assign participants…</span>
          )}
          {selected.map((p) => (
            <span
              key={p.id}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-700"
            >
              {p.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(p.id);
                }}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label={`Remove ${p.name}`}
              >
                <XIcon size={10} />
              </button>
            </span>
          ))}
        </div>
        <ChevronDown
          size={14}
          className={cn("text-gray-400 transition-transform shrink-0", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-md">
          <div className="px-2 pt-2">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a participant…"
              className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1 mt-1">
            {filtered.slice(0, 40).map((p) => {
              const checked = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                      checked
                        ? "bg-gray-900 border-gray-900 text-white"
                        : "border-gray-300 bg-white",
                    )}
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="text-gray-700 truncate">{p.name}</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
