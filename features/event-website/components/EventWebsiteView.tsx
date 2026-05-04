"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ImagePlus,
  Palette,
  X as XIcon,
  GripVertical,
  Pencil,
  Eye,
  Plus,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { TabHeader } from "@/shared/components/TabHeader";
import { cn } from "@/shared/utils";

const TABS = [
  { key: "editor", label: "Editor" },
  { key: "forms", label: "Forms" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function EventWebsiteView() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const search = useSearchParams();
  const fromUrl = search?.get("tab") as TabKey | null;
  const initial = fromUrl && TABS.some((t) => t.key === fromUrl) ? fromUrl : "editor";
  const [activeTab, setActiveTab] = useState<TabKey>(initial);

  useEffect(() => {
    if (fromUrl && TABS.some((t) => t.key === fromUrl) && fromUrl !== activeTab) {
      setActiveTab(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl]);

  return (
    <>
      {/* Page header */}
      <div className="px-8 pt-6 shrink-0 bg-white border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Event website</h1>
        <div className="flex gap-6 mt-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "text-sm pb-3 transition-colors whitespace-nowrap",
                activeTab === t.key
                  ? "text-gray-900 font-medium border-b-2 border-gray-900 -mb-px"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-white">
        {activeTab === "editor" ? <EditorTab /> : <FormsTab />}
      </div>
    </>
  );
}

interface NavPage {
  key: string;
  label: string;
  visible: boolean;
}

const INITIAL_NAV_PAGES: NavPage[] = [
  { key: "home", label: "Home", visible: true },
  { key: "place", label: "Venue", visible: false },
  { key: "schedule", label: "Schedule", visible: true },
  { key: "lodging", label: "Accommodation", visible: true },
  { key: "menu", label: "Menu", visible: true },
  { key: "team", label: "Team", visible: false },
];

function EditorTab() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primary, setPrimary] = useState("#FAFAF8");
  const [secondary, setSecondary] = useState("#FFFFFF");
  const [navPages, setNavPages] = useState<NavPage[]>(INITIAL_NAV_PAGES);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => setLogoUrl((ev.target?.result as string) ?? null);
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) readFile(f);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const f = Array.from(e.dataTransfer.files).find((x) => x.type.startsWith("image/"));
    if (f) readFile(f);
  }

  return (
    <div className="max-w-5xl px-8 py-6 flex flex-col gap-6">
      <TabHeader
        subtitle="Customize how your event website looks."
        actions={
          <>
            <button className="text-sm border border-gray-200 rounded-md px-3.5 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button className="text-sm bg-[#e8f747] text-gray-900 font-medium rounded-md px-3.5 py-2 hover:bg-[#ddf03f] transition-colors">
              Save
            </button>
          </>
        }
      />

      {/* Promo banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 px-6 py-5 flex items-start justify-between gap-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">Customize your event website!</h2>
          <p className="text-sm text-gray-600 mt-1">
            A single space to keep your participants informed in real time.
          </p>
        </div>
        <button className="shrink-0 flex items-center gap-1.5 text-sm bg-gray-900 text-white px-4 py-2.5 rounded-md hover:bg-gray-700 transition-colors">
          Preview &amp; edit site
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Logo & cover */}
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Logo &amp; cover image</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Set your logo and cover image for the home page
          </p>
        </div>
        <p className="text-sm text-gray-700">Logo</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "rounded-lg cursor-pointer transition-colors",
            "flex flex-col items-center justify-center gap-2 py-12 px-6",
            "border border-dashed border-blue-200 bg-blue-50/60",
            isDragOver && "bg-blue-100 border-blue-400",
          )}
        >
          {logoUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Logo"
                className="max-h-24 rounded-md border border-gray-200"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLogoUrl(null);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50"
              >
                <XIcon size={11} className="text-gray-700" />
              </button>
            </div>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <ImagePlus size={16} />
              </div>
              <p className="text-sm text-gray-600">
                Drop a file here or{" "}
                <span className="text-blue-600 underline underline-offset-2">browse</span> your
                files
              </p>
            </>
          )}
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* Visual identity */}
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Visual identity</h3>
            <p className="text-xs text-gray-500 mt-0.5">Choose your site colors</p>
          </div>
          <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-md px-3.5 py-2 text-gray-700 hover:bg-gray-50 transition-colors shrink-0">
            <Palette size={13} />
            Edit colors
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorRow
            title="Primary color"
            description="Headings &amp; buttons"
            value={primary}
            onChange={setPrimary}
          />
          <ColorRow
            title="Secondary color"
            description="Section backgrounds"
            value={secondary}
            onChange={setSecondary}
          />
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* Navigation pages */}
      <section className="flex flex-col gap-3 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Navigation pages</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Choose which pages to show or hide from participants
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {navPages.map((p) => (
            <NavPageRow
              key={p.key}
              page={p}
              onToggle={() =>
                setNavPages((prev) =>
                  prev.map((x) => (x.key === p.key ? { ...x, visible: !x.visible } : x)),
                )
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ColorRow({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const colorRef = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p
          className="text-sm font-medium text-gray-900"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <p
          className="text-xs text-gray-500 mt-0.5"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-gray-700 tabular-nums">{value.toUpperCase()}</span>
        <button
          type="button"
          onClick={() => colorRef.current?.click()}
          className="w-7 h-7 rounded border border-gray-200 shrink-0"
          style={{ background: value }}
          aria-label="Pick a color"
        />
        <input
          ref={colorRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="hidden"
        />
      </div>
    </div>
  );
}

function NavPageRow({ page, onToggle }: { page: NavPage; onToggle: () => void }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center justify-between gap-4">
      <p className="text-sm font-medium text-gray-900">{page.label}</p>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-gray-500">{page.visible ? "Visible" : "Hidden"}</span>
        <button
          type="button"
          role="switch"
          aria-checked={page.visible}
          onClick={onToggle}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
            page.visible ? "bg-gray-900" : "bg-gray-200",
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
              page.visible ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </button>
      </div>
    </div>
  );
}

// ── Forms tab ─────────────────────────────────────────────────────────────────

type QuestionType = "text" | "single" | "multi" | "long-text" | "yes-no";

const TYPE_LABEL: Record<QuestionType, string> = {
  text: "Text field",
  "long-text": "Long text",
  single: "Single choice",
  multi: "Multiple choice",
  "yes-no": "Yes / No",
};

interface FormQuestion {
  id: string;
  label: string;
  type: QuestionType;
  required?: boolean;
}

const INITIAL_QUESTIONS: FormQuestion[] = [
  { id: "q1", label: "Last name", type: "text" },
  { id: "q2", label: "First name", type: "text" },
  {
    id: "q3",
    label: "Do you have any specific dietary restrictions?",
    type: "text",
    required: true,
  },
  {
    id: "q4",
    label:
      "Do you have mobility-related needs or require accommodations? (wheelchair access, assistance, etc.)",
    type: "single",
  },
];

function FormsTab() {
  const [questions, setQuestions] = useState<FormQuestion[]>(INITIAL_QUESTIONS);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function handleToggleRequired(id: string) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, required: !q.required } : q)));
  }

  function handleAdd() {
    const label = window.prompt("Question label", "");
    if (!label) return;
    setQuestions((prev) => [...prev, { id: `q-${Date.now()}`, label: label.trim(), type: "text" }]);
  }

  function handleReorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    setQuestions((prev) => {
      const fromIdx = prev.findIndex((q) => q.id === fromId);
      const toIdx = prev.findIndex((q) => q.id === toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }

  return (
    <div className="max-w-5xl px-8 py-6 flex flex-col gap-5">
      <TabHeader
        subtitle="Build registration and RSVP forms."
        actions={
          <>
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-md px-3.5 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Pencil size={13} />
              Add a new question
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Preview form"
            >
              <Eye size={14} />
            </button>
          </>
        }
      />

      {/* Question list */}
      <div className="flex flex-col gap-3">
        {questions.map((q) => (
          <QuestionRow
            key={q.id}
            q={q}
            isDragging={draggingId === q.id}
            onDragStart={() => setDraggingId(q.id)}
            onDragEnd={() => setDraggingId(null)}
            onDropOn={(fromId) => handleReorder(fromId, q.id)}
            onDelete={() => handleDelete(q.id)}
            onToggleRequired={() => handleToggleRequired(q.id)}
          />
        ))}
        {/* Empty add affordance */}
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-1.5 text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <Plus size={13} />
          Add a question
        </button>
      </div>
    </div>
  );
}

function QuestionRow({
  q,
  isDragging,
  onDragStart,
  onDragEnd,
  onDropOn,
  onDelete,
  onToggleRequired,
}: {
  q: FormQuestion;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropOn: (fromId: string) => void;
  onDelete: () => void;
  onToggleRequired: () => void;
}) {
  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", q.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const fromId = e.dataTransfer.getData("text/plain");
        if (fromId) onDropOn(fromId);
      }}
      className={cn(
        "rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center gap-3 transition-opacity",
        isDragging && "opacity-40",
      )}
    >
      <span
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
        aria-hidden
      >
        <GripVertical size={16} />
      </span>
      <p className="flex-1 min-w-0 text-sm text-gray-800 leading-snug">{q.label}</p>
      <div className="flex items-center gap-2 shrink-0">
        {q.required && (
          <span className="text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded">
            Required
          </span>
        )}
        <span className="text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded">
          {TYPE_LABEL[q.type]}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={onToggleRequired}>
              <Pencil size={13} className="mr-2 text-gray-500" />
              {q.required ? "Make optional" : "Make required"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDelete} className="text-red-600 focus:text-red-700">
              <Trash2 size={13} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
