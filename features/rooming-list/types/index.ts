export interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  isPmr?: boolean; // reduced mobility
  isLateArrival?: boolean;
  avatarUrl?: string;
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
  photoUrl?: string;
}

export interface Building {
  id: string;
  name: string;
  isLateArrival?: boolean;
  rooms: Room[];
}

export type ParticipantFilter = "all" | "vip" | "pmr";
