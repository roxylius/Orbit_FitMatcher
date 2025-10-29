import { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/config';

// ==================== TYPES ====================

export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface University {
  university_id: number;
  name: string;
  program_name: string;
  program_type: string;
  location_city: string | null;
  location_country: string | null;
  location_region: string | null;
  ranking: number | null;
  acceptance_rate: number | null;
  median_gmat: number | null;
  median_gre: number | null;
  median_gpa: number | null;
  avg_work_experience: number | null;
  tuition_usd: number | null;
  avg_starting_salary_usd: number | null;
  scholarship_available: boolean | null;
  visa_sponsorship: boolean | null;
  primary_industry: string | null;
  post_study_work_support: string | null;
  savedAt?: string; // Added by backend when saved
}

export interface MatchResult {
  university: University;
  match_percentage: number;
  category: 'Safety' | 'Target' | 'Reach';
  reasons: string[];
}

// ==================== CONTEXT TYPE ====================

interface AppContextType {
  // Auth State
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Saved Universities State
  savedUniversities: University[];
  saveUniversity: (university: University) => void;
  removeUniversity: (universityId: number) => void;
  isUniversitySaved: (universityId: number) => boolean;
  clearAllSaved: () => void;
  
  // Search Results State
  searchResults: University[];
  setSearchResults: (results: University[]) => void;
  hasSearched: boolean;
  setHasSearched: (searched: boolean) => void;
  clearSearchResults: () => void;
  
  // Match Results State
  matchResults: MatchResult[];
  setMatchResults: (matches: MatchResult[]) => void;
  hasMatched: boolean;
  setHasMatched: (matched: boolean) => void;
  clearMatchResults: () => void;
}

// ==================== CONTEXT ====================

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Saved Universities State
  const [savedUniversities, setSavedUniversities] = useState<University[]>([]);

  // Search Results State
  const [searchResults, setSearchResults] = useState<University[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Match Results State
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [hasMatched, setHasMatched] = useState(false);

  // ==================== AUTH FUNCTIONS ====================

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    setUser(data.user);
  };

  const logout = async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    
    // Clear all state on logout
    clearAllSaved();
    clearSearchResults();
    clearMatchResults();
  };

  // ==================== SAVED UNIVERSITIES FUNCTIONS ====================

  // Fetch saved universities from backend on mount and when user changes
  useLayoutEffect(() => {
    const fetchSavedUniversities = async () => {
      if (!user) {
        // Clear saved universities if not logged in
        setSavedUniversities([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/saved-universities`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setSavedUniversities(data.universities || []);
        } else {
          console.error('Failed to fetch saved universities');
          setSavedUniversities([]);
        }
      } catch (error) {
        console.error('Error fetching saved universities:', error);
        setSavedUniversities([]);
      }
    };

    fetchSavedUniversities();
  }, [user]);

  const saveUniversity = async (university: University) => {
    // Check if already saved
    const isAlreadySaved = savedUniversities.some(u => u.university_id === university.university_id);
    if (isAlreadySaved) {
      console.log('University already saved');
      return;
    }

    // Optimistically update UI
    const tempUniversity = { ...university, savedAt: new Date().toISOString() };
    setSavedUniversities((prev) => [...prev, tempUniversity]);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/saved-universities`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university_id: university.university_id,
          name: university.name,
          program_name: university.program_name,
          program_type: university.program_type,
          location_city: university.location_city,
          location_country: university.location_country,
          location_region: university.location_region,
          ranking: university.ranking,
          acceptance_rate: university.acceptance_rate,
          median_gmat: university.median_gmat,
          median_gre: university.median_gre,
          median_gpa: university.median_gpa,
          avg_work_experience: university.avg_work_experience,
          tuition_usd: university.tuition_usd,
          avg_starting_salary_usd: university.avg_starting_salary_usd,
          scholarship_available: university.scholarship_available,
          visa_sponsorship: university.visa_sponsorship,
          primary_industry: university.primary_industry,
          post_study_work_support: university.post_study_work_support,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Rollback on failure
        setSavedUniversities((prev) => prev.filter(u => u.university_id !== university.university_id));
        console.error('Failed to save university:', data.message);
      } else {
        // Update with server response (includes savedAt timestamp)
        setSavedUniversities((prev) => 
          prev.map(u => u.university_id === university.university_id ? data.university : u)
        );
      }
    } catch (error) {
      // Rollback on error
      setSavedUniversities((prev) => prev.filter(u => u.university_id !== university.university_id));
      console.error('Error saving university:', error);
    }
  };

  const removeUniversity = async (universityId: number) => {
    // Optimistically update UI
    const previousState = [...savedUniversities];
    setSavedUniversities((prev) => prev.filter(u => u.university_id !== universityId));

    try {
      const response = await fetch(`${API_BASE_URL}/auth/saved-universities/${universityId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Rollback on failure
        setSavedUniversities(previousState);
        console.error('Failed to remove university:', data.message);
      }
    } catch (error) {
      // Rollback on error
      setSavedUniversities(previousState);
      console.error('Error removing university:', error);
    }
  };

  const isUniversitySaved = (universityId: number): boolean => {
    return savedUniversities.some(u => u.university_id === universityId);
  };

  const clearAllSaved = () => {
    setSavedUniversities([]);
  };

  // ==================== SEARCH RESULTS FUNCTIONS ====================

  const clearSearchResults = () => {
    setSearchResults([]);
    setHasSearched(false);
  };

  // ==================== MATCH RESULTS FUNCTIONS ====================

  const clearMatchResults = () => {
    setMatchResults([]);
    setHasMatched(false);
  };

  // ==================== PROVIDER VALUE ====================

  const value: AppContextType = {
    // Auth
    user,
    loading,
    login,
    signup,
    logout,
    
    // Saved Universities
    savedUniversities,
    saveUniversity,
    removeUniversity,
    isUniversitySaved,
    clearAllSaved,
    
    // Search Results
    searchResults,
    setSearchResults,
    hasSearched,
    setHasSearched,
    clearSearchResults,
    
    // Match Results
    matchResults,
    setMatchResults,
    hasMatched,
    setHasMatched,
    clearMatchResults,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ==================== HOOK ====================

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// ==================== CONVENIENCE HOOKS ====================

export const useAuth = () => {
  const { user, loading, login, signup, logout } = useApp();
  return { user, loading, login, signup, logout };
};

export const useSavedUniversities = () => {
  const { savedUniversities, saveUniversity, removeUniversity, isUniversitySaved, clearAllSaved } = useApp();
  return { savedUniversities, saveUniversity, removeUniversity, isUniversitySaved, clearAll: clearAllSaved };
};

export const useSearch = () => {
  const {
    searchResults,
    setSearchResults,
    hasSearched,
    setHasSearched,
    clearSearchResults,
    matchResults,
    setMatchResults,
    hasMatched,
    setHasMatched,
    clearMatchResults,
  } = useApp();
  
  return {
    searchResults,
    setSearchResults,
    hasSearched,
    setHasSearched,
    clearSearchResults,
    matchResults,
    setMatchResults,
    hasMatched,
    setHasMatched,
    clearMatchResults,
  };
};
