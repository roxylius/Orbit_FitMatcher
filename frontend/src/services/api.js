import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    } else if (error.response?.status === 500) {
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

// API functions
export const fetchUniversityMatches = async (userProfile) => {
  try {
    const response = await api.post('/matches', userProfile);
    return response.data;
  } catch (error) {
    console.error('Error fetching university matches:', error);
    throw error;
  }
};

export const getUniversityDetails = async (universityId) => {
  try {
    const response = await api.get(`/universities/${universityId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching university details:', error);
    throw error;
  }
};

export const getAllUniversities = async () => {
  try {
    const response = await api.get('/universities');
    return response.data;
  } catch (error) {
    console.error('Error fetching universities:', error);
    throw error;
  }
};

export default api;
