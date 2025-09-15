
export interface Fraktion {
  id: string;
  name: string;
  seats: number;
  color?: string;
}

// FIX: Add missing Zaehlgemeinschaft interface to resolve import error.
export interface Zaehlgemeinschaft {
  id: string;
  name: string;
  memberIds: string[];
}

export interface BerechnungsPartei {
  id: string;
  name: string;
  seats: number;
  members?: string[];
  color?: string;
}

export interface BerechnungsErgebnis {
  rank: number;
  partyName: string;
  value: number;
  divisor: number;
  isTie: boolean;
}