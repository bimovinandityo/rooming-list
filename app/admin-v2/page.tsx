import { NabooShell } from "@/shared/components/NabooShell";
import { GestionDesChambres } from "@/features/rooming-list/components-v2/GestionDesChambres";

export default function AdminV2Page() {
  return (
    <NabooShell activeItem="participants-rooming-list">
      <>
        {/* Page title + tabs */}
        <div className="px-8 pt-6 shrink-0 bg-white border-b border-gray-100">
          <h1 className="text-xl font-semibold text-gray-900">Rooming list</h1>
          <div className="flex gap-6 mt-4">
            {["Guest list", "Rooming list", "Attachments"].map((tab) => (
              <button
                key={tab}
                className={`text-sm pb-3 transition-colors ${
                  tab === "Rooming list"
                    ? "text-gray-900 font-medium border-b-2 border-gray-900 -mb-px"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Rooming list tool */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <GestionDesChambres hideTitle />
        </div>
      </>
    </NabooShell>
  );
}
