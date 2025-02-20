import React from 'react';
import { GolfCourse } from '../../services/golfCourseApi';
import { MapPin, LandPlot, Map } from 'lucide-react';

interface CourseDetailsProps {
  course: GolfCourse;
  onClose: () => void;
  onStartRound?: () => void;
  onShowOnMap?: () => void;
}

export default function CourseDetails({ course, onClose, onStartRound, onShowOnMap }: CourseDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{course.club_name}</h2>
          {course.club_name !== course.course_name && (
            <h3 className="text-lg text-gray-600">{course.course_name}</h3>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <MapPin className="w-5 h-5 text-gray-500 mt-1" />
          <div>
            <p className="text-gray-600">{course.location.address}</p>
            <p className="text-gray-600">
              {course.location.city}, {course.location.state}
            </p>
            <p className="text-gray-600">{course.location.country}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Tee Boxes</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-1">Men's Tees</h5>
              {course.tees.male.map((tee, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <LandPlot className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{tee.tee_name}</span>
                  <span className="text-gray-500">({tee.course_rating})</span>
                </div>
              ))}
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-1">Women's Tees</h5>
              {course.tees.female.map((tee, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <LandPlot className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{tee.tee_name}</span>
                  <span className="text-gray-500">({tee.course_rating})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {onShowOnMap && (
            <button
              onClick={onShowOnMap}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Map className="w-5 h-5" />
              Show on Map
            </button>
          )}
          {false && onStartRound && (
            <button
              onClick={onStartRound}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Round
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
