"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import type { Participant } from "../types";

interface AssignParticipantModalProps {
  open: boolean;
  onClose: () => void;
  participants: Participant[];
  assignedIds: Set<string>;
  onAssign: (participant: Participant) => void;
}

export function AssignParticipantModal({
  open,
  onClose,
  participants,
  assignedIds,
  onAssign,
}: AssignParticipantModalProps) {
  const [search, setSearch] = useState("");

  const available = participants.filter(
    (p) =>
      !assignedIds.has(p.id) &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[480px] max-w-[480px] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-base font-bold text-[#101f34]">
            Assigner un participant
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto py-1">
          {available.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Aucun participant disponible</p>
          )}
          {available.map((p) => (
            <button
              key={p.id}
              className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors text-left"
              onClick={() => {
                onAssign(p);
                onClose();
              }}
            >
              <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-[#101f34] shrink-0">
                {p.name.charAt(0)}
              </div>
              <span className="flex-1 text-sm text-[#101f34]">{p.name}</span>
              <div className="flex items-center gap-1">
                {p.isVip && (
                  <span className="text-xs px-1.5 py-0.5 bg-[#eff779] text-[#101f34] rounded font-medium">
                    VIP
                  </span>
                )}
                {p.isPmr && <span className="text-sm">♿</span>}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
