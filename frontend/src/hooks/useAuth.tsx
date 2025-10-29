import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/config';

export interface User {
  _id: string;       // MongoDB ObjectId
  email: string;
  name: string;
  role?: string;
  permissions?: string[];
  provider: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Note: Backend doesn't have /me endpoint, so we'll just set loading to false
      // The user will be set after successful login/signup
      setLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('[Auth] Attempting login for:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('[Auth] Login response:', { status: response.status, data });
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Login failed');
    }

    // Backend returns: { message: "Login successful.", user: {...} }
    if (data.user) {
      setUser({
        _id: data.user.id || data.user._id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        permissions: data.user.permissions,
        provider: data.user.provider || 'local'
      });
      console.log('[Auth] User logged in:', data.user.email);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    console.log('[Auth] Attempting signup for:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    console.log('[Auth] Signup response:', { status: response.status, data });
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Signup failed');
    }

    // Backend returns: { message: "User Authenticated!", userObj: {...} }
    if (data.userObj) {
      setUser({
        _id: data.userObj._id,
        email: data.userObj.email,
        name: data.userObj.name,
        role: data.userObj.role,
        permissions: data.userObj.permissions,
        provider: data.userObj.provider || 'local'
      });
      console.log('[Auth] User signed up:', data.userObj.email);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
