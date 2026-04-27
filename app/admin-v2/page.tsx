import { NabooShell } from "@/shared/components/NabooShell";
import { AdminTabView } from "@/features/rooming-list/components-v2/AdminTabView";

export default function AdminV2Page() {
  return (
    <NabooShell activeItem="participants-rooming-list">
      <AdminTabView />
    </NabooShell>
  );
}
