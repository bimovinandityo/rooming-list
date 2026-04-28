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
  /** First room number; subsequent rooms are numbered consecutively. Optional. */
  startNumber?: number;
  floor?: number;
  vipOnly?: boolean;
  photos?: string[];
  primaryPhotoIndex?: number;
}

export interface BuildingTemplate {
  id: string;
  name: string;
  rooms: RoomTemplate[];
}
