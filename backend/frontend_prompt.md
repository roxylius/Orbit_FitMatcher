# Frontend Development Guide: Authentication & University Matching# Frontend Development Guide: Authentication & University Matching



## Overview## Database Architecture (Normalized Schema)



This guide provides complete implementation instructions for building the frontend of the University Matcher application with **authentication**, **protected routes**, and **university matching features**.**CRITICAL**: The backend database uses a **normalized schema** with lookup tables. Understanding this is essential for frontend development.



---### What This Means:

- **program_type**, **location_country**, and **primary_industry** are stored as **foreign keys** (integers) in the database

## Authentication System- API responses return **denormalized data** (strings) by joining with lookup tables

- Only **exact values** from lookup tables are valid - using any other value will cause **400 validation errors**

### Architecture

### Lookup Tables:

**Dual Database Setup:**1. **program_types**: 4 program types (MBA, MS CS, MS Finance, MS Analytics)

- **MongoDB**: User authentication, session storage2. **countries**: 3 countries (USA, France, UK) with regions (North America, Europe)

- **PostgreSQL**: University data (normalized schema with lookup tables)3. **industries**: 18 industries (Analytics, AI, Consulting, Cybersecurity, Data Science, Entrepreneurship, Finance, Healthcare, Marketing, Media, Operations, Quantitative Finance, Risk Management, Robotics, Social Impact, Software Engineering, Sustainability, Technology)



**Session Management:**### Why Exact Values Matter:

- **Type**: Cookie-based sessions with Passport.js❌ Sending `"MBA Program"` instead of `"MBA"` → **400 Bad Request**

- **Cookie Name**: `connect.sid`❌ Sending `"United States"` instead of `"USA"` → **400 Bad Request**

- **Duration**: 180 days❌ Sending `"Data Analytics"` instead of `"Data Science"` → **400 Bad Request**

- **Settings**: `httpOnly: true`, `sameSite: 'lax'`

- **Critical**: All API requests MUST include `credentials: 'include'`The backend validates all incoming values against the lookup tables. Only exact string matches are accepted.



------



## Required Pages## Metadata Endpoint: Authoritative Source for Dropdowns



1. **Landing Page** (`/`) - Public homepage showcasing features### Endpoint

2. **Sign Up Page** (`/signup`) - User registration

3. **Login Page** (`/login`) - User authentication```

4. **Forgot Password Page** (`/forgot-password`) - Request OTP via emailGET /api/metadata

5. **Reset Password Page** (`/reset-password`) - Verify OTP and reset password```

6. **Dashboard** (`/dashboard`) - Protected, main application interface

7. **Profile Page** (`/profile`) - Protected, user settings### Response Structure



---```typescript

{

## Authentication Endpoints  success: boolean;

  programTypes: string[];  // From program_types table (4 values)

### Base URL  countries: string[];     // From countries table (3 values)

```  industries: string[];    // From industries table (18 values)

Development: http://localhost:3000}

Production: TBD```

```

### Actual Values (Current Schema):

### Available Endpoints

**programTypes**: `["MBA", "MS Analytics", "MS CS", "MS Finance"]`

| Method | Endpoint | Description | Auth Required |

|--------|----------|-------------|---------------|**countries**: `["France", "UK", "USA"]`

| POST | `/api/auth/signup` | Register new user | No |

| POST | `/api/auth/login` | Authenticate user | No |**industries**: `["Analytics", "Artificial Intelligence", "Consulting", "Cybersecurity", "Data Science", "Entrepreneurship", "Finance", "Healthcare", "Marketing", "Media", "Operations", "Quantitative Finance", "Risk Management", "Robotics", "Social Impact", "Software Engineering", "Sustainability", "Technology"]`

| DELETE | `/api/auth/logout` | Destroy session | Yes |

| POST | `/api/auth/forgot-password` | Request OTP for password reset | No |---

| POST | `/api/auth/reset-password/verify-otp` | Verify OTP (optional UX step) | No |

| POST | `/api/auth/reset-password` | Reset password with OTP | No |## Usage Instructions



---### 1. Fetch Metadata on App Initialization



## Step-by-Step Implementation```typescript

useEffect(() => {

### 1. Setup Authentication Context Hook  const fetchMetadata = async () => {

    try {

Create a custom React hook to manage authentication state globally.      const response = await fetch('http://localhost:3000/api/metadata');

      const data = await response.json();

**File: `hooks/useAuth.tsx`**      

      if (data.success) {

```typescript        // Store in state/context

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';        setProgramTypes(data.programTypes);

import { useRouter } from 'next/navigation'; // or 'next/router' for pages directory        setCountries(data.countries);

        setIndustries(data.industries);

interface User {      }

  id: string;    } catch (error) {

  email: string;      console.error('Failed to fetch metadata:', error);

  name: string;    }

  role?: string;  };

}  

  fetchMetadata();

interface AuthContextType {}, []); // Run once on mount

  user: User | null;```

  isAuthenticated: boolean;

  isLoading: boolean;### 2. Use Exact Values in Dropdowns

  login: (email: string, password: string) => Promise<void>;

  signup: (email: string, password: string, name: string) => Promise<void>;```typescript

  logout: () => Promise<void>;<select name="program_type" required>

  checkAuth: () => Promise<void>;  <option value="">Select program type</option>

}  {programTypes.map(type => (

    <option key={type} value={type}>{type}</option>

const AuthContext = createContext<AuthContextType | undefined>(undefined);  ))}

</select>

const API_BASE_URL = 'http://localhost:3000';

<select name="location_country">

export function AuthProvider({ children }: { children: ReactNode }) {  <option value="">Any country</option>

  const [user, setUser] = useState<User | null>(null);  {countries.map(country => (

  const [isLoading, setIsLoading] = useState(true);    <option key={country} value={country}>{country}</option>

  const router = useRouter();  ))}

</select>

  // Check if user has valid session

  const checkAuth = async () => {<select name="primary_industry">

    try {  <option value="">Any industry</option>

      // Try to fetch user profile to verify session  {industries.map(industry => (

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {    <option key={industry} value={industry}>{industry}</option>

        credentials: 'include'  ))}

      });</select>

      ```

      if (response.ok) {

        const data = await response.json();### 3. Cache Values (Don't Refetch on Every Render)

        setUser(data.user);

      } else {- **Fetch once** on app initialization

        setUser(null);- **Store in global state** (Context API, Redux, Zustand, etc.)

      }- **Refresh on app reload** (not on component remount)

    } catch (error) {- Consider **localStorage caching** with TTL for better UX

      console.error('Auth check failed:', error);

      setUser(null);---

    } finally {

      setIsLoading(false);## Important Rules

    }

  };### ✅ DO:

- **Always fetch from `/api/metadata`** to populate dropdowns

  useEffect(() => {- **Use exact string values** from the API response

    checkAuth();- **Cache metadata** in state/context to avoid repeated calls

  }, []);- **Display values as-is** without transformation



  const signup = async (email: string, password: string, name: string) => {### ❌ DON'T:

    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {- **Hardcode dropdown values** in frontend code

      method: 'POST',- **Transform values** (e.g., adding suffixes like "Program")

      headers: { 'Content-Type': 'application/json' },- **Use variations** (e.g., "US" instead of "USA")

      credentials: 'include',- **Assume values** - always fetch from the endpoint

      body: JSON.stringify({ email, password, name })- **Refetch on every render** - cache the response

    });

---

    if (!response.ok) {

      const error = await response.json();## Removed Fields (No Longer in Schema)

      throw new Error(error.message || 'Signup failed');

    }The following fields have been **permanently removed** from the database and **will NOT appear in API responses**:



    const data = await response.json();- ❌ `class_size: number | null`

    setUser(data.userObj);- ❌ `secondary_industries: string[] | null`

    router.push('/dashboard');- ❌ `international_student_ratio: number | null`

  };

**Do not expect, display, or reference these fields in your UI.**

  const login = async (email: string, password: string) => {

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {---

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },## Migration Impact for Frontend

      credentials: 'include',

      body: JSON.stringify({ email, password })If you have existing frontend code:

    });

1. **Remove references** to `class_size`, `secondary_industries`, `international_student_ratio`

    if (!response.ok) {2. **Update TypeScript interfaces** to match the new schema (see CONTEXT.md)

      const error = await response.json();3. **Implement metadata fetching** if not already done

      throw new Error(error.message || 'Login failed');4. **Update dropdown populations** to use `/api/metadata`

    }5. **Test form submissions** to ensure exact value matching



    const data = await response.json();---

    setUser(data.user);

    router.push('/dashboard');## Quick Reference Prompt for Frontend Components

  };

When generating or updating frontend components that collect user input:

  const logout = async () => {

    await fetch(`${API_BASE_URL}/api/auth/logout`, {```

      method: 'DELETE',You are implementing form controls for the Orbit AI Right Fit Matcher frontend.

      credentials: 'include'The backend uses a normalized database with lookup tables for program_type, location_country, and primary_industry.

    });MUST fetch metadata from GET /api/metadata and use the exact values returned to populate dropdowns.

    The API will reject any value not in the lookup tables with a 400 error.

    setUser(null);Cache the metadata response per session to avoid repeated API calls.

    router.push('/login');Do NOT hardcode values or use variations (e.g., "USA" not "US" or "United States").

  };Refer to CONTEXT.md for full API documentation.

```

  return (

    <AuthContext.Provider value={{---

      user,

      isAuthenticated: !!user,## Authentication System

      isLoading,

      login,### Overview

      signup,

      logout,The application uses **session-based authentication** with Passport.js. Users must authenticate to access the dashboard and matching features.

      checkAuth

    }}>### Architecture

      {children}

    </AuthContext.Provider>**Dual Database Setup:**

  );- **MongoDB**: User authentication, session storage (separate from university data)

}- **PostgreSQL**: University data (normalized schema with lookup tables)



export function useAuth() {**Session Management:**

  const context = useContext(AuthContext);- Cookie-based sessions (`connect.sid`)

  if (context === undefined) {- 180-day expiration

    throw new Error('useAuth must be used within an AuthProvider');- `httpOnly: true`, `sameSite: 'lax'`

  }- Requires `credentials: 'include'` in all API requests

  return context;

}---

```

## Authentication Implementation Guide

**Usage in `_app.tsx` (Pages Directory):**

### Required Pages

```typescript

import { AuthProvider } from '@/hooks/useAuth';1. **Landing Page** (`/`) - Public, showcases features

import '@/styles/globals.css';2. **Sign Up Page** (`/signup`) - User registration

import type { AppProps } from 'next/app';3. **Login Page** (`/login`) - User authentication

4. **Forgot Password Page** (`/forgot-password`) - Request OTP

export default function App({ Component, pageProps }: AppProps) {5. **Reset Password Page** (`/reset-password`) - Verify OTP and reset password

  return (6. **Dashboard** (`/dashboard`) - Protected, requires authentication

    <AuthProvider>7. **Profile Page** (`/profile`) - Protected, user settings

      <Component {...pageProps} />

    </AuthProvider>---

  );

}### useAuth Hook Implementation

```

Create a custom React hook to manage authentication state globally.

**Usage in `layout.tsx` (App Directory):**

**File: `hooks/useAuth.tsx`**

```typescript

import { AuthProvider } from '@/hooks/useAuth';```typescript

import './globals.css';import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { useRouter } from 'next/navigation'; // or 'next/router' for pages directory

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (interface User {

    <html lang="en">  id: string;

      <body>  email: string;

        <AuthProvider>  name: string;

          {children}  role?: string;

        </AuthProvider>}

      </body>

    </html>interface AuthContextType {

  );  user: User | null;

}  isAuthenticated: boolean;

```  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;

---  signup: (email: string, password: string, name: string) => Promise<void>;

  logout: () => Promise<void>;

### 2. Create Protected Route Component  checkAuth: () => Promise<void>;

}

**File: `components/ProtectedRoute.tsx`**

const AuthContext = createContext<AuthContextType | undefined>(undefined);

```typescript

'use client';export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);

import { useEffect } from 'react';  const [isLoading, setIsLoading] = useState(true);

import { useRouter } from 'next/navigation';  const router = useRouter();

import { useAuth } from '@/hooks/useAuth';

  const checkAuth = async () => {

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {    try {

  const { isAuthenticated, isLoading } = useAuth();      // Check if user has valid session by calling a protected endpoint

  const router = useRouter();      const response = await fetch('http://localhost:3000/api/auth/me', {

        credentials: 'include'

  useEffect(() => {      });

    if (!isLoading && !isAuthenticated) {      

      router.push('/login');      if (response.ok) {

    }        const data = await response.json();

  }, [isAuthenticated, isLoading, router]);        setUser(data.user);

      } else {

  // Show loading spinner while checking authentication        setUser(null);

  if (isLoading) {      }

    return (    } catch (error) {

      <div className="flex items-center justify-center min-h-screen">      console.error('Auth check failed:', error);

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>      setUser(null);

      </div>    } finally {

    );      setIsLoading(false);

  }    }

  };

  // Don't render anything if not authenticated (will redirect)

  if (!isAuthenticated) {  useEffect(() => {

    return null;    checkAuth();

  }  }, []);



  return <>{children}</>;  const login = async (email: string, password: string) => {

}    const response = await fetch('http://localhost:3000/api/auth/login', {

```      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

---      credentials: 'include',

      body: JSON.stringify({ email, password })

### 3. Implement Sign Up Page    });



**File: `app/signup/page.tsx` or `pages/signup.tsx`**    if (!response.ok) {

      const error = await response.json();

```typescript      throw new Error(error.message || 'Login failed');

'use client';    }



import { useState } from 'react';    const data = await response.json();

import { useAuth } from '@/hooks/useAuth';    setUser(data.user);

import { Button } from '@/components/ui/button';    router.push('/dashboard');

import { Input } from '@/components/ui/input';  };

import { Label } from '@/components/ui/label';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';  const signup = async (email: string, password: string, name: string) => {

import { Alert, AlertDescription } from '@/components/ui/alert';    const response = await fetch('http://localhost:3000/api/auth/signup', {

import Link from 'next/link';      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

export default function SignUpPage() {      credentials: 'include',

  const { signup } = useAuth();      body: JSON.stringify({ email, password, name })

  const [formData, setFormData] = useState({     });

    email: '', 

    password: '',     if (!response.ok) {

    name: ''       const error = await response.json();

  });      throw new Error(error.message || 'Signup failed');

  const [error, setError] = useState('');    }

  const [isLoading, setIsLoading] = useState(false);

    const data = await response.json();

  const handleSubmit = async (e: React.FormEvent) => {    setUser(data.userObj);

    e.preventDefault();    router.push('/dashboard');

    setError('');  };

    setIsLoading(true);

  const logout = async () => {

    try {    await fetch('http://localhost:3000/api/auth/logout', {

      await signup(formData.email, formData.password, formData.name);      method: 'DELETE',

    } catch (err: any) {      credentials: 'include'

      setError(err.message || 'Signup failed');    });

    } finally {    

      setIsLoading(false);    setUser(null);

    }    router.push('/login');

  };  };



  return (  return (

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">    <AuthContext.Provider value={{

      <Card className="w-full max-w-md">      user,

        <CardHeader>      isAuthenticated: !!user,

          <CardTitle className="text-2xl">Create Account</CardTitle>      isLoading,

          <CardDescription>      login,

            Sign up to start finding your perfect university match      signup,

          </CardDescription>      logout,

        </CardHeader>      checkAuth

            }}>

        <form onSubmit={handleSubmit}>      {children}

          <CardContent className="space-y-4">    </AuthContext.Provider>

            {error && (  );

              <Alert variant="destructive">}

                <AlertDescription>{error}</AlertDescription>

              </Alert>export function useAuth() {

            )}  const context = useContext(AuthContext);

              if (context === undefined) {

            <div className="space-y-2">    throw new Error('useAuth must be used within an AuthProvider');

              <Label htmlFor="name">Full Name</Label>  }

              <Input  return context;

                id="name"}

                type="text"```

                placeholder="John Doe"

                value={formData.name}**Usage in `_app.tsx` or `layout.tsx`:**

                onChange={(e) => setFormData({ ...formData, name: e.target.value })}

                required```typescript

                disabled={isLoading}import { AuthProvider } from '@/hooks/useAuth';

              />

            </div>export default function App({ Component, pageProps }) {

  return (

            <div className="space-y-2">    <AuthProvider>

              <Label htmlFor="email">Email</Label>      <Component {...pageProps} />

              <Input    </AuthProvider>

                id="email"  );

                type="email"}

                placeholder="you@example.com"```

                value={formData.email}

                onChange={(e) => setFormData({ ...formData, email: e.target.value })}---

                required

                disabled={isLoading}### Protected Route Component

              />

            </div>**File: `components/ProtectedRoute.tsx`**



            <div className="space-y-2">```typescript

              <Label htmlFor="password">Password</Label>import { useEffect } from 'react';

              <Inputimport { useRouter } from 'next/navigation';

                id="password"import { useAuth } from '@/hooks/useAuth';

                type="password"

                placeholder="Min. 6 characters"export default function ProtectedRoute({ children }: { children: React.ReactNode }) {

                value={formData.password}  const { isAuthenticated, isLoading } = useAuth();

                onChange={(e) => setFormData({ ...formData, password: e.target.value })}  const router = useRouter();

                required

                minLength={6}  useEffect(() => {

                disabled={isLoading}    if (!isLoading && !isAuthenticated) {

              />      router.push('/login');

            </div>    }

          </CardContent>  }, [isAuthenticated, isLoading, router]);



          <CardFooter className="flex flex-col space-y-4">  if (isLoading) {

            <Button type="submit" className="w-full" disabled={isLoading}>    return <div className="flex items-center justify-center min-h-screen">

              {isLoading ? 'Creating account...' : 'Sign Up'}      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>

            </Button>    </div>;

              }

            <p className="text-sm text-center text-gray-600">

              Already have an account?{' '}  if (!isAuthenticated) {

              <Link href="/login" className="text-blue-600 hover:underline font-medium">    return null;

                Log in  }

              </Link>

            </p>  return <>{children}</>;

          </CardFooter>}

        </form>```

      </Card>

    </div>**Usage in Dashboard:**

  );

}```typescript

```import ProtectedRoute from '@/components/ProtectedRoute';



---export default function DashboardPage() {

  return (

### 4. Implement Login Page    <ProtectedRoute>

      <div>

**File: `app/login/page.tsx` or `pages/login.tsx`**        {/* Your dashboard content */}

      </div>

```typescript    </ProtectedRoute>

'use client';  );

}

import { useState } from 'react';```

import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';---

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';### Authentication Pages with shadcn/ui

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';#### 1. Sign Up Page

import Link from 'next/link';

```typescript

export default function LoginPage() {'use client';

  const { login } = useAuth();

  const [formData, setFormData] = useState({ import { useState } from 'react';

    email: '', import { useAuth } from '@/hooks/useAuth';

    password: '' import { Button } from '@/components/ui/button';

  });import { Input } from '@/components/ui/input';

  const [error, setError] = useState('');import { Label } from '@/components/ui/label';

  const [isLoading, setIsLoading] = useState(false);import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';

  const handleSubmit = async (e: React.FormEvent) => {import Link from 'next/link';

    e.preventDefault();

    setError('');export default function SignUpPage() {

    setIsLoading(true);  const { signup } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

    try {  const [error, setError] = useState('');

      await login(formData.email, formData.password);  const [isLoading, setIsLoading] = useState(false);

    } catch (err: any) {

      setError(err.message || 'Login failed');  const handleSubmit = async (e: React.FormEvent) => {

    } finally {    e.preventDefault();

      setIsLoading(false);    setError('');

    }    setIsLoading(true);

  };

    try {

  return (      await signup(formData.email, formData.password, formData.name);

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">    } catch (err: any) {

      <Card className="w-full max-w-md">      setError(err.message || 'Signup failed');

        <CardHeader>    } finally {

          <CardTitle className="text-2xl">Welcome Back</CardTitle>      setIsLoading(false);

          <CardDescription>    }

            Sign in to continue to your dashboard  };

          </CardDescription>

        </CardHeader>  return (

            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

        <form onSubmit={handleSubmit}>      <Card className="w-full max-w-md">

          <CardContent className="space-y-4">        <CardHeader>

            {error && (          <CardTitle>Create Account</CardTitle>

              <Alert variant="destructive">          <CardDescription>Sign up to start finding your perfect university match</CardDescription>

                <AlertDescription>{error}</AlertDescription>        </CardHeader>

              </Alert>        <form onSubmit={handleSubmit}>

            )}          <CardContent className="space-y-4">

                        {error && (

            <div className="space-y-2">              <Alert variant="destructive">

              <Label htmlFor="email">Email</Label>                <AlertDescription>{error}</AlertDescription>

              <Input              </Alert>

                id="email"            )}

                type="email"            

                placeholder="you@example.com"            <div className="space-y-2">

                value={formData.email}              <Label htmlFor="name">Full Name</Label>

                onChange={(e) => setFormData({ ...formData, email: e.target.value })}              <Input

                required                id="name"

                disabled={isLoading}                type="text"

              />                placeholder="John Doe"

            </div>                value={formData.name}

                onChange={(e) => setFormData({ ...formData, name: e.target.value })}

            <div className="space-y-2">                required

              <Label htmlFor="password">Password</Label>              />

              <Input            </div>

                id="password"

                type="password"            <div className="space-y-2">

                placeholder="Enter your password"              <Label htmlFor="email">Email</Label>

                value={formData.password}              <Input

                onChange={(e) => setFormData({ ...formData, password: e.target.value })}                id="email"

                required                type="email"

                disabled={isLoading}                placeholder="you@example.com"

              />                value={formData.email}

            </div>                onChange={(e) => setFormData({ ...formData, email: e.target.value })}

                required

            <div className="text-right">              />

              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">            </div>

                Forgot password?

              </Link>            <div className="space-y-2">

            </div>              <Label htmlFor="password">Password</Label>

          </CardContent>              <Input

                id="password"

          <CardFooter className="flex flex-col space-y-4">                type="password"

            <Button type="submit" className="w-full" disabled={isLoading}>                placeholder="Min. 6 characters"

              {isLoading ? 'Signing in...' : 'Sign In'}                value={formData.password}

            </Button>                onChange={(e) => setFormData({ ...formData, password: e.target.value })}

                            required

            <p className="text-sm text-center text-gray-600">                minLength={6}

              Don't have an account?{' '}              />

              <Link href="/signup" className="text-blue-600 hover:underline font-medium">            </div>

                Sign up          </CardContent>

              </Link>

            </p>          <CardFooter className="flex flex-col space-y-4">

          </CardFooter>            <Button type="submit" className="w-full" disabled={isLoading}>

        </form>              {isLoading ? 'Creating account...' : 'Sign Up'}

      </Card>            </Button>

    </div>            

  );            <p className="text-sm text-center text-gray-600">

}              Already have an account?{' '}

```              <Link href="/login" className="text-primary hover:underline">

                Log in

---              </Link>

            </p>

### 5. Implement Forgot Password Page          </CardFooter>

        </form>

**File: `app/forgot-password/page.tsx` or `pages/forgot-password.tsx`**      </Card>

    </div>

```typescript  );

'use client';}

```

import { useState } from 'react';

import { Button } from '@/components/ui/button';#### 2. Login Page

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';```typescript

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';

import Link from 'next/link';import { useState } from 'react';

import { useRouter } from 'next/navigation';import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';

const API_BASE_URL = 'http://localhost:3000';import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

  const [email, setEmail] = useState('');import { Alert, AlertDescription } from '@/components/ui/alert';

  const [error, setError] = useState('');import Link from 'next/link';

  const [success, setSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);export default function LoginPage() {

  const router = useRouter();  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {  const [error, setError] = useState('');

    e.preventDefault();  const [isLoading, setIsLoading] = useState(false);

    setError('');

    setIsLoading(true);  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    try {    setError('');

      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {    setIsLoading(true);

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },    try {

        credentials: 'include',      await login(formData.email, formData.password);

        body: JSON.stringify({ email })    } catch (err: any) {

      });      setError(err.message || 'Login failed');

    } finally {

      const data = await response.json();      setIsLoading(false);

    }

      if (!response.ok) {  };

        throw new Error(data.message || 'Failed to send OTP');

      }  return (

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      setSuccess(true);      <Card className="w-full max-w-md">

              <CardHeader>

      // Redirect to reset password page after 2 seconds          <CardTitle>Welcome Back</CardTitle>

      setTimeout(() => {          <CardDescription>Sign in to continue to your dashboard</CardDescription>

        router.push(`/reset-password?email=${encodeURIComponent(email)}`);        </CardHeader>

      }, 2000);        <form onSubmit={handleSubmit}>

    } catch (err: any) {          <CardContent className="space-y-4">

      setError(err.message || 'Failed to send OTP');            {error && (

    } finally {              <Alert variant="destructive">

      setIsLoading(false);                <AlertDescription>{error}</AlertDescription>

    }              </Alert>

  };            )}

            

  return (            <div className="space-y-2">

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">              <Label htmlFor="email">Email</Label>

      <Card className="w-full max-w-md">              <Input

        <CardHeader>                id="email"

          <CardTitle className="text-2xl">Forgot Password</CardTitle>                type="email"

          <CardDescription>                placeholder="you@example.com"

            Enter your email and we'll send you a 6-digit OTP to reset your password                value={formData.email}

          </CardDescription>                onChange={(e) => setFormData({ ...formData, email: e.target.value })}

        </CardHeader>                required

                      />

        <form onSubmit={handleSubmit}>            </div>

          <CardContent className="space-y-4">

            {error && (            <div className="space-y-2">

              <Alert variant="destructive">              <Label htmlFor="password">Password</Label>

                <AlertDescription>{error}</AlertDescription>              <Input

              </Alert>                id="password"

            )}                type="password"

                            value={formData.password}

            {success && (                onChange={(e) => setFormData({ ...formData, password: e.target.value })}

              <Alert className="bg-green-50 text-green-900 border-green-200">                required

                <AlertDescription>              />

                  ✓ OTP sent successfully! Check your email. Redirecting...            </div>

                </AlertDescription>

              </Alert>            <div className="text-right">

            )}              <Link href="/forgot-password" className="text-sm text-primary hover:underline">

                            Forgot password?

            <div className="space-y-2">              </Link>

              <Label htmlFor="email">Email</Label>            </div>

              <Input          </CardContent>

                id="email"

                type="email"          <CardFooter className="flex flex-col space-y-4">

                placeholder="you@example.com"            <Button type="submit" className="w-full" disabled={isLoading}>

                value={email}              {isLoading ? 'Signing in...' : 'Sign In'}

                onChange={(e) => setEmail(e.target.value)}            </Button>

                required            

                disabled={success || isLoading}            <p className="text-sm text-center text-gray-600">

              />              Don't have an account?{' '}

            </div>              <Link href="/signup" className="text-primary hover:underline">

          </CardContent>                Sign up

              </Link>

          <CardFooter className="flex flex-col space-y-4">            </p>

            <Button type="submit" className="w-full" disabled={isLoading || success}>          </CardFooter>

              {isLoading ? 'Sending OTP...' : 'Send OTP'}        </form>

            </Button>      </Card>

                </div>

            <Link href="/login" className="text-sm text-center text-blue-600 hover:underline">  );

              Back to login}

            </Link>```

          </CardFooter>

        </form>#### 3. Forgot Password Page

      </Card>

    </div>```typescript

  );'use client';

}

```import { useState } from 'react';

import { Button } from '@/components/ui/button';

---import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

### 6. Implement Reset Password Pageimport { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';

**File: `app/reset-password/page.tsx` or `pages/reset-password.tsx`**import Link from 'next/link';

import { useRouter } from 'next/navigation';

```typescript

'use client';export default function ForgotPasswordPage() {

  const [email, setEmail] = useState('');

import { useState } from 'react';  const [error, setError] = useState('');

import { useRouter, useSearchParams } from 'next/navigation';  const [success, setSuccess] = useState(false);

import { Button } from '@/components/ui/button';  const [isLoading, setIsLoading] = useState(false);

import { Input } from '@/components/ui/input';  const router = useRouter();

import { Label } from '@/components/ui/label';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';  const handleSubmit = async (e: React.FormEvent) => {

import { Alert, AlertDescription } from '@/components/ui/alert';    e.preventDefault();

    setError('');

const API_BASE_URL = 'http://localhost:3000';    setIsLoading(true);



export default function ResetPasswordPage() {    try {

  const searchParams = useSearchParams();      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {

  const router = useRouter();        method: 'POST',

  const [formData, setFormData] = useState({        headers: { 'Content-Type': 'application/json' },

    email: searchParams.get('email') || '',        credentials: 'include',

    otp: '',        body: JSON.stringify({ email })

    newPassword: '',      });

    confirmPassword: ''

  });      const data = await response.json();

  const [error, setError] = useState('');

  const [success, setSuccess] = useState(false);      if (!response.ok) {

  const [isLoading, setIsLoading] = useState(false);        throw new Error(data.message || 'Failed to send OTP');

      }

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();      setSuccess(true);

    setError('');      

      // Redirect to reset password page after 2 seconds

    // Client-side validation      setTimeout(() => {

    if (formData.newPassword !== formData.confirmPassword) {        router.push(`/reset-password?email=${encodeURIComponent(email)}`);

      setError('Passwords do not match');      }, 2000);

      return;    } catch (err: any) {

    }      setError(err.message || 'Failed to send OTP');

    } finally {

    if (formData.newPassword.length < 6) {      setIsLoading(false);

      setError('Password must be at least 6 characters');    }

      return;  };

    }

  return (

    if (formData.otp.length !== 6) {    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      setError('OTP must be 6 digits');      <Card className="w-full max-w-md">

      return;        <CardHeader>

    }          <CardTitle>Forgot Password</CardTitle>

          <CardDescription>

    setIsLoading(true);            Enter your email and we'll send you an OTP to reset your password

          </CardDescription>

    try {        </CardHeader>

      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {        <form onSubmit={handleSubmit}>

        method: 'POST',          <CardContent className="space-y-4">

        headers: { 'Content-Type': 'application/json' },            {error && (

        credentials: 'include',              <Alert variant="destructive">

        body: JSON.stringify({                <AlertDescription>{error}</AlertDescription>

          email: formData.email,              </Alert>

          otp: formData.otp,            )}

          newPassword: formData.newPassword            

        })            {success && (

      });              <Alert className="bg-green-50 text-green-900 border-green-200">

                <AlertDescription>

      const data = await response.json();                  OTP sent successfully! Check your email. Redirecting...

                </AlertDescription>

      if (!response.ok) {              </Alert>

        throw new Error(data.message || 'Failed to reset password');            )}

      }            

            <div className="space-y-2">

      setSuccess(true);              <Label htmlFor="email">Email</Label>

                    <Input

      // Redirect to login after 2 seconds                id="email"

      setTimeout(() => {                type="email"

        router.push('/login');                placeholder="you@example.com"

      }, 2000);                value={email}

    } catch (err: any) {                onChange={(e) => setEmail(e.target.value)}

      setError(err.message || 'Failed to reset password');                required

    } finally {                disabled={success}

      setIsLoading(false);              />

    }            </div>

  };          </CardContent>



  return (          <CardFooter className="flex flex-col space-y-4">

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">            <Button type="submit" className="w-full" disabled={isLoading || success}>

      <Card className="w-full max-w-md">              {isLoading ? 'Sending...' : 'Send OTP'}

        <CardHeader>            </Button>

          <CardTitle className="text-2xl">Reset Password</CardTitle>            

          <CardDescription>            <Link href="/login" className="text-sm text-center text-primary hover:underline">

            Enter the OTP sent to your email and choose a new password              Back to login

          </CardDescription>            </Link>

        </CardHeader>          </CardFooter>

                </form>

        <form onSubmit={handleSubmit}>      </Card>

          <CardContent className="space-y-4">    </div>

            {error && (  );

              <Alert variant="destructive">}

                <AlertDescription>{error}</AlertDescription>```

              </Alert>

            )}#### 4. Reset Password Page

            

            {success && (```typescript

              <Alert className="bg-green-50 text-green-900 border-green-200">'use client';

                <AlertDescription>

                  ✓ Password reset successfully! Redirecting to login...import { useState } from 'react';

                </AlertDescription>import { useRouter, useSearchParams } from 'next/navigation';

              </Alert>import { Button } from '@/components/ui/button';

            )}import { Input } from '@/components/ui/input';

            import { Label } from '@/components/ui/label';

            <div className="space-y-2">import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

              <Label htmlFor="email">Email</Label>import { Alert, AlertDescription } from '@/components/ui/alert';

              <Input

                id="email"export default function ResetPasswordPage() {

                type="email"  const searchParams = useSearchParams();

                value={formData.email}  const router = useRouter();

                onChange={(e) => setFormData({ ...formData, email: e.target.value })}  const [formData, setFormData] = useState({

                required    email: searchParams.get('email') || '',

                disabled={success || isLoading}    otp: '',

              />    newPassword: '',

            </div>    confirmPassword: ''

  });

            <div className="space-y-2">  const [error, setError] = useState('');

              <Label htmlFor="otp">6-Digit OTP</Label>  const [success, setSuccess] = useState(false);

              <Input  const [isLoading, setIsLoading] = useState(false);

                id="otp"

                type="text"  const handleSubmit = async (e: React.FormEvent) => {

                placeholder="123456"    e.preventDefault();

                maxLength={6}    setError('');

                value={formData.otp}

                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}    if (formData.newPassword !== formData.confirmPassword) {

                required      setError('Passwords do not match');

                disabled={success || isLoading}      return;

              />    }

              <p className="text-xs text-gray-500">Check your email for the OTP code</p>

            </div>    if (formData.newPassword.length < 6) {

      setError('Password must be at least 6 characters');

            <div className="space-y-2">      return;

              <Label htmlFor="newPassword">New Password</Label>    }

              <Input

                id="newPassword"    setIsLoading(true);

                type="password"

                placeholder="Min. 6 characters"    try {

                value={formData.newPassword}      const response = await fetch('http://localhost:3000/api/auth/reset-password', {

                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}        method: 'POST',

                required        headers: { 'Content-Type': 'application/json' },

                minLength={6}        credentials: 'include',

                disabled={success || isLoading}        body: JSON.stringify({

              />          email: formData.email,

            </div>          otp: formData.otp,

          newPassword: formData.newPassword

            <div className="space-y-2">        })

              <Label htmlFor="confirmPassword">Confirm Password</Label>      });

              <Input

                id="confirmPassword"      const data = await response.json();

                type="password"

                placeholder="Re-enter your password"      if (!response.ok) {

                value={formData.confirmPassword}        throw new Error(data.message || 'Failed to reset password');

                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}      }

                required

                disabled={success || isLoading}      setSuccess(true);

              />      

            </div>      // Redirect to login after 2 seconds

          </CardContent>      setTimeout(() => {

        router.push('/login');

          <CardFooter>      }, 2000);

            <Button type="submit" className="w-full" disabled={isLoading || success}>    } catch (err: any) {

              {isLoading ? 'Resetting password...' : 'Reset Password'}      setError(err.message || 'Failed to reset password');

            </Button>    } finally {

          </CardFooter>      setIsLoading(false);

        </form>    }

      </Card>  };

    </div>

  );  return (

}    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

```      <Card className="w-full max-w-md">

        <CardHeader>

---          <CardTitle>Reset Password</CardTitle>

          <CardDescription>Enter the OTP sent to your email and choose a new password</CardDescription>

### 7. Implement Dashboard (Protected)        </CardHeader>

        <form onSubmit={handleSubmit}>

**File: `app/dashboard/page.tsx` or `pages/dashboard.tsx`**          <CardContent className="space-y-4">

            {error && (

```typescript              <Alert variant="destructive">

'use client';                <AlertDescription>{error}</AlertDescription>

              </Alert>

import { useAuth } from '@/hooks/useAuth';            )}

import ProtectedRoute from '@/components/ProtectedRoute';            

import { Button } from '@/components/ui/button';            {success && (

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';              <Alert className="bg-green-50 text-green-900 border-green-200">

                <AlertDescription>

export default function DashboardPage() {                  Password reset successfully! Redirecting to login...

  const { user, logout } = useAuth();                </AlertDescription>

              </Alert>

  return (            )}

    <ProtectedRoute>            

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">            <div className="space-y-2">

        {/* Navigation Bar */}              <Label htmlFor="email">Email</Label>

        <nav className="bg-white shadow-sm border-b">              <Input

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">                id="email"

            <div className="flex justify-between items-center h-16">                type="email"

              <div className="flex items-center">                value={formData.email}

                <h1 className="text-xl font-bold text-gray-900">                onChange={(e) => setFormData({ ...formData, email: e.target.value })}

                  🎓 University Matcher                required

                </h1>                disabled={success}

              </div>              />

              <div className="flex items-center gap-4">            </div>

                <span className="text-sm text-gray-600">

                  Welcome, <span className="font-medium">{user?.name}</span>            <div className="space-y-2">

                </span>              <Label htmlFor="otp">6-Digit OTP</Label>

                <Button variant="outline" onClick={logout} size="sm">              <Input

                  Logout                id="otp"

                </Button>                type="text"

              </div>                placeholder="123456"

            </div>                maxLength={6}

          </div>                value={formData.otp}

        </nav>                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}

                required

        {/* Main Content */}                disabled={success}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">              />

          <div className="space-y-6">            </div>

            <div>

              <h2 className="text-3xl font-bold text-gray-900">            <div className="space-y-2">

                Find Your Perfect University Match              <Label htmlFor="newPassword">New Password</Label>

              </h2>              <Input

              <p className="mt-2 text-gray-600">                id="newPassword"

                Enter your profile details to get personalized university recommendations                type="password"

              </p>                placeholder="Min. 6 characters"

            </div>                value={formData.newPassword}

                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}

            <Card>                required

              <CardHeader>                minLength={6}

                <CardTitle>Your Profile</CardTitle>                disabled={success}

                <CardDescription>              />

                  Complete your profile to get accurate university matches            </div>

                </CardDescription>

              </CardHeader>            <div className="space-y-2">

              <CardContent>              <Label htmlFor="confirmPassword">Confirm Password</Label>

                {/* Add your matching form here */}              <Input

                {/* Use metadata from /api/metadata for dropdowns */}                id="confirmPassword"

                <p className="text-gray-600">                type="password"

                  Profile form coming soon... This will include fields for:                value={formData.confirmPassword}

                </p>                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}

                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">                required

                  <li>GMAT/GRE scores</li>                disabled={success}

                  <li>GPA and GPA scale</li>              />

                  <li>Work experience</li>            </div>

                  <li>Program type (from metadata)</li>          </CardContent>

                  <li>Industry preference (from metadata)</li>

                  <li>Location preference (from metadata)</li>          <CardFooter>

                </ul>            <Button type="submit" className="w-full" disabled={isLoading || success}>

              </CardContent>              {isLoading ? 'Resetting...' : 'Reset Password'}

            </Card>            </Button>

          </div>          </CardFooter>

        </main>        </form>

      </div>      </Card>

    </ProtectedRoute>    </div>

  );  );

}}

``````



------



## Database Normalization & Metadata### Dashboard Implementation



### CRITICAL: Normalized Schema```typescript

'use client';

The backend database uses **lookup tables** for:

- **program_types**: MBA, MS CS, MS Finance, MS Analyticsimport { useAuth } from '@/hooks/useAuth';

- **countries**: USA, France, UKimport ProtectedRoute from '@/components/ProtectedRoute';

- **industries**: 18 industries (Analytics, AI, Consulting, etc.)import { Button } from '@/components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

### Metadata Endpoint

export default function DashboardPage() {

**GET** `/api/metadata`  const { user, logout } = useAuth();



**Response:**  return (

```json    <ProtectedRoute>

{      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

  "success": true,        <nav className="bg-white shadow-sm border-b">

  "programTypes": ["MBA", "MS Analytics", "MS CS", "MS Finance"],          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

  "countries": ["France", "UK", "USA"],            <div className="flex justify-between items-center h-16">

  "industries": ["Analytics", "Artificial Intelligence", "Consulting", ...]              <h1 className="text-xl font-bold">University Matcher</h1>

}              <div className="flex items-center gap-4">

```                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>

                <Button variant="outline" onClick={logout}>

### Usage Rules                  Logout

                </Button>

✅ **DO:**              </div>

- Fetch metadata on app initialization            </div>

- Use exact string values from API response          </div>

- Cache metadata in state/context        </nav>

- Display values as-is without transformation

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

❌ **DON'T:**          <Card>

- Hardcode dropdown values in frontend            <CardHeader>

- Transform values (e.g., "MBA Program" instead of "MBA")              <CardTitle>Find Your Perfect University Match</CardTitle>

- Use variations (e.g., "US" instead of "USA")              <CardDescription>

- Refetch on every render                Enter your profile details to get personalized university recommendations

              </CardDescription>

### Example Implementation            </CardHeader>

            <CardContent>

```typescript              {/* Add your matching form here */}

// In your dashboard or form component              {/* Use metadata from /api/metadata for dropdowns */}

const [metadata, setMetadata] = useState<{            </CardContent>

  programTypes: string[];          </Card>

  countries: string[];        </main>

  industries: string[];      </div>

} | null>(null);    </ProtectedRoute>

  );

useEffect(() => {}

  const fetchMetadata = async () => {```

    try {

      const response = await fetch('http://localhost:3000/api/metadata', {---

        credentials: 'include'

      });### Critical Implementation Notes

      const data = await response.json();

      if (data.success) {1. **Always include `credentials: 'include'`** in all fetch requests to send session cookies

        setMetadata(data);2. **Use exact values from `/api/metadata`** for program types, countries, and industries

      }3. **Wrap protected pages** with `<ProtectedRoute>` component

    } catch (error) {4. **Use `useAuth` hook** for all authentication operations

      console.error('Failed to fetch metadata:', error);5. **Handle loading states** while checking authentication

    }6. **Display user-friendly error messages** from API responses

  };7. **Implement proper form validation** client-side before API calls

  8. **Use shadcn/ui components** for consistent design (Button, Input, Card, Alert, etc.)

  fetchMetadata();9. **Follow the app's gradient theme**: `bg-gradient-to-br from-blue-50 to-indigo-100`

}, []);10. **Test OTP flow** thoroughly (10-minute expiration, 6-digit validation)



// Use in dropdowns---

<select name="program_type" required>

  <option value="">Select program type</option>### Required shadcn/ui Components

  {metadata?.programTypes.map(type => (

    <option key={type} value={type}>{type}</option>Install these components using `npx shadcn-ui@latest add`:

  ))}

</select>```bash

```npx shadcn-ui@latest add button

npx shadcn-ui@latest add input

---npx shadcn-ui@latest add label

npx shadcn-ui@latest add card

## Required shadcn/ui Componentsnpx shadcn-ui@latest add alert

```

Install these components using shadcn CLI:

---

```bash

npx shadcn-ui@latest add buttonKeep this file alongside `CONTEXT.md` and reference it whenever implementing authentication or university matching features.

npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add alert
```

---

## Design System

### Theme
- **Background**: `bg-gradient-to-br from-blue-50 to-indigo-100`
- **Primary Color**: Blue-600
- **Card Background**: White with shadow
- **Text**: Gray-900 for headings, Gray-600 for descriptions

### Spacing
- Page padding: `px-4 sm:px-6 lg:px-8`
- Section spacing: `space-y-6` or `space-y-8`
- Form fields: `space-y-4`

### Typography
- Page titles: `text-3xl font-bold`
- Card titles: `text-2xl font-bold`
- Descriptions: `text-gray-600`

---

## Critical Implementation Checklist

### Setup
- [ ] Install shadcn/ui components (button, input, label, card, alert)
- [ ] Create `hooks/useAuth.tsx` with AuthProvider
- [ ] Wrap app with `<AuthProvider>` in _app.tsx or layout.tsx
- [ ] Create `components/ProtectedRoute.tsx`

### Pages
- [ ] Create `/signup` page with form validation
- [ ] Create `/login` page with error handling
- [ ] Create `/forgot-password` page with OTP request
- [ ] Create `/reset-password` page with OTP verification
- [ ] Create `/dashboard` page wrapped in ProtectedRoute
- [ ] Add logout button to dashboard nav

### Testing
- [ ] Test signup flow (register → auto-login → dashboard)
- [ ] Test login flow (authenticate → dashboard)
- [ ] Test logout flow (destroy session → redirect to login)
- [ ] Test forgot password flow (request OTP → receive email)
- [ ] Test reset password flow (enter OTP → set new password → login)
- [ ] Test protected route (unauthenticated users redirected to login)
- [ ] Verify `credentials: 'include'` in all API calls
- [ ] Test session persistence across page reloads
- [ ] Test OTP expiration (10 minutes)
- [ ] Test password validation (min 6 characters)

### Integration
- [ ] Implement metadata fetching from `/api/metadata`
- [ ] Use metadata values in all dropdown fields
- [ ] Implement university matching form
- [ ] Implement search functionality
- [ ] Display match results with categories (Safety, Target, Reach)

---

## Authentication Flow Summary

### Sign Up Flow
```
1. User fills signup form (name, email, password)
2. Submit → POST /api/auth/signup
3. Backend creates user + establishes session
4. Frontend receives user data + session cookie
5. Redirect to /dashboard
```

### Login Flow
```
1. User fills login form (email, password)
2. Submit → POST /api/auth/login
3. Backend authenticates + establishes session
4. Frontend receives user data + session cookie
5. Redirect to /dashboard
```

### Logout Flow
```
1. User clicks logout button
2. DELETE /api/auth/logout
3. Backend destroys session
4. Frontend clears user state
5. Redirect to /login
```

### Password Reset Flow
```
1. User enters email → POST /api/auth/forgot-password
2. Backend generates 6-digit OTP + sends email
3. User enters OTP + new password → POST /api/auth/reset-password
4. Backend verifies OTP + resets password
5. Redirect to /login
```

---

## Important Technical Details

### Session Configuration
- **Duration**: 180 days
- **Cookie Name**: `connect.sid`
- **Cookie Settings**: `httpOnly: true`, `sameSite: 'lax'`
- **Credentials**: MUST use `credentials: 'include'` in all fetch requests

### OTP System
- **Format**: 6-digit numeric string (100000-999999)
- **Expiration**: 10 minutes
- **Delivery**: Gmail SMTP (configured in backend)
- **Development**: OTP included in response (NOT in production)

### Password Requirements
- **Minimum Length**: 6 characters
- **Hashing**: Handled by passport-local-mongoose (backend)
- **Reset**: Requires valid OTP

### User Model Fields
```typescript
interface User {
  _id: string;                      // MongoDB ObjectId
  email: string;                    // Unique, used as username
  name: string;                     // Display name
  role?: string;                    // Optional role
  permissions?: string[];           // Optional permissions
  provider: string;                 // 'local', 'google', 'github'
  resetPasswordOTP?: string;        // Temporary OTP
  resetPasswordOTPExpires?: Date;   // OTP expiration
}
```

---

## API Base URL Configuration

**Development:**
```typescript
const API_BASE_URL = 'http://localhost:3000';
```

**Production:**
Create an environment variable:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-production-api.com
```

---

## Common Issues & Solutions

### Issue: Session not persisting
**Solution**: Ensure `credentials: 'include'` in ALL fetch requests

### Issue: CORS errors
**Solution**: Backend must set proper CORS headers with credentials: true

### Issue: OTP not received
**Solution**: Check Gmail SMTP configuration (GMAIL_USER, GMAIL_APP_PASSWORD)

### Issue: Invalid metadata values
**Solution**: Always fetch from `/api/metadata`, never hardcode values

### Issue: Protected route accessible without login
**Solution**: Verify ProtectedRoute component checks isAuthenticated

---

## Next Steps

1. Complete the implementation of all authentication pages
2. Add university matching form with metadata dropdowns
3. Implement results display with match percentages
4. Add search functionality with filters
5. Create user profile page
6. Add email verification (optional enhancement)
7. Implement OAuth login (Google/GitHub) (optional enhancement)

---

**Reference**: See `CONTEXT.md` for complete API documentation

**Last Updated**: October 30, 2025
