export interface Participant {
  id: string;
  name: string;
  gender?: "M" | "F";
  isVip?: boolean;
  isAccessibility?: boolean;
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
  floor?: number;
  vipOnly?: boolean;
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
