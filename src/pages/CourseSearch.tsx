import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGolfStore } from '../store/useGolfStore';
import golfCourseApi, { GolfCourse } from '../services/golfCourseApi';
import CourseSearchBar from '../components/CourseSearch/CourseSearchBar';
import CourseDetails from '../components/CourseSearch/CourseDetails';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeId: 'satellite',
  mapTypeControl: true,
  mapTypeControlOptions: {
    position: 2,
    style: 2,
  }
};

export default function CourseSearch() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries as ['places'],
  });

  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [center, setCenter] = useState({ lat: 43.45, lng: -80.49 });
  const mapRef = useRef<google.maps.Map | null>(null);
  const navigate = useNavigate();
  const startNewRound = useGolfStore(state => state.startNewRound);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleSearch = async (query: string) => {
    try {
      setSearchError(null);
      const response = await golfCourseApi.searchCourses(query);
      setCourses(response.courses);

      // If courses found, center map on the first course
      if (response.courses.length > 0) {
        const firstCourse = response.courses[0];
        const newCenter = {
          lat: firstCourse.location.latitude,
          lng: firstCourse.location.longitude,
        };
        setCenter(newCenter);
        mapRef.current?.setZoom(10);
      }
    } catch (error) {
      setSearchError('Failed to fetch golf courses. Please try again.');
      console.error('Error fetching courses:', error);
    }
  };

  const handleStartRound = (course: GolfCourse) => {
    startNewRound(course.course_name);
    navigate('/play');
  };

  const handleShowOnMap = useCallback((course: GolfCourse) => {
    const newCenter = {
      lat: course.location.latitude,
      lng: course.location.longitude,
    };
    setCenter(newCenter);
    mapRef.current?.setZoom(15);
    setSelectedCourse(null); // Close the modal
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative h-screen flex">
        {/* Left side - Course list */}
        <div className="w-full md:w-1/2 lg:w-2/5 h-full overflow-auto relative">
          <CourseSearchBar
            onSearch={handleSearch}
            onError={setSearchError}
          />

          {searchError && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {searchError}
            </div>
          )}

          <div className="container mx-auto px-4 pt-24">
            <div className="grid grid-cols-1 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {course.club_name}
                    </h3>
                    {course.club_name !== course.course_name && (
                      <h4 className="text-lg text-gray-600 mb-4">{course.course_name}</h4>
                    )}
                    <p className="text-gray-600">
                      {course.location.city}, {course.location.state}
                    </p>
                    <p className="text-gray-500">{course.location.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Map */}
        <div className="hidden md:block md:w-1/2 lg:w-3/5 h-full">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={16}
            center={center}
            options={options}
            onLoad={onMapLoad}
          >
            {courses.map((course) => (
              <Marker
                key={course.id}
                position={{
                  lat: course.location.latitude,
                  lng: course.location.longitude
                }}
                onClick={() => setSelectedCourse(course)}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                }}
              />
            ))}
          </GoogleMap>
        </div>

        {/* Course Details Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="relative rounded-lg max-w-2xl w-full">
              <CourseDetails
                course={selectedCourse}
                onClose={() => setSelectedCourse(null)}
                onStartRound={() => handleStartRound(selectedCourse)}
                onShowOnMap={() => handleShowOnMap(selectedCourse)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
