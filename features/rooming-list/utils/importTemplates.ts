import * as XLSX from "xlsx";
import type { BuildingTemplate, RoomTemplate, BedTypeEntry } from "../types/builder";

const BED_TYPES = ["Single bed", "Double bed", "Queen bed", "King bed", "Bunk bed"] as const;

function normalizeBedType(raw: string): string | null {
  const s = raw.trim().toLowerCase().replace(/s$/, "");
  for (const t of BED_TYPES) {
    if (s.includes(t.toLowerCase().replace(" bed", ""))) return t;
  }
  return null;
}

function parseBeds(raw: string): BedTypeEntry[] {
  // "2 Single bed + 1 Double bed", "1 King", "Single x2"
  const parts = raw
    .split(/[+;,/]|\band\b/i)
    .map((p) => p.trim())
    .filter(Boolean);
  const result: BedTypeEntry[] = [];
  for (const part of parts) {
    const m = part.match(/^(\d+)\s*x?\s*(.+)$/i) || part.match(/^(.+?)\s*x\s*(\d+)$/i);
    let count = 1;
    let typeStr = part;
    if (m) {
      const a = m[1];
      const b = m[2];
      if (/^\d+$/.test(a)) {
        count = parseInt(a, 10);
        typeStr = b;
      } else {
        count = parseInt(b, 10);
        typeStr = a;
      }
    }
    const type = normalizeBedType(typeStr);
    if (type && count > 0) {
      result.push({ id: `imp-${Math.random().toString(36).slice(2, 9)}`, type, count });
    }
  }
  return result;
}

function parseBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return ["yes", "y", "true", "1", "x", "✓"].includes(s);
}

function parseInteger(v: unknown, fallback = 1): number {
  if (typeof v === "number") return Math.max(1, Math.round(v));
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function pick(row: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    const found = Object.keys(row).find((rk) => rk.trim().toLowerCase() === k.toLowerCase());
    if (found && row[found] !== "" && row[found] != null) return row[found];
  }
  return undefined;
}

export interface ImportResult {
  buildings: BuildingTemplate[];
  warnings: string[];
}

export function rowsToTemplates(rows: Record<string, unknown>[]): ImportResult {
  const byBuilding = new Map<string, BuildingTemplate>();
  const warnings: string[] = [];

  rows.forEach((row, idx) => {
    const buildingName = String(pick(row, ["building", "accommodation", "site"]) ?? "").trim();
    const roomName = String(pick(row, ["name", "room", "room name"]) ?? "").trim();
    const bedsRaw = String(pick(row, ["beds", "bed types", "bed", "bedtypes"]) ?? "").trim();

    if (!buildingName || !roomName || !bedsRaw) {
      warnings.push(`Row ${idx + 2}: missing building/name/beds — skipped`);
      return;
    }

    const bedTypes = parseBeds(bedsRaw);
    if (bedTypes.length === 0) {
      warnings.push(`Row ${idx + 2}: couldn't parse beds "${bedsRaw}" — skipped`);
      return;
    }

    const room: RoomTemplate = {
      id: `imp-${Date.now()}-${idx}`,
      name: roomName,
      bedTypes,
      privateBathroom: parseBool(pick(row, ["private bathroom", "bathroom", "ensuite"])),
      vipOnly: parseBool(pick(row, ["vip only", "vip"])) || undefined,
      count: parseInteger(pick(row, ["count", "qty", "quantity", "rooms"])),
      floor: (() => {
        const f = pick(row, ["floor", "level"]);
        if (f == null || f === "") return undefined;
        const n = parseInt(String(f), 10);
        return Number.isFinite(n) ? n : undefined;
      })(),
      startNumber: (() => {
        const s = pick(row, [
          "start number",
          "starting room number",
          "room number",
          "first number",
        ]);
        if (s == null || s === "") return undefined;
        const n = parseInt(String(s), 10);
        return Number.isFinite(n) ? n : undefined;
      })(),
    };

    const key = buildingName.toLowerCase();
    if (!byBuilding.has(key)) {
      byBuilding.set(key, {
        id: `imp-b-${key.replace(/\s+/g, "-")}`,
        name: buildingName,
        rooms: [],
      });
    }
    byBuilding.get(key)!.rooms.push(room);
  });

  return { buildings: [...byBuilding.values()], warnings };
}

function parseCsv(text: string): Record<string, unknown>[] {
  // Robust enough for typical exports — handles quoted fields with commas/newlines.
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        cur.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (field !== "" || cur.length) {
          cur.push(field);
          rows.push(cur);
          cur = [];
          field = "";
        }
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else field += c;
    }
  }
  if (field !== "" || cur.length) {
    cur.push(field);
    rows.push(cur);
  }
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((c) => c.trim() !== ""))
    .map((r) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => (obj[h] = r[i] ?? ""));
      return obj;
    });
}

export async function importFromFile(file: File): Promise<ImportResult> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".numbers")) {
    throw new Error(
      "Apple Numbers files can't be read directly. Open it in Numbers and export to .xlsx or .csv first.",
    );
  }
  if (lower.endsWith(".pdf")) {
    throw new Error("PDF import isn't supported yet. Please convert your file to .xlsx or .csv.");
  }

  if (lower.endsWith(".csv")) {
    const text = await file.text();
    return rowsToTemplates(parseCsv(text));
  }

  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    if (!sheet) throw new Error("Spreadsheet has no sheets.");
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    return rowsToTemplates(rows);
  }

  throw new Error(`Unsupported file type: ${file.name.split(".").pop() ?? "unknown"}`);
}
