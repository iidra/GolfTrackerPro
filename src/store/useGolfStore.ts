import { create } from 'zustand';
import { GolfRound, GolfShot, GolfHole, Position, GreenArea, Obstacle, SetupMode } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'golftracker_rounds';

// Load initial rounds from localStorage
const loadStoredRounds = (): GolfRound[] => {
  try {
    const storedRounds = localStorage.getItem(STORAGE_KEY);
    return storedRounds ? JSON.parse(storedRounds) : [];
  } catch (error) {
    console.error('Error loading rounds from localStorage:', error);
    return [];
  }
};

interface GolfState {
  currentRound: GolfRound | null;
  rounds: GolfRound[];
  activeHole: number;
  setupMode: SetupMode;
  selectedHistoricalRound: GolfRound | null;
  startNewRound: (courseName: string) => void;
  addShot: (holeNumber: number, shot: Omit<GolfShot, 'id'>) => void;
  completeHole: (holeNumber: number, score: number) => void;
  completeRound: () => void;
  setActiveHole: (holeNumber: number) => void;
  setSetupMode: (mode: SetupMode) => void;
  setTeePosition: (holeNumber: number, position: Position) => void;
  setHolePosition: (holeNumber: number, position: Position) => void;
  setGreenArea: (holeNumber: number, greenArea: GreenArea) => void;
  addObstacle: (holeNumber: number, obstacle: Omit<Obstacle, 'id'>) => void;
  removeObstacle: (holeNumber: number, obstacleId: string) => void;
  selectHistoricalRound: (roundId: string | null) => void;
}

export const useGolfStore = create<GolfState>((set, get) => ({
  currentRound: null,
  rounds: loadStoredRounds(),
  activeHole: 1,
  setupMode: null,
  selectedHistoricalRound: null,

  startNewRound: (courseName: string) => {
    const newRound: GolfRound = {
      id: uuidv4(),
      courseName,
      date: new Date(),
      holes: Array.from({ length: 18 }, (_, i) => ({
        id: uuidv4(),
        number: i + 1,
        par: 4,
        teePosition: { latitude: 0, longitude: 0 },
        holePosition: { latitude: 0, longitude: 0 },
        obstacles: [],
        shots: [],
      })),
      totalScore: 0,
      completed: false,
    };
    set({ currentRound: newRound, activeHole: 1 });
  },

  addShot: (holeNumber: number, shotData) => {
    set((state) => {
      if (!state.currentRound) return state;

      const updatedHoles = state.currentRound.holes.map((hole) => {
        if (hole.number === holeNumber) {
          return {
            ...hole,
            shots: [
              ...hole.shots,
              {
                ...shotData,
                id: uuidv4(),
              },
            ],
          };
        }
        return hole;
      });

      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          holes: updatedHoles,
        },
      };
    });
  },

  completeHole: (holeNumber: number, score: number) => {
    set((state) => {
      if (!state.currentRound) return state;

      const updatedHoles = state.currentRound.holes.map((hole) => {
        if (hole.number === holeNumber) {
          return { ...hole, score };
        }
        return hole;
      });

      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          holes: updatedHoles,
        },
      };
    });
  },

  completeRound: () => {
    set((state) => {
      if (!state.currentRound) return state;

      const completedRound = {
        ...state.currentRound,
        completed: true,
        totalScore: state.currentRound.holes.reduce(
          (total, hole) => total + (hole.score || 0),
          0
        ),
      };

      const updatedRounds = [completedRound, ...state.rounds];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRounds));
      } catch (error) {
        console.error('Error saving rounds to localStorage:', error);
      }

      return {
        currentRound: null,
        rounds: updatedRounds,
        activeHole: 1,
      };
    });
  },

  setActiveHole: (holeNumber: number) => {
    set({ activeHole: holeNumber });
  },

  setSetupMode: (mode: SetupMode) => {
    set({ setupMode: mode });
  },

  setTeePosition: (holeNumber, position) => {
    set((state) => {
      if (!state.currentRound) return state;

      const updatedHoles = state.currentRound.holes.map((hole) => {
        if (hole.number === holeNumber) {
          return {
            ...hole,
            teePosition: position,
          };
        }
        return hole;
      });

      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          holes: updatedHoles,
        },
      };
    });
  },

  setHolePosition: (holeNumber, position) => {
    set((state) => {
      if (!state.currentRound) return state;

      const updatedHoles = state.currentRound.holes.map((hole) => {
        if (hole.number === holeNumber) {
          return {
            ...hole,
            holePosition: position,
          };
        }
        return hole;
      });

      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          holes: updatedHoles,
        },
      };
    });
  },

  setGreenArea: (holeNumber, greenArea) => {
    set((state) => {
      if (!state.currentRound) return state;

      const updatedHoles = state.currentRound.holes.map((hole) => {
        if (hole.number === holeNumber) {
          return {
            ...hole,
            greenArea,
          };
        }
        return hole;
      });

      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          holes: updatedHoles,
        },
      };
    });
  },

  addObstacle: (holeNumber, obstacleData) => {
    set((state) => {
      if (!state.currentRound) return state;

      const updatedHoles = state.currentRound.holes.map((hole) => {
        if (hole.number === holeNumber) {
          return {
            ...hole,
            obstacles: [
              ...hole.obstacles,
              {
                ...obstacleData,
                id: uuidv4(),
              },
            ],
          };
        }
        return hole;
      });

      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          holes: updatedHoles,
        },
      };
    });
  },

  removeObstacle: (holeNumber, obstacleId) => {
    set((state) => {
      if (!state.currentRound) return state;

      const updatedHoles = state.currentRound.holes.map((hole) => {
        if (hole.number === holeNumber) {
          return {
            ...hole,
            obstacles: hole.obstacles.filter((obs) => obs.id !== obstacleId),
          };
        }
        return hole;
      });

      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          holes: updatedHoles,
        },
      };
    });
  },

  selectHistoricalRound: (roundId) => {
    set((state) => ({
      selectedHistoricalRound: roundId ? state.rounds.find(r => r.id === roundId) || null : null,
      activeHole: 1
    }));
  },
}));
