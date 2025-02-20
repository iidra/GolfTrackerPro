import { format } from 'date-fns';
import { Calendar, Flag, Map, X } from 'lucide-react';
import { useGolfStore } from '../../store/useGolfStore';
import GolfMap from '../Map/GolfMap';
import { useState } from 'react';
import { calculateDistance, formatDistance } from '../../utils/distance';
import { GolfShot } from '../../types';

export default function RoundHistory() {
  const { rounds, selectedHistoricalRound, selectHistoricalRound, setActiveHole } = useGolfStore();
  const [selectedHole, setSelectedHole] = useState(1);
  const [showMap, setShowMap] = useState(false);

  const handleHoleClick = (holeNumber: number) => {
    setSelectedHole(holeNumber);
    setActiveHole(holeNumber);
    setShowMap(true);
  };

  if (rounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Flag className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No rounds played yet</h2>
        <p className="text-gray-500">Start a new round to begin tracking your golf game</p>
      </div>
    );
  }

  if (selectedHistoricalRound) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row">
        {/* Details Panel */}
        <div className={`
          ${showMap ? 'hidden md:block md:w-1/3' : 'w-full md:w-1/3'}
          overflow-y-auto border-r border-gray-200 p-4
        `}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Round Details</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMap(!showMap)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                title={showMap ? "Show details" : "Show map"}
              >
                <Map className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  selectHistoricalRound(null);
                  setShowMap(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Back to history"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-xl font-semibold">{selectedHistoricalRound.courseName}</h2>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{format(new Date(selectedHistoricalRound.date), 'MMM d, yyyy')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600">Total Score</span>
              <span className="text-2xl font-bold">{selectedHistoricalRound.totalScore}</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Hole Scores</h3>
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1">
                {selectedHistoricalRound.holes.slice(0, 18).map((hole) => (
                  <div
                    key={hole.id}
                    className={`
                      p-2 text-center rounded cursor-pointer
                      ${selectedHole === hole.number
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'}
                    `}
                    onClick={() => handleHoleClick(hole.number)}
                  >
                    <div className="text-xs">{hole.number}</div>
                    <div className="font-semibold">{hole.score || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current hole details */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">Hole {selectedHole} Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Score</span>
                <span className="font-semibold">
                  {selectedHistoricalRound.holes[selectedHole - 1].score || 'Not completed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shots</span>
                <span className="font-semibold">
                  {selectedHistoricalRound.holes[selectedHole - 1].shots.length}
                </span>
              </div>
            </div>

            {/* Shot distances */}
            {selectedHistoricalRound.holes[selectedHole - 1].shots.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Shot Distances</h4>
                <div className="space-y-2">
                  {selectedHistoricalRound.holes[selectedHole - 1].shots.map((shot, index, shots) => {
                    let distance = '';

                    if (index === 0 && selectedHistoricalRound.holes[selectedHole - 1].teePosition) {
                      // Distance from tee to first shot
                      distance = formatDistance(
                        calculateDistance(
                          selectedHistoricalRound.holes[selectedHole - 1].teePosition!,
                          { latitude: shot.latitude, longitude: shot.longitude }
                        )
                      );
                    } else if (index > 0) {
                      // Distance from previous shot
                      distance = formatDistance(
                        calculateDistance(
                          { latitude: shots[index - 1].latitude, longitude: shots[index - 1].longitude },
                          { latitude: shot.latitude, longitude: shot.longitude }
                        )
                      );
                    }

                    // Calculate distance to hole for the last shot
                    let distanceToHole = '';
                    if (index === shots.length - 1 && selectedHistoricalRound.holes[selectedHole - 1].holePosition) {
                      distanceToHole = formatDistance(
                        calculateDistance(
                          { latitude: shot.latitude, longitude: shot.longitude },
                          selectedHistoricalRound.holes[selectedHole - 1].holePosition!
                        )
                      );
                    }

                    return (
                      <div
                        key={shot.id}
                        className="bg-gray-50 rounded p-2 text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Shot {index + 1}</span>
                          {distance && (
                            <span className="text-gray-600">
                              {index === 0 ? 'From tee: ' : 'From previous: '}
                              {distance}
                            </span>
                          )}
                        </div>
                        {distanceToHole && (
                          <div className="flex justify-between items-center mt-1 text-green-600">
                            <span>To hole:</span>
                            <span>{distanceToHole}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Panel */}
        <div className={`
          ${showMap ? 'block' : 'hidden md:block'}
          flex-1 relative h-full md:h-auto
        `}>
          <GolfMap />
          <button
            onClick={() => setShowMap(false)}
            className="md:hidden absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            title="Show details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Round History</h1>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {rounds.map((round) => (
          <div
            key={round.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => selectHistoricalRound(round.id)}
          >
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
                <h2 className="text-lg font-semibold">{round.courseName}</h2>
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{format(new Date(round.date), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Total Score</span>
                <span className="text-xl font-bold">{round.totalScore}</span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1">
                {round.holes.slice(0, 18).map((hole) => (
                  <div
                    key={hole.id}
                    className="bg-gray-100 p-1 text-center rounded"
                  >
                    <div className="text-xs text-gray-600">{hole.number}</div>
                    <div className="font-semibold text-sm">{hole.score || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
