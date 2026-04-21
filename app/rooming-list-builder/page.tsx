import { NabooShell } from "@/shared/components/NabooShell";
import { RoomingListBuilder } from "@/features/rooming-list/components-v2/RoomingListBuilder";

export default function RoomingListBuilderPage() {
  return (
    <NabooShell activeItem="rooming-list-builder">
      <div className="flex-1 min-h-0 overflow-hidden">
        <RoomingListBuilder />
      </div>
    </NabooShell>
  );
}
