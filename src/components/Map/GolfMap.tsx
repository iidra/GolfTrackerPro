import { useCallback, useEffect, useState, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline, Circle, InfoWindow } from '@react-google-maps/api';
import { useGolfStore } from '../../store/useGolfStore';
import { GolfShot, Position, Obstacle } from '../../types';
import { Flag, Droplet, Trees, Warning } from 'lucide-react';
import { calculateDistance, formatDistance } from '../../utils/distance';
import PlacesSearchBar from './PlacesSearchBar';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

interface MapOptions {
  disableDefaultUI: boolean;
  zoomControl: boolean;
  mapTypeId: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  mapTypeControl: boolean;
  mapTypeControlOptions: {
    position: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    style: 0 | 1 | 2;
    //mapTypeIds: Array<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>
  }
}

const options: MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeId: 'satellite',
  mapTypeControl: true,
  /* mapTypeControlOptions: {
     position: 3, // TOP_LEFT
     style: 2, // DROPDOWN_MENU
     //mapTypeIds: ['roadmap', 'satellite']
   }*/
};

const obstacleIcons = {
  'water': '🌊',
  'bunker': '⛳',
  'trees': '🌳',
  'out-of-bounds': '⚠️'
}

export default function GolfMap() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries as ['places'],
  });

  const {
    currentRound,
    activeHole,
    setupMode,
    selectedHistoricalRound,
    addShot,
    setTeePosition,
    setHolePosition,
    setGreenArea,
    addObstacle,
    completeHole,
    setSetupMode,
  } = useGolfStore();

  const [center, setCenter] = useState({ lat: 43.45, lng: -80.49 });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [drawingGreen, setDrawingGreen] = useState(false);
  const [greenCenter, setGreenCenter] = useState<Position | null>(null);
  const [selectedShot, setSelectedShot] = useState<{ shot: GolfShot; index: number } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showGreenSetup, setShowGreenSetup] = useState(false);

  // Use either the current round or the selected historical round
  const activeRound = selectedHistoricalRound || currentRound;
  const isHistoricalView = !!selectedHistoricalRound;

  const currentHole = activeRound?.holes[activeHole - 1];
  const shots = currentHole?.shots || [];
  const teePosition = currentHole?.teePosition || { latitude: 0, longitude: 0 };
  const holePosition = currentHole?.holePosition || { latitude: 0, longitude: 0 };
  const greenArea = currentHole?.greenArea;
  const obstacles = currentHole?.obstacles || [];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newPos);
          setCenter(newPos);
        },
        () => {
          console.error("Error getting location");
        }
      );
    }
  }, []);

  // Center map on the first shot of the active hole when viewing history
  useEffect(() => {
    if (isHistoricalView && activeRound) {
      const currentHole = activeRound.holes[activeHole - 1];
      if (currentHole && currentHole.shots.length > 0) {
        const firstShot = currentHole.shots[0];
        setCenter({
          lat: firstShot.latitude,
          lng: firstShot.longitude,
        });
      }
    }
  }, [isHistoricalView, activeRound, activeHole]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng || isHistoricalView) return;

    const position = {
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
    };

    switch (setupMode) {
      case 'tee':
        setTeePosition(activeHole, position);
        break;
      case 'hole':
        setHolePosition(activeHole, position);
        setShowGreenSetup(true);
        break;
      case 'green':
        if (!drawingGreen) {
          setGreenCenter(position);
          setDrawingGreen(true);
        } else {
          const center = greenCenter!;
          const radius = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(center.latitude, center.longitude),
            e.latLng
          );
          setGreenArea(activeHole, { center, radius });
          setDrawingGreen(false);
          setGreenCenter(null);
          setSetupMode(null);
          setShowGreenSetup(false);
        }
        break;
      case 'obstacles':
        // Open a modal or prompt for obstacle type
        const type = window.prompt('Enter obstacle type (water, bunker, trees, out-of-bounds):') as Obstacle['type'];
        if (type && ['water', 'bunker', 'trees', 'out-of-bounds'].includes(type)) {
          const name = window.prompt('Enter obstacle name (optional):') || undefined;
          addObstacle(activeHole, {
            type,
            position,
            name,
          });
        }
        break;
      default:
        const newShot: Omit<GolfShot, 'id'> = {
          latitude: position.latitude,
          longitude: position.longitude,
          timestamp: new Date(),
        };
        addShot(activeHole, newShot);
    }
  }, [activeHole, addShot, setupMode, drawingGreen, greenCenter, setTeePosition, setHolePosition, setGreenArea, addObstacle, isHistoricalView, setSetupMode]);

  const handleHoleClick = useCallback(() => {
    if (!isHistoricalView && currentRound && !setupMode) {
      setShowConfirmation(true);
    }
  }, [isHistoricalView, currentRound, setupMode]);

  const handleConfirmHoleCompletion = useCallback(() => {
    if (!currentRound || !holePosition) return;

    // Add the final shot at the hole position
    const finalShot: Omit<GolfShot, 'id'> = {
      latitude: holePosition.latitude,
      longitude: holePosition.longitude,
      timestamp: new Date(),
    };
    addShot(activeHole, finalShot);

    // Complete the hole with the total number of shots as the score
    const totalShots = currentHole?.shots.length ? currentHole.shots.length + 1 : 1;
    completeHole(activeHole, totalShots);

    setShowConfirmation(false);
  }, [currentRound, holePosition, activeHole, addShot, completeHole, currentHole?.shots.length]);

  const handlePlaceSelected = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const newCenter = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setCenter(newCenter);
      if (place.geometry.viewport) {
        mapRef.current?.fitBounds(place.geometry.viewport);
      } else {
        mapRef.current?.setZoom(18);
      }
    }
  }, []);

  const mapRef = useRef<google.maps.Map | null>(null);
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="h-full w-full relative">
      {isLoaded && <PlacesSearchBar onPlaceSelected={handlePlaceSelected} />}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={18}
        mapTypeId="satellite"
        center={center}
        options={{
          ...options,
          clickableIcons: !isHistoricalView,
        }}
        onClick={!isHistoricalView ? handleMapClick : undefined}
        onLoad={onMapLoad}
      >
        {/* User location */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
          />
        )}

        {currentHole && (
          <>
            {/* Tee position */}
            {teePosition.latitude !== 0 && (
              <Marker
                position={{ lat: teePosition.latitude, lng: teePosition.longitude }}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                }}
                label="T"
              />
            )}

            {/* Tee to first shot line */}
            {teePosition.latitude !== 0 && shots.length > 0 && (
              <Polyline
                path={[
                  { lat: teePosition.latitude, lng: teePosition.longitude },
                  { lat: shots[0].latitude, lng: shots[0].longitude }
                ]}
                options={{
                  strokeColor: '#FFA500', // Orange color
                  strokeOpacity: 1,
                  strokeWeight: 2,
                  strokePattern: [10, 5], // Dashed line pattern
                }}
              />
            )}

            {/* Hole position */}
            {holePosition.latitude !== 0 && (
              <Marker
                position={{ lat: holePosition.latitude, lng: holePosition.longitude }}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                }}
                label="H"
                onClick={handleHoleClick}
              />
            )}

            {/* Green area */}
            {greenArea && (
              <Circle
                center={{ lat: greenArea.center.latitude, lng: greenArea.center.longitude }}
                radius={greenArea.radius}
                options={{
                  clickable: false,
                  fillColor: '#90EE90',
                  fillOpacity: 0.3,
                  strokeColor: '#228B22',
                  strokeOpacity: 1,
                  strokeWeight: 2,
                }}
              />
            )}

            {/* Drawing green preview */}
            {drawingGreen && greenCenter && (
              <Circle
                center={{ lat: greenCenter.latitude, lng: greenCenter.longitude }}
                radius={10}
                options={{
                  clickable: false,
                  fillColor: '#90EE90',
                  fillOpacity: 0.3,
                  strokeColor: '#228B22',
                  strokeOpacity: 1,
                  strokeWeight: 2,
                }}
              />
            )}

            {/* Obstacles */}
            {obstacles.map((obstacle) => (
              <Marker
                key={obstacle.id}
                position={{ lat: obstacle.position.latitude, lng: obstacle.position.longitude }}
                label={{
                  text: obstacleIcons[obstacle.type],
                  fontSize: '20px',
                }}
                title={obstacle.name || obstacle.type}
              />
            ))}

            {/* Shot markers and path */}
            {shots.map((shot, index) => {
              const isLastShot = index === shots.length - 1;
              const markerLabel = {
                text: (index + 1).toString(),
                color: isLastShot ? '#FFFFFF' : '#000000',
                fontSize: isLastShot ? '16px' : '14px',
                fontWeight: isLastShot ? 'bold' : 'normal'
              };

              return (
                <Marker
                  key={shot.id}
                  position={{ lat: shot.latitude, lng: shot.longitude }}
                  label={markerLabel}
                  icon={isLastShot ? {
                    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    scaledSize: new google.maps.Size(48, 48),
                  } : undefined}
                  onClick={() => setSelectedShot({ shot, index })}
                />
              );
            })}

            {/* Info Window for shot details */}
            {selectedShot && (
              <InfoWindow
                position={{ lat: selectedShot.shot.latitude, lng: selectedShot.shot.longitude }}
                onCloseClick={() => setSelectedShot(null)}
              >
                <div className="p-2">
                  <h3 className="font-semibold mb-2">Shot {selectedShot.index + 1}</h3>
                  {selectedShot.index === 0 && teePosition.latitude !== 0 && (
                    <p className="text-sm mb-1">
                      From tee: {formatDistance(
                        calculateDistance(
                          teePosition,
                          { latitude: selectedShot.shot.latitude, longitude: selectedShot.shot.longitude }
                        )
                      )}
                    </p>
                  )}
                  {selectedShot.index > 0 && (
                    <p className="text-sm mb-1">
                      From previous: {formatDistance(
                        calculateDistance(
                          {
                            latitude: shots[selectedShot.index - 1].latitude,
                            longitude: shots[selectedShot.index - 1].longitude
                          },
                          {
                            latitude: selectedShot.shot.latitude,
                            longitude: selectedShot.shot.longitude
                          }
                        )
                      )}
                    </p>
                  )}
                  {holePosition.latitude !== 0 && (
                    <p className="text-sm">
                      To hole: {formatDistance(
                        calculateDistance(
                          { latitude: selectedShot.shot.latitude, longitude: selectedShot.shot.longitude },
                          holePosition
                        )
                      )}
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}

            {shots.length > 1 && (
              <Polyline
                path={shots.map(shot => ({
                  lat: shot.latitude,
                  lng: shot.longitude,
                }))}
                options={{
                  strokeColor: '#FF0000',
                  strokeOpacity: 1,
                  strokeWeight: 2,
                }}
              />
            )}
          </>
        )}
      </GoogleMap>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Complete Hole</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to complete this hole? This will:
              <ul className="list-disc list-inside mt-2">
                <li>Add a final shot at the hole position</li>
                <li>Set your score to {(currentHole?.shots.length || 0) + 1} shots</li>
                <li>Mark the hole as completed</li>
              </ul>
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHoleCompletion}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Complete Hole
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Green Setup Dialog */}
      {showGreenSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Set Up Green Area</h3>
            <p className="text-gray-600 mb-6">
              Would you like to set up the green area around the hole? This will help track when shots are on the green.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowGreenSetup(false);
                  setSetupMode(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Skip
              </button>
              <button
                onClick={() => {
                  setSetupMode('green');
                  setShowGreenSetup(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Set Green Area
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup mode indicator */}
      {setupMode && !isHistoricalView && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md">
          <p className="font-semibold">
            Setup Mode: {setupMode.charAt(0).toUpperCase() + setupMode.slice(1)}
          </p>
          <p className="text-sm text-gray-600">
            {setupMode === 'green' && !drawingGreen && 'Click to set green center'}
            {setupMode === 'green' && drawingGreen && 'Click to set green radius'}
            {setupMode === 'tee' && 'Click to set tee position'}
            {setupMode === 'hole' && 'Click to set hole position'}
            {setupMode === 'obstacles' && 'Click to add obstacles'}
          </p>
        </div>
      )}

      {!activeRound && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">
            Start a new round to begin tracking your golf game
          </p>
        </div>
      )}

      {isHistoricalView && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md">
          <p className="font-semibold">
            Viewing: {activeRound?.courseName}
          </p>
          <p className="text-sm text-gray-600">
            Hole {activeHole} - Score: {currentHole?.score || 'N/A'}
          </p>
        </div>
      )}
    </div>
  );
}
