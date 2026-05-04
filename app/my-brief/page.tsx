import { NabooShell } from "@/shared/components/NabooShell";
import { PlaceholderView } from "@/shared/components/PlaceholderView";

export default function MyBriefPage() {
  return (
    <NabooShell activeItem="my-brief">
      <PlaceholderView title="My brief" />
    </NabooShell>
  );
}
