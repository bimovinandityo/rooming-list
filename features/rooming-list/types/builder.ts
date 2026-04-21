export interface BedTypeEntry {
  id: string;
  type: string;
  count: number;
}

export interface RoomTemplate {
  id: string;
  name: string;
  bedTypes: BedTypeEntry[];
  privateBathroom: boolean;
  count: number;
  photoUrl?: string;
}

export interface BuildingTemplate {
  id: string;
  name: string;
  rooms: RoomTemplate[];
}
