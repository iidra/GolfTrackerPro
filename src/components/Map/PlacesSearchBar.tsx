import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface PlacesSearchBarProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
}

export default function PlacesSearchBar({ onPlaceSelected }: PlacesSearchBarProps) {
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const searchBoxInstance = new google.maps.places.SearchBox(inputRef.current, {
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(-85, -180),
        new google.maps.LatLng(85, 180)
      ),
    });

    searchBoxInstance.addListener('places_changed', () => {
      const places = searchBoxInstance.getPlaces();
      if (places && places.length > 0) {
        onPlaceSelected(places[0]);
        if (inputRef.current) {
          inputRef.current.blur(); // Hide mobile keyboard after selection
        }
      }
    });

    setSearchBox(searchBoxInstance);

    return () => {
      if (searchBox) {
        google.maps.event.clearInstanceListeners(searchBox);
      }
    };
  }, [onPlaceSelected]);

  return (
    <div className="absolute top-10 left-0 right-0 z-10 p-4 sm:top-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:w-full sm:max-w-md">
      <div className={`relative transition-all duration-200 ${isFocused ? 'scale-105' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for golf courses..."
          className="w-full h-12 px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg shadow-lg 
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                   text-base sm:text-lg
                   placeholder-gray-400"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    </div>
  );
}
