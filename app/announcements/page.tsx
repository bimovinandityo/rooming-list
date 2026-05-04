import { NabooShell } from "@/shared/components/NabooShell";
import { CommunicationView } from "@/features/communication/components/CommunicationView";

export default function AnnouncementsPage() {
  return (
    <NabooShell activeItem="announcements">
      <CommunicationView defaultTab="announcements" />
    </NabooShell>
  );
}
