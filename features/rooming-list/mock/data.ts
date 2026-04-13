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

const p = (id: string) => mockParticipants.find((x) => x.id === id)!;

export const mockBuildings: Building[] = [
  {
    id: "b1",
    name: "Bâtiment principal",
    rooms: [
      {
        id: "r1",
        name: "Chambre Simple 1",
        bedDescription: "1 lit simple",
        privateBathroom: false,
        slots: [{ id: "s1", participant: p("p1") }],
      },
      {
        id: "r2",
        name: "Chambre Simple 2",
        bedDescription: "1 lit simple",
        privateBathroom: false,
        slots: [{ id: "s2", participant: p("p9") }],
      },
      {
        id: "r3",
        name: "Chambre Simple 3",
        bedDescription: "1 lit simple",
        privateBathroom: false,
        slots: [{ id: "s3" }],
      },
      {
        id: "r4",
        name: "Chambre Simple 4",
        bedDescription: "1 lit simple",
        privateBathroom: false,
        slots: [{ id: "s4", participant: p("p4") }],
      },
      {
        id: "r5",
        name: "Chambre Twin 1",
        bedDescription: "2 lits simples",
        privateBathroom: true,
        slots: [
          { id: "s5", participant: p("p12") },
          { id: "s6", participant: p("p3") },
        ],
      },
      {
        id: "r6",
        name: "Chambre Twin 2",
        bedDescription: "2 lits simples",
        privateBathroom: true,
        slots: [{ id: "s7", participant: p("p11") }, { id: "s8" }],
      },
      {
        id: "r7",
        name: "Chambre Familiale 1",
        bedDescription: "4 lits (2 simples + 1 double)",
        privateBathroom: true,
        slots: [
          { id: "s9", participant: p("p5") },
          { id: "s10", participant: p("p6") },
          { id: "s11", participant: p("p2") },
          { id: "s12" },
        ],
      },
    ],
  },
  {
    id: "b2",
    name: "Bâtiment secondaire",
    rooms: [
      {
        id: "r8",
        name: "Chambre Double 1",
        bedDescription: "1 lit double",
        privateBathroom: true,
        slots: [{ id: "s13", participant: p("p13") }, { id: "s14" }],
      },
      {
        id: "r9",
        name: "Chambre Double 2",
        bedDescription: "1 lit double",
        privateBathroom: false,
        slots: [{ id: "s15" }, { id: "s16" }],
      },
    ],
  },
];
