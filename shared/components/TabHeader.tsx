import type { ReactNode } from "react";

/**
 * Standard "supporting text" row that sits at the top of a tab body.
 * Keeps the subtitle's position, size, and vertical rhythm identical
 * across every tab — even when one has actions and another doesn't.
 */
export function TabHeader({ subtitle, actions }: { subtitle: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 min-h-9">
      <p className="text-sm text-gray-500">{subtitle}</p>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
