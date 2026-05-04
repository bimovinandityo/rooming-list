import { NabooShell } from "@/shared/components/NabooShell";
import { CommunicationView } from "@/features/communication/components/CommunicationView";

export default function FeedbackPage() {
  return (
    <NabooShell activeItem="feedback">
      <CommunicationView defaultTab="feedback" />
    </NabooShell>
  );
}
