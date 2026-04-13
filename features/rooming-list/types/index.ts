export interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  isPmr?: boolean; // reduced mobility
  isLateArrival?: boolean;
}

export interface RoomSlot {
  id: string;
  participant?: Participant;
}

export interface Room {
  id: string;
  name: string;
  bedDescription: string;
  privateBathroom: boolean;
  slots: RoomSlot[];
}

export interface Building {
  id: string;
  name: string;
  isLateArrival?: boolean;
  rooms: Room[];
}

export type ParticipantFilter = "all" | "vip" | "pmr";
