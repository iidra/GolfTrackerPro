export interface GolfShot {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface Position {
  latitude: number;
  longitude: number;
}

export interface GreenArea {
  center: Position;
  radius: number; // in meters
}

export interface Obstacle {
  id: string;
  type: 'water' | 'bunker' | 'trees' | 'out-of-bounds';
  position: Position;
  name?: string;
  distanceToHole?: number;
}

export interface GolfHole {
  id: string;
  number: number;
  par: number;
  teePosition: Position;
  holePosition: Position;
  greenArea?: GreenArea;
  obstacles: Obstacle[];
  shots: GolfShot[];
  score?: number;
}

export interface GolfRound {
  id: string;
  courseName: string;
  date: Date;
  holes: GolfHole[];
  totalScore: number;
  completed: boolean;
}
