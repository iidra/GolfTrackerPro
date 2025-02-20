import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { debounce } from 'lodash';
import golfCourseApi from '../../services/golfCourseApi';

interface CourseSearchBarProps {
  onSearch: (query: string) => void;
  onError: (error: string) => void;
}

export default function CourseSearchBar({ onSearch, onError }: CourseSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) return;
      
      try {
        const response = await golfCourseApi.searchCourses(query);
        onSearch(query);
      } catch (error) {
        onError('Failed to search courses. Please try again.');
      }
    }, 500),
    [onSearch, onError]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  return (
    <div className="absolute top-4 left-0 right-0 z-10 px-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:w-full sm:max-w-md">
      <div className={`relative transition-all duration-200 ${isFocused ? 'scale-105' : ''}`}>
        <input
          type="text"
          placeholder="Search for golf courses..."
          className="w-full h-12 px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg shadow-lg 
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                   text-base sm:text-lg
                   placeholder-gray-400"
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    </div>
  );
}
