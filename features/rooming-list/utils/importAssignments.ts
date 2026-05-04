import * as XLSX from "xlsx";

export interface ParsedAssignment {
  participantName: string;
  roomName: string;
}

export interface AssignmentImportResult {
  assignments: ParsedAssignment[];
  warnings: string[];
}

function pick(row: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    const found = Object.keys(row).find((rk) => rk.trim().toLowerCase() === k.toLowerCase());
    if (found && row[found] !== "" && row[found] != null) return row[found];
  }
  return undefined;
}

function parseCsv(text: string): Record<string, unknown>[] {
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

function rowsToAssignments(rows: Record<string, unknown>[]): AssignmentImportResult {
  const assignments: ParsedAssignment[] = [];
  const warnings: string[] = [];
  rows.forEach((row, idx) => {
    const participantName = String(
      pick(row, ["participant", "participant name", "name", "guest", "guest name"]) ?? "",
    ).trim();
    const roomName = String(
      pick(row, ["room", "room name", "room number", "room #", "accommodation"]) ?? "",
    ).trim();
    if (!participantName || !roomName) {
      warnings.push(`Row ${idx + 2}: missing participant or room — skipped`);
      return;
    }
    assignments.push({ participantName, roomName });
  });
  return { assignments, warnings };
}

export async function importAssignmentsFromFile(file: File): Promise<AssignmentImportResult> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".numbers")) {
    throw new Error(
      "Apple Numbers files can't be read directly. Open it in Numbers and export to .xlsx or .csv first.",
    );
  }
  if (lower.endsWith(".pdf")) {
    throw new Error(
      "PDF import isn't supported yet. Please convert your file to .xlsx or .csv (Excel can save as either).",
    );
  }
  if (lower.endsWith(".csv")) {
    const text = await file.text();
    return rowsToAssignments(parseCsv(text));
  }
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    if (!sheet) throw new Error("Spreadsheet has no sheets.");
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    return rowsToAssignments(rows);
  }
  throw new Error(`Unsupported file type: ${file.name.split(".").pop() ?? "unknown"}`);
}
