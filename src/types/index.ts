export interface GolfShot {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  club?: string;
  notes?: string;
  distance?: number;
}

export interface GolfHole {
  id: string;
  number: number;
  par: number;
  teePosition: {
    latitude: number;
    longitude: number;
  };
  holePosition: {
    latitude: number;
    longitude: number;
  };
  shots: GolfShot[];
}

export interface GolfRound {
  id: string;
  courseName: string;
  date: Date;
  holes: GolfHole[];
  totalScore: number;
  completed: boolean;
}

export interface Hazard {
  id: string;
  type: 'water' | 'bunker' | 'trees' | 'outOfBounds';
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
}
