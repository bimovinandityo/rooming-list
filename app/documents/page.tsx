import { NabooShell } from "@/shared/components/NabooShell";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function DocumentsPage() {
  return (
    <NabooShell activeItem="documents">
      <PlaceholderView title="Documents" />
    </NabooShell>
  );
}
