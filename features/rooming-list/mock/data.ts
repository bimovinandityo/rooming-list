import type { Building, Participant } from "../types";

export const EVENT_CHECK_IN_DATE = "2026-06-10";
export const EVENT_CHECK_OUT_DATE = "2026-06-15"; // 5-night event
export const EVENT_CHECK_IN_TIME = "14:00";
export const EVENT_CHECK_OUT_TIME = "11:00";

// ── Seeded LCG RNG — deterministic across runs ────────────────────────────────
function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ── Name pools ────────────────────────────────────────────────────────────────
const FIRST_M = [
  "Antoine",
  "Lucas",
  "Thomas",
  "Nicolas",
  "Hugo",
  "Maxime",
  "Guillaume",
  "Pierre",
  "François",
  "Alexandre",
  "Julien",
  "Romain",
  "Théo",
  "Clément",
  "Louis",
  "Mathieu",
  "Vincent",
  "Baptiste",
  "Adrien",
  "Arthur",
  "Léo",
  "Gabriel",
  "Ethan",
  "Paul",
  "Simon",
  "Florian",
  "Xavier",
  "Cyril",
  "Marc",
  "Damien",
  "Alexis",
  "Rémi",
];
const FIRST_F = [
  "Lucie",
  "Emma",
  "Camille",
  "Sophie",
  "Clara",
  "Marie",
  "Juliette",
  "Charlotte",
  "Alice",
  "Manon",
  "Léa",
  "Chloé",
  "Céline",
  "Amélia",
  "Laura",
  "Sarah",
  "Océane",
  "Inès",
  "Margot",
  "Valentine",
  "Anaïs",
  "Mathilde",
  "Pauline",
  "Elisa",
  "Julie",
  "Amélie",
  "Noémie",
  "Raphaëlle",
  "Constance",
  "Jade",
  "Zoé",
  "Elena",
];
const LAST = [
  "Bernard",
  "Moreau",
  "Dubois",
  "Rousseau",
  "Petit",
  "Lefèvre",
  "Martin",
  "Fontaine",
  "Leroy",
  "Garnier",
  "Saulnier",
  "Mercier",
  "Nolan",
  "Derecki",
  "Chen",
  "Okafor",
  "Lambert",
  "Simon",
  "Michel",
  "Leclerc",
  "Robin",
  "Blanc",
  "Guérin",
  "Morin",
  "Perez",
  "Roux",
  "Faure",
  "Girard",
  "Bonnet",
  "Dupont",
  "Legrand",
  "Marchand",
  "Roy",
  "Renaud",
  "Laurent",
  "Perrot",
  "Brunet",
  "Richard",
  "Aubert",
  "Gautier",
  "Henry",
  "Renard",
  "Dupuis",
  "Pichon",
  "Charron",
  "Lemaire",
  "Masson",
  "Leclercq",
  "Laporte",
  "Chevalier",
  "Moulin",
  "Fernandez",
  "Garcia",
  "Gonzalez",
  "Muller",
  "Weber",
  "Nguyen",
  "Diallo",
  "Tremblay",
  "Beaumont",
];

// ── Participant generator ─────────────────────────────────────────────────────
// Distribution:
//   ~8% VIP, ~5% accessibility (non-VIP)
//   ~30% arrive on day 2 (Jun 11) or leave on day 4 (Jun 13) or day 5 (Jun 14)
//   ~30% of all participants have early check-in or late check-out (time flag, independent of date)
function generateParticipants(): Participant[] {
  const rng = mkRng(42);
  const participants: Participant[] = [];

  for (let i = 0; i < 200; i++) {
    const gender: "M" | "F" = rng() < 0.5 ? "M" : "F";
    const pool = gender === "M" ? FIRST_M : FIRST_F;
    const firstName = pool[Math.floor(rng() * pool.length)];
    const lastName = LAST[Math.floor(rng() * LAST.length)];

    const isVip = rng() < 0.08;
    const isAccessibility = !isVip && rng() < 0.05;

    // ~10% have a non-standard check-in or check-out date
    let checkInDate = EVENT_CHECK_IN_DATE;
    let checkOutDate = EVENT_CHECK_OUT_DATE;
    if (rng() < 0.1) {
      const v = rng();
      if (v < 0.35) {
        checkInDate = "2026-06-11"; // arrives day 2
      } else if (v < 0.65) {
        checkOutDate = "2026-06-13"; // leaves day 4
      } else if (v < 0.85) {
        checkOutDate = "2026-06-14"; // leaves day 5
      } else {
        checkInDate = "2026-06-11";
        checkOutDate = "2026-06-13"; // both
      }
    }

    // ~15% of all participants have an early check-in or late check-out time flag
    // (independent of date — this is about the time of day, not the date itself)
    let isEarlyCheckIn: true | undefined;
    let isLateCheckOut: true | undefined;
    if (rng() < 0.15) {
      if (rng() < 0.5) isEarlyCheckIn = true;
      else isLateCheckOut = true;
    }

    participants.push({
      id: `p${i + 1}`,
      name: `${firstName} ${lastName}`,
      gender,
      isVip: isVip || undefined,
      isAccessibility: isAccessibility || undefined,
      checkInDate,
      checkOutDate,
      isEarlyCheckIn,
      isLateCheckOut,
    });
  }

  return participants;
}

export const mockParticipants = generateParticipants();

// ── Photo pool ────────────────────────────────────────────────────────────────
const PHOTOS = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  "https://images.unsplash.com/photo-1587985064135-0366536eab42?w=600&q=80",
  "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600&q=80",
  "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=600&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
];

// ── Building generator ────────────────────────────────────────────────────────
// 4 buildings, ~212 total slots — enough for 200 participants with some buffer.
// Main Building: 80 slots (floors 1–3, incl. VIP wing on floor 3)
// Annex A: 59 slots (floors 1–2)
// Annex B: 48 slots (floors 1–2)
// Garden Lodge: 25 slots (floor 1)
function generateBuildings(): Building[] {
  let rid = 1;
  let sid = 1;
  let photoIdx = 0;
  // Global counters per room type — names match the builder's naming convention
  let twinN = 0,
    tripleN = 0,
    vipN = 0,
    suiteN = 0;
  const photo = () => PHOTOS[photoIdx++ % PHOTOS.length];

  const twin = (floor: number, privateBathroom: boolean) => ({
    id: `r${rid++}`,
    name: `Twin room ${++twinN}`,
    bedDescription: "2 single beds",
    privateBathroom,
    floor,
    photoUrl: photo(),
    slots: [{ id: `s${sid++}` }, { id: `s${sid++}` }],
  });

  const vipTwin = (floor: number) => ({
    id: `r${rid++}`,
    name: `VIP room ${++vipN}`,
    bedDescription: "2 single beds",
    privateBathroom: true,
    floor,
    vipOnly: true as const,
    photoUrl: photo(),
    slots: [{ id: `s${sid++}` }, { id: `s${sid++}` }],
  });

  const triple = (floor: number, privateBathroom: boolean) => ({
    id: `r${rid++}`,
    name: `Triple room ${++tripleN}`,
    bedDescription: "3 single beds",
    privateBathroom,
    floor,
    photoUrl: photo(),
    slots: [{ id: `s${sid++}` }, { id: `s${sid++}` }, { id: `s${sid++}` }],
  });

  const suite = (floor: number) => ({
    id: `r${rid++}`,
    name: `Suite ${++suiteN}`,
    bedDescription: "1 king bed",
    privateBathroom: true,
    floor,
    vipOnly: true as const,
    photoUrl: photo(),
    slots: [{ id: `s${sid++}` }, { id: `s${sid++}` }],
  });

  return [
    {
      id: "b1",
      name: "Main Building",
      rooms: [
        // Floor 1 — standard, shared bathrooms
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        triple(1, false),
        triple(1, false),
        triple(1, false),
        // Floor 2 — private bathrooms
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        triple(2, true),
        triple(2, true),
        triple(2, true),
        // Floor 3 — VIP wing
        vipTwin(3),
        vipTwin(3),
        vipTwin(3),
        vipTwin(3),
        vipTwin(3),
        suite(3),
        suite(3),
      ],
    },
    {
      id: "b2",
      name: "Annex A",
      rooms: [
        // Floor 1
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        triple(1, false),
        triple(1, false),
        triple(1, false),
        // Floor 2
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        triple(2, true),
        triple(2, true),
      ],
    },
    {
      id: "b3",
      name: "Annex B",
      rooms: [
        // Floor 1
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        triple(1, false),
        triple(1, false),
        // Floor 2
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        twin(2, true),
        triple(2, true),
        triple(2, true),
      ],
    },
    {
      id: "b4",
      name: "Garden Lodge",
      rooms: [
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        twin(1, false),
        triple(1, false),
        triple(1, false),
        triple(1, false),
      ],
    },
  ];
}

// ── Admin view mock (no pre-assignments) ──────────────────────────────────────
export const mockBuildings = generateBuildings();

// ── Participant view mock (all 200 assigned; 212 slots so 12 remain empty) ────
export const mockBuildingsAssigned: Building[] = (() => {
  const buildings = generateBuildings();
  const rng = mkRng(99);
  // Shuffle participants so the distribution across buildings feels natural
  const shuffled = [...mockParticipants];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let pi = 0;
  for (const b of buildings) {
    for (const r of b.rooms) {
      for (const s of r.slots) {
        if (pi < shuffled.length) {
          s.participant = shuffled[pi++];
        }
      }
    }
  }
  return buildings;
})();
