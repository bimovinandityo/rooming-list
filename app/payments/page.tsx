import { NabooShell } from "@/shared/components/NabooShell";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function PaymentsPage() {
  return (
    <NabooShell activeItem="payments">
      <PlaceholderView title="Payments" />
    </NabooShell>
  );
}
