import { Flag, LandPlot, Save } from 'lucide-react';
import { useGolfStore } from '../../store/useGolfStore';

export default function ActiveRound() {
  const { currentRound, activeHole, setActiveHole, completeHole, completeRound } = useGolfStore();

  if (!currentRound) return null;

  const currentHole = currentRound.holes[activeHole - 1];
  const shotCount = currentHole.shots.length;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <LandPlot className="w-5 h-5 text-green-600" />
              <span className="text-lg font-semibold">
                Hole {activeHole}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Flag className="w-5 h-5 text-red-600" />
              <span className="text-lg">
                Shots: {shotCount}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <select
              className="border rounded px-3 py-2 w-full sm:w-auto"
              value={activeHole}
              onChange={(e) => setActiveHole(Number(e.target.value))}
            >
              {currentRound.holes.map((hole) => (
                <option key={hole.id} value={hole.number}>
                  Hole {hole.number}
                </option>
              ))}
            </select>

            <button
              onClick={() => completeHole(activeHole, shotCount)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              <span>Save Hole</span>
            </button>

            <button
              onClick={completeRound}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
            >
              Complete Round
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
