"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Phone,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  User,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
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
  { key: "information", label: "Basic information" },
  { key: "schedule", label: "Schedule" },
  { key: "menus", label: "Menus" },
  { key: "contacts", label: "Contacts" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

interface Contact {
  id: string;
  role: string;
  name: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
}

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "c1",
    role: "Naboo advisor",
    name: "Mélanie Dusautoir",
    phone: "07 55 54 67 28",
    email: "melanie.dusautoir@naboo.app",
    photoUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "c2",
    role: "Host",
    name: "Julien Royaumont",
    phone: "06 38 32 75 84",
    photoUrl: "https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "c3",
    role: "Caterer",
    name: "Louise Lefort",
    email: "david.bilcot@gmail.com",
  },
  {
    id: "c4",
    role: "Activity provider",
    name: "Noé Bloch",
    email: "noe@nevermindevent.com",
    photoUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
  },
];

export function PreparationSejourView() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const search = useSearchParams();
  const fromUrl = search?.get("tab") as TabKey | null;
  const initial = fromUrl && TABS.some((t) => t.key === fromUrl) ? fromUrl : "contacts";
  const [activeTab, setActiveTab] = useState<TabKey>(initial);

  // Sync the tab state when only the query param changes (sidebar links).
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
        <h1 className="text-xl font-semibold text-gray-900">Logistics</h1>
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
        {activeTab === "contacts" ? (
          <ContactsTab />
        ) : activeTab === "menus" ? (
          <MenusTab />
        ) : activeTab === "schedule" ? (
          <ScheduleTab />
        ) : activeTab === "information" ? (
          <InformationTab />
        ) : (
          <ComingSoon label={labelFor(activeTab)} />
        )}
      </div>
    </>
  );
}

function labelFor(key: TabKey) {
  return TABS.find((t) => t.key === key)?.label ?? key;
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-full text-sm text-gray-400 py-20">
      {label} coming soon
    </div>
  );
}

function ContactsTab() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);

  function handleDelete(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="max-w-6xl px-8 py-6 flex flex-col gap-5">
      <TabHeader
        subtitle="Manage the key people for your event."
        actions={
          <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-md px-3.5 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus size={13} />
            Add contact
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c) => (
          <ContactCard key={c.id} contact={c} onDelete={() => handleDelete(c.id)} />
        ))}
      </div>
    </div>
  );
}

function ContactCard({ contact, onDelete }: { contact: Contact; onDelete: () => void }) {
  return (
    <article className="relative rounded-lg border border-gray-200 bg-white pt-6 pb-3 px-5 flex flex-col items-center text-center">
      <div className="absolute top-3 right-3">
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
            <DropdownMenuItem>
              <Pencil size={13} className="mr-2 text-gray-500" />
              Edit contact
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDelete} className="text-red-600 focus:text-red-700">
              <Trash2 size={13} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {contact.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={contact.photoUrl}
          alt={contact.name}
          className="w-20 h-20 rounded-full object-cover border border-gray-100"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100">
          <User size={32} strokeWidth={1.5} />
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">{contact.role}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{contact.name}</p>

      <div className="mt-2 flex flex-col items-center gap-1.5">
        {contact.phone && (
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Phone size={12} className="text-gray-500" />
            {contact.phone}
          </a>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors max-w-full truncate"
          >
            <Mail size={12} className="text-gray-500 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </a>
        )}
      </div>

      <div className="h-2" />
    </article>
  );
}

// ── Menus tab ─────────────────────────────────────────────────────────────────

interface DietaryRow {
  count: number;
  label: string;
}

interface LunchOption {
  id: string;
  name: string;
  description: string;
  extras?: string[];
}

interface DinnerOption {
  id: string;
  name: string;
}

interface DinnerCourse {
  key: string;
  label: string;
  maxChoices: number;
  placeholder: string;
  options: DinnerOption[];
}

interface DayMenu {
  id: string;
  date: string; // human-readable date e.g. "vendredi 22 septembre"
  lunchMaxChoices: number;
  lunch: LunchOption[];
  dinner: DinnerCourse[];
}

const DIETARY: DietaryRow[] = [
  { count: 20, label: "Vegetarian" },
  { count: 10, label: "Halal" },
  { count: 1, label: "Gluten intolerant" },
  { count: 1, label: "Lactose intolerant" },
  { count: 1, label: "Palm oil allergy" },
];

const DAYS: DayMenu[] = [
  {
    id: "d1",
    date: "Friday, September 22",
    lunchMaxChoices: 2,
    lunch: [
      {
        id: "l1",
        name: "Nordic buffet",
        description:
          "Selection of smoked fish, shellfish, rustic breads, cheeses, and fresh accompaniments.",
      },
      {
        id: "l2",
        name: "Chef's Caesar salad",
        description:
          "Crisp baby romaine, golden artisan croutons, aged Parmesan, and a delicate house Caesar emulsion.",
        extras: ["chef's special sauce"],
      },
      {
        id: "l3",
        name: "Third menu",
        description: "Description of the third menu",
      },
    ],
    dinner: [
      {
        key: "starter",
        label: "Starter",
        maxChoices: 2,
        placeholder: "Choose your starter",
        options: [
          { id: "e1", name: "Pumpkin velouté, chestnut chips" },
          { id: "e2", name: "Salmon tartare, avocado, lime" },
          { id: "e3", name: "Foie gras, fig chutney" },
        ],
      },
      {
        key: "main",
        label: "Main",
        maxChoices: 1,
        placeholder: "Choose your main",
        options: [
          { id: "p1", name: "Beef fillet, pepper sauce, gratin dauphinois" },
          { id: "p2", name: "Duck breast, honey sauce, roasted vegetables" },
          { id: "p3", name: "Mushroom and truffle risotto" },
        ],
      },
      {
        key: "dessert",
        label: "Dessert",
        maxChoices: 1,
        placeholder: "Choose your dessert",
        options: [
          { id: "ds1", name: "Lemon meringue tart" },
          { id: "ds2", name: "Chocolate fondant, vanilla ice cream" },
          { id: "ds3", name: "Aged cheese platter" },
        ],
      },
    ],
  },
  {
    id: "d2",
    date: "Saturday, September 23",
    lunchMaxChoices: 2,
    lunch: [
      {
        id: "l4",
        name: "Mediterranean buffet",
        description: "Tapas, fine charcuterie, antipasti, Italian cheeses, and seasonal salads.",
      },
      {
        id: "l5",
        name: "Gourmet bowl",
        description:
          "Quinoa, roasted chickpeas, grilled vegetables, crumbled feta, and herb vinaigrette.",
      },
    ],
    dinner: [
      {
        key: "starter",
        label: "Starter",
        maxChoices: 1,
        placeholder: "Choose your starter",
        options: [
          { id: "e4", name: "Scallop carpaccio, citrus" },
          { id: "e5", name: "Burrata, heirloom tomatoes, pesto" },
        ],
      },
      {
        key: "main",
        label: "Main",
        maxChoices: 1,
        placeholder: "Choose your main",
        options: [
          { id: "p4", name: "Roasted monkfish, crushed potatoes, beurre noisette" },
          { id: "p5", name: "Free-range chicken supreme, rich jus" },
        ],
      },
    ],
  },
];

function MenusTab() {
  const [dayIdx, setDayIdx] = useState(0);
  const [dietaryOpen, setDietaryOpen] = useState(true);
  // selections by day id
  const [lunchSel, setLunchSel] = useState<Record<string, string[]>>({
    d1: ["l1", "l2"],
  });
  const [dinnerSel, setDinnerSel] = useState<Record<string, Record<string, string[]>>>({});

  const day = DAYS[dayIdx];

  function toggleLunch(dayId: string, optId: string, max: number) {
    setLunchSel((prev) => {
      const cur = prev[dayId] ?? [];
      if (cur.includes(optId)) return { ...prev, [dayId]: cur.filter((x) => x !== optId) };
      if (cur.length >= max) return prev;
      return { ...prev, [dayId]: [...cur, optId] };
    });
  }

  function setCourseSel(dayId: string, courseKey: string, value: string[]) {
    setDinnerSel((prev) => ({
      ...prev,
      [dayId]: { ...(prev[dayId] ?? {}), [courseKey]: value },
    }));
  }

  return (
    <div className="max-w-6xl px-8 py-6 flex flex-col gap-5">
      <TabHeader
        subtitle="Choose meals and handle dietary needs."
        actions={
          <>
            <button
              type="button"
              onClick={() => setDayIdx((i) => Math.max(0, i - 1))}
              disabled={dayIdx === 0}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setDayIdx((i) => Math.min(DAYS.length - 1, i + 1))}
              disabled={dayIdx === DAYS.length - 1}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next day"
            >
              <ChevronRight size={14} />
            </button>
          </>
        }
      />

      {/* Dietary requirements */}
      <article className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setDietaryOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/60 transition-colors"
        >
          <h3 className="text-base font-semibold text-gray-900">Dietary requirements</h3>
          {dietaryOpen ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </button>
        {dietaryOpen && (
          <div className="border-t border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-2.5 w-44">
                    Count
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-2.5">
                    Dietary requirement
                  </th>
                </tr>
              </thead>
              <tbody>
                {DIETARY.map((row) => (
                  <tr key={row.label} className="border-t border-gray-100">
                    <td className="px-6 py-2.5 text-sm text-gray-700">
                      {row.count} participant{row.count !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-2.5 text-sm text-gray-700">{row.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {/* Lunch + Dinner side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Lunch */}
        <article className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-3">
          <header>
            <h3 className="text-base font-semibold text-gray-900">Lunch — {day.date}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Up to {day.lunchMaxChoices} choices</p>
          </header>
          <div className="flex flex-col gap-2">
            {day.lunch.map((opt) => {
              const cur = lunchSel[day.id] ?? [];
              const checked = cur.includes(opt.id);
              const capped = !checked && cur.length >= day.lunchMaxChoices;
              return (
                <label
                  key={opt.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 rounded-md border transition-colors cursor-pointer",
                    checked
                      ? "border-gray-300 bg-gray-50"
                      : capped
                        ? "border-gray-200 bg-white opacity-50 cursor-not-allowed"
                        : "border-gray-200 bg-white hover:bg-gray-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={capped}
                    onChange={() => toggleLunch(day.id, opt.id, day.lunchMaxChoices)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      checked
                        ? "bg-gray-900 border-gray-900 text-white"
                        : "border-gray-300 bg-white",
                    )}
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{opt.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {opt.description}
                    </p>
                    {opt.extras && opt.extras.length > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        {opt.extras.map((e) => `+ ${e}`).join("  ")}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </article>

        {/* Dinner */}
        <article className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-4">
          <header>
            <h3 className="text-base font-semibold text-gray-900">Dinner — {day.date}</h3>
          </header>
          <div className="flex flex-col gap-3">
            {day.dinner.map((course) => {
              const cur = dinnerSel[day.id]?.[course.key] ?? [];
              return (
                <DinnerCoursePicker
                  key={course.key}
                  course={course}
                  selected={cur}
                  onChange={(vals) => setCourseSel(day.id, course.key, vals)}
                />
              );
            })}
          </div>
        </article>
      </div>
    </div>
  );
}

function DinnerCoursePicker({
  course,
  selected,
  onChange,
}: {
  course: DinnerCourse;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const isSingle = course.maxChoices === 1;

  function toggle(id: string) {
    if (isSingle) {
      onChange(selected[0] === id ? [] : [id]);
      setOpen(false);
      return;
    }
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else if (selected.length < course.maxChoices) {
      onChange([...selected, id]);
    }
  }

  const labels = course.options
    .filter((o) => selected.includes(o.id))
    .map((o) => o.name)
    .join(", ");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-gray-700">{course.label}</span>
        <span className="text-xs text-gray-400">Up to {course.maxChoices} choices</span>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 bg-white hover:border-gray-400 transition-colors"
        >
          <span className={cn("truncate text-left", !labels && "text-gray-400")}>
            {labels || course.placeholder}
          </span>
          <ChevronDown
            size={14}
            className={cn("text-gray-400 transition-transform", open && "rotate-180")}
          />
        </button>
        {open && (
          <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-md py-1 max-h-64 overflow-y-auto">
            {course.options.map((opt) => {
              const checked = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggle(opt.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  {!isSingle && (
                    <span
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                        checked
                          ? "bg-gray-900 border-gray-900 text-white"
                          : "border-gray-300 bg-white",
                      )}
                    >
                      {checked && <Check size={11} strokeWidth={3} />}
                    </span>
                  )}
                  <span
                    className={cn(
                      "flex-1 text-gray-700",
                      isSingle && checked && "font-medium text-gray-900",
                    )}
                  >
                    {opt.name}
                  </span>
                  {isSingle && checked && <Check size={13} className="text-gray-900" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Schedule tab ──────────────────────────────────────────────────────────────

type EventColor = "blue" | "amber" | "violet" | "emerald";

interface ScheduleEvent {
  id: string;
  start: string; // "08:00"
  end: string; // "08:30"
  title: string;
  description?: string;
  color: EventColor;
}

interface ScheduleDay {
  id: string;
  label: string; // "Mercredi 13 Janvier 2026"
  events: ScheduleEvent[];
}

const COLOR_BAR: Record<EventColor, string> = {
  blue: "bg-blue-400",
  amber: "bg-amber-400",
  violet: "bg-violet-400",
  emerald: "bg-emerald-400",
};

const SCHEDULE: ScheduleDay[] = [
  {
    id: "d-2026-01-13",
    label: "Wednesday, January 13, 2026",
    events: [
      {
        id: "e1",
        start: "10:00",
        end: "12:00",
        title: "Check-in to rooms",
        color: "blue",
      },
      {
        id: "e2",
        start: "08:00",
        end: "08:30",
        title: "Breakfast",
        description: "Coffee, tea, water, juice, pastries and viennoiseries",
        color: "blue",
      },
      {
        id: "e3",
        start: "08:00",
        end: "08:30",
        title: "Workshop",
        description: "Q1 analytics review and Q2 goal setting",
        color: "amber",
      },
      {
        id: "e4",
        start: "08:00",
        end: "08:30",
        title: "Breakfast",
        description: "Coffee, tea, water, juice, pastries and viennoiseries",
        color: "blue",
      },
    ],
  },
  {
    id: "d-2026-01-14",
    label: "Thursday, January 14, 2026",
    events: [
      {
        id: "e5",
        start: "08:00",
        end: "08:30",
        title: "Breakfast",
        description:
          "Coffee, tea, water, juice, pastries, viennoiseries and a wide variety of small treats",
        color: "blue",
      },
      {
        id: "e6",
        start: "08:00",
        end: "08:30",
        title: "Workshop",
        description: "Q1 analytics review and Q2 goal setting",
        color: "amber",
      },
      {
        id: "e7",
        start: "08:00",
        end: "08:30",
        title: "Lunch",
        description: "Coffee, tea, water, juice, pastries and viennoiseries",
        color: "blue",
      },
    ],
  },
  {
    id: "d-2026-01-15",
    label: "Friday, January 15, 2026",
    events: [
      {
        id: "e8",
        start: "08:00",
        end: "08:30",
        title: "Breakfast",
        description: "Coffee, tea, water, juice, pastries and viennoiseries",
        color: "blue",
      },
      {
        id: "e9",
        start: "09:00",
        end: "12:00",
        title: "Team-building activity",
        description: "Outdoor activity",
        color: "amber",
      },
      {
        id: "e10",
        start: "12:30",
        end: "14:00",
        title: "Gastronomic lunch",
        description: "Michelin-starred seaside restaurant",
        color: "violet",
      },
      {
        id: "e11",
        start: "20:00",
        end: "23:00",
        title: "Gala evening",
        description: "Formal attire required",
        color: "emerald",
      },
    ],
  },
  {
    id: "d-2026-01-16",
    label: "Saturday, January 16, 2026",
    events: [
      {
        id: "e12",
        start: "08:00",
        end: "08:30",
        title: "Breakfast",
        description: "Coffee, tea, water, juice, pastries and viennoiseries",
        color: "blue",
      },
      {
        id: "e13",
        start: "11:00",
        end: "12:00",
        title: "Check-out",
        description: "Vacate rooms before 12:00",
        color: "amber",
      },
    ],
  },
];

function ScheduleTab() {
  return (
    <div className="max-w-6xl px-8 py-6 flex flex-col gap-5">
      <TabHeader
        subtitle="Plan the day-by-day agenda for participants."
        actions={
          <>
            <button className="text-sm border border-gray-200 rounded-md px-3.5 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              Export iCalendar (ICS)
            </button>
            <button className="flex items-center gap-1.5 text-sm bg-gray-900 text-white px-3.5 py-2 rounded-md hover:bg-gray-700 transition-colors">
              <Plus size={13} />
              Add an event
            </button>
          </>
        }
      />

      {/* Horizontal scroll of day columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {SCHEDULE.map((day) => (
          <div key={day.id} className="w-[360px] shrink-0 flex flex-col gap-3">
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-gray-900">{day.label}</p>
            </div>
            <div className="flex flex-col gap-2">
              {day.events.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
              {day.events.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">No events</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: ScheduleEvent }) {
  return (
    <article className="relative rounded-md border border-gray-200 bg-white pl-4 pr-3 py-3 hover:border-gray-300 transition-colors">
      <div
        className={cn("absolute left-0 top-2 bottom-2 w-1 rounded-r", COLOR_BAR[event.color])}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-700 tabular-nums">
            {event.start} - {event.end}
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.title}</p>
          {event.description && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{event.description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
              aria-label="More options"
            >
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              <Pencil size={13} className="mr-2 text-gray-500" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-700">
              <Trash2 size={13} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

// ── Basic information tab ─────────────────────────────────────────────────────

const PARTICIPANT_PROFILES = [
  "Mixed team",
  "Technical team",
  "Leadership",
  "Sales force",
  "All departments",
];

const LANGUAGES = ["English", "French", "Spanish", "Italian", "German"];

const PAYMENT_OPTIONS = [
  { id: "naboo", label: "Added to the Naboo invoice" },
  { id: "participant", label: "Paid by each participant" },
  { id: "onsite", label: "Paid by the on-site lead" },
] as const;
type PaymentOption = (typeof PAYMENT_OPTIONS)[number]["id"];

function InformationTab() {
  const [eventName, setEventName] = useState("Marketing team offsite");
  const [objective, setObjective] = useState("Have the best time possible");
  const [profile, setProfile] = useState(PARTICIPANT_PROFILES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [extras, setExtras] = useState<PaymentOption>("naboo");
  const [notifyInvite, setNotifyInvite] = useState(true);
  const [notifyAnnouncement, setNotifyAnnouncement] = useState(true);
  const [notifyFeedback, setNotifyFeedback] = useState(true);

  return (
    <div className="max-w-6xl px-8 py-6 flex flex-col gap-5">
      <TabHeader subtitle="Set up the basics of your event." />

      {/* Main info */}
      <section className="flex flex-col gap-5">
        <h2 className="text-base font-semibold text-gray-900">Main event information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <Field label="What would you like to name the event?">
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors"
            />
          </Field>

          <Field label="What is the objective of the event?">
            <input
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors"
            />
          </Field>

          <Field label="What is the participant profile?">
            <SelectInput value={profile} options={PARTICIPANT_PROFILES} onChange={setProfile} />
          </Field>

          <Field label="Primary language of the group">
            <SelectInput value={language} options={LANGUAGES} onChange={setLanguage} />
          </Field>
        </div>

        <Field label="Extras payment">
          <div className="flex flex-wrap gap-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setExtras(opt.id)}
                className={cn(
                  "text-sm px-4 py-2 rounded-md border transition-colors",
                  extras === opt.id
                    ? "border-gray-900 text-gray-900 font-medium bg-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
      </section>

      <hr className="border-gray-100" />

      {/* Notifications */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
        <div className="flex flex-col gap-3">
          <NotificationToggle
            label="Send invitation emails"
            checked={notifyInvite}
            onChange={setNotifyInvite}
          />
          <NotificationToggle
            label="Send organizer announcement emails"
            checked={notifyAnnouncement}
            onChange={setNotifyAnnouncement}
          />
          <NotificationToggle
            label="Send participant feedback emails"
            checked={notifyFeedback}
            onChange={setNotifyFeedback}
          />
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function SelectInput({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-gray-200 rounded-md px-3 py-2 pr-9 text-sm text-gray-700 bg-white outline-none focus:border-gray-400 transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

function NotificationToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-gray-900" : "bg-gray-200",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        >
          {checked && (
            <Check
              size={9}
              strokeWidth={3.5}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-900"
            />
          )}
        </span>
      </button>
    </label>
  );
}
