import type { Building, Participant } from "../types";

export const mockParticipants: Participant[] = [
  { id: "p1", name: "Lucie Bernard", isVip: true },
  { id: "p2", name: "Chloé Moreau", isPmr: true },
  { id: "p3", name: "Antoine Dubois" },
  { id: "p4", name: "Camille Rousseau", isPmr: true },
  { id: "p5", name: "Gabriel Petit" },
  { id: "p6", name: "Émile Lefèvre" },
  { id: "p7", name: "Sophie Martin" },
  { id: "p8", name: "Clara Fontaine" },
  { id: "p9", name: "Maxime Leroy", isVip: true },
  { id: "p10", name: "Juliette Garnier" },
  { id: "p11", name: "Marc Saulnier" },
  { id: "p12", name: "Caroline Mercier" },
  { id: "p13", name: "Pierre Nolan" },
  { id: "p14", name: "Amina Derecki", isPmr: true },
  { id: "p15", name: "Mia Chen", isLateArrival: true },
  { id: "p16", name: "Rayan Okafor", isLateArrival: true },
];

// ── Shared photo pool — keyed by room name for consistency across mock datasets

const roomPhotos: Record<string, string> = {
  "Twin Room 1": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  "Twin Room 2": "https://images.unsplash.com/photo-1587985064135-0366536eab42?w=600&q=80",
  "Twin Room 3": "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600&q=80",
  "Twin Room 4": "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=600&q=80",
  "Twin Room 5": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  "Twin Room 6": "https://images.unsplash.com/photo-1587985064135-0366536eab42?w=600&q=80",
  "Twin Room 7": "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=600&q=80",
  "Twin Room 8": "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=600&q=80",
  "Double Room 1": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
  "Triple Room 1": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80",
  "Triple Room 2": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
};

function photo(name: string): string {
  return (
    roomPhotos[name] ?? "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"
  );
}

// ── Admin view mock (no pre-assignments) ──────────────────────────────────────

export const mockBuildings: Building[] = [
  {
    id: "b1",
    name: "Main building",
    rooms: [
      {
        id: "r1",
        name: "Twin Room 1",
        photoUrl: photo("Twin Room 1"),
        bedDescription: "2 single beds",
        privateBathroom: false,
        slots: [{ id: "s1" }, { id: "s2" }],
      },
      {
        id: "r2",
        name: "Twin Room 2",
        photoUrl: photo("Twin Room 2"),
        bedDescription: "2 single beds",
        privateBathroom: false,
        slots: [{ id: "s3" }, { id: "s4" }],
      },
      {
        id: "r3",
        name: "Twin Room 3",
        photoUrl: photo("Twin Room 3"),
        bedDescription: "2 single beds",
        privateBathroom: false,
        slots: [{ id: "s5" }, { id: "s6" }],
      },
      {
        id: "r4",
        name: "Twin Room 4",
        photoUrl: photo("Twin Room 4"),
        bedDescription: "2 single beds",
        privateBathroom: true,
        slots: [{ id: "s7" }, { id: "s8" }],
      },
      {
        id: "r5",
        name: "Twin Room 5",
        photoUrl: photo("Twin Room 5"),
        bedDescription: "2 single beds",
        privateBathroom: true,
        slots: [{ id: "s9" }, { id: "s10" }],
      },
      {
        id: "r6",
        name: "Double Room 1",
        photoUrl: photo("Double Room 1"),
        bedDescription: "1 double bed",
        privateBathroom: true,
        slots: [{ id: "s11" }, { id: "s12" }],
      },
    ],
  },
  {
    id: "b2",
    name: "Annex",
    rooms: [
      {
        id: "r7",
        name: "Twin Room 6",
        photoUrl: photo("Twin Room 6"),
        bedDescription: "2 single beds",
        privateBathroom: false,
        slots: [{ id: "s13" }, { id: "s14" }],
      },
      {
        id: "r8",
        name: "Twin Room 7",
        photoUrl: photo("Twin Room 7"),
        bedDescription: "2 single beds",
        privateBathroom: false,
        slots: [{ id: "s15" }, { id: "s16" }],
      },
      {
        id: "r9",
        name: "Twin Room 8",
        photoUrl: photo("Twin Room 8"),
        bedDescription: "2 single beds",
        privateBathroom: true,
        slots: [{ id: "s17" }, { id: "s18" }],
      },
      {
        id: "r10",
        name: "Triple Room 1",
        photoUrl: photo("Triple Room 1"),
        bedDescription: "3 single beds",
        privateBathroom: false,
        slots: [{ id: "s19" }, { id: "s20" }, { id: "s21" }],
      },
      {
        id: "r11",
        name: "Triple Room 2",
        photoUrl: photo("Triple Room 2"),
        bedDescription: "3 single beds",
        privateBathroom: false,
        slots: [{ id: "s22" }, { id: "s23" }, { id: "s24" }],
      },
    ],
  },
];

// ── Participant view mock (partially assigned, plenty of space) ───────────────

const p = mockParticipants;
export const mockBuildingsAssigned: Building[] = [
  {
    id: "b1",
    name: "Main building",
    rooms: [
      {
        id: "r1",
        name: "Twin Room 1",
        photoUrl: photo("Twin Room 1"),
        bedDescription: "2 single beds",
        privateBathroom: false,
        slots: [{ id: "s1", participant: p[2] }, { id: "s2" }], // Antoine + empty
      },
      {
        id: "r2",
        name: "Twin Room 2",
        photoUrl: photo("Twin Room 2"),
        bedDescription: "2 single beds",
        privateBathroom: false,
        slots: [{ id: "s3", participant: p[4] }, { id: "s4" }], // Gabriel + empty
      },
      {
        id: "r3",
        name: "Twin Room 3",
        photoUrl: photo("Twin Room 3"),
        bedDescription: "2 single beds",
        privateBathroom: false,
        slots: [{ id: "s5" }, { id: "s6" }], // fully empty
      },
      {
        id: "r4",
        name: "Twin Room 4",
        photoUrl: photo("Twin Room 4"),
        bedDescription: "2 single beds",
        privateBathroom: true,
        slots: [{ id: "s7", participant: p[0] }, { id: "s8" }], // Lucie VIP + empty
      },
      {
        id: "r5",
        name: "Twin Room 5",
        photoUrl: photo("Twin Room 5"),
        bedDescription: "2 single beds",
        privateBathroom: true,
        slots: [{ id: "s9" }, { id: "s10" }], // fully empty
      },
      {
        id: "r6",
        name: "Double Room 1",
        photoUrl: photo("Double Room 1"),
        bedDescription: "1 double bed",
        privateBathroom: true,
        slots: [
          { id: "s11", participant: p[8] },
          { id: "s12", participant: p[12] },
        ], // Maxime VIP + Pierre (full)
      },
    ],
  },
  {
    id: "b2",
    name: "Annex",
    rooms: [
      {
        id: "r7",
        name: "Twin Room 6",
        photoUrl: photo("Twin Room 6"),
        bedDescription: "2 single beds",
        privateBathroom: false,
        slots: [{ id: "s13", participant: p[5] }, { id: "s14" }], // Émile + empty
      },
      {
        id: "r8",
        name: "Twin Room 7",
        photoUrl: photo("Twin Room 7"),
        bedDescription: "2 single beds",
        privateBathroom: false,
        slots: [{ id: "s15" }, { id: "s16" }], // fully empty
      },
      {
        id: "r9",
        name: "Twin Room 8",
        photoUrl: photo("Twin Room 8"),
        bedDescription: "2 single beds",
        privateBathroom: true,
        slots: [{ id: "s17", participant: p[1] }, { id: "s18" }], // Chloé PMR + empty
      },
      {
        id: "r10",
        name: "Triple Room 1",
        photoUrl: photo("Triple Room 1"),
        bedDescription: "3 single beds",
        privateBathroom: false,
        slots: [{ id: "s19", participant: p[6] }, { id: "s20" }, { id: "s21" }], // Sophie + 2 empty
      },
      {
        id: "r11",
        name: "Triple Room 2",
        photoUrl: photo("Triple Room 2"),
        bedDescription: "3 single beds",
        privateBathroom: false,
        slots: [{ id: "s22" }, { id: "s23" }, { id: "s24" }], // fully empty
      },
    ],
  },
];
