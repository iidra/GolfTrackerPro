import axios from 'axios';

const API_KEY = 'WLMETDMKLJDQEBMEVLYN7BD5HA';
const BASE_URL = 'https://api.golfcourseapi.com/v1';

interface TeeBox {
  tee_name: string;
  course_rating: number;
}

interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface GolfCourse {
  id: number;
  club_name: string;
  course_name: string;
  location: Location;
  tees: {
    female: TeeBox[];
    male: TeeBox[];
  };
}

export interface CourseSearchResponse {
  courses: GolfCourse[];
}

const golfCourseApi = {
  searchCourses: async (query: string): Promise<CourseSearchResponse> => {
    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        headers: {
          'Authorization': `Key ${API_KEY}`
        },
        params: {
          search_query: query
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching golf courses:', error);
      throw error;
    }
  },

  getCourseById: async (id: number): Promise<GolfCourse> => {
    try {
      const response = await axios.get(`${BASE_URL}/courses/${id}`, {
        headers: {
          'Authorization': `Key ${API_KEY}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting golf course details:', error);
      throw error;
    }
  }
};

export default golfCourseApi;
