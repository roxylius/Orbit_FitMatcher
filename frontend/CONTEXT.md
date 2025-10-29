# Backend API Context for Frontend Development

## Base URL
```
Development: http://localhost:3000
Production: TBD
```

## Authentication

The API uses **session-based authentication** with Passport.js. All protected endpoints require an active session cookie.

### Session Storage
- **Database**: MongoDB (separate from PostgreSQL university data)
- **Strategy**: passport-local (email + password)
- **Cookie Name**: `connect.sid`
- **Session Duration**: 180 days
- **Cookie Settings**: `httpOnly: true`, `secure: false` (dev), `sameSite: 'lax'`

### User Model
```typescript
interface User {
  _id: string;                      // MongoDB ObjectId
  email: string;                    // Unique identifier (username)
  name: string;                     // Display name
  role?: string;                    // User role
  permissions?: string[];           // User permissions array
  provider: string;                 // 'local', 'google', 'github'
  googleId?: string;                // OAuth ID (if Google login)
  githubId?: string;                // OAuth ID (if GitHub login)
  resetPasswordOTP?: string;        // 6-digit OTP for password reset
  resetPasswordOTPExpires?: Date;   // OTP expiration timestamp
}
```

---

## API Endpoints

### Authentication Endpoints

#### 1. Sign Up (Register New User)
**POST** `/api/auth/signup`

**Description:** Register a new user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",      // Required, unique
  "password": "SecurePass123",      // Required, min 6 characters
  "name": "John Doe",               // Required
  "role": "student",                // Optional
  "permissions": ["view", "edit"]   // Optional array
}
```

**Success Response (200):**
```json
{
  "message": "User Authenticated!",
  "userObj": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "permissions": ["view", "edit"],
    "provider": "local"
  }
}
```

**Error Response (401):**
```json
{
  "message": "The email already exists!"
}
```

**Notes:**
- Automatically logs in user after successful registration
- Sets session cookie in response
- Password is hashed using passport-local-mongoose

---

#### 2. Login
**POST** `/api/auth/login`

**Description:** Authenticate existing user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",      // Required
  "password": "SecurePass123"       // Required
}
```

**Success Response (200):**
```json
{
  "message": "Login successful.",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

**Error Responses:**
```json
// 401 - Invalid credentials
{
  "message": "Invalid email or password."
}

// 404 - User not found
{
  "message": "User not found."
}

// 500 - Server error
{
  "message": "An error occurred during authentication."
}
```

---

#### 3. Logout
**DELETE** `/api/auth/logout`

**Description:** Destroy user session and log out.

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "User Logged Out"
}
```

**Error Response (401):**
```json
{
  "message": "Unable to Logout!"
}
```

**Notes:**
- Clears session from server
- Invalidates session cookie
- Requires active session to call

---

#### 4. Forgot Password (Request OTP)
**POST** `/api/auth/forgot-password`

**Description:** Generate and email a 6-digit OTP for password reset.

**Request Body:**
```json
{
  "email": "user@example.com"       // Required
}
```

**Success Response (200):**
```json
{
  "success": true,
  "emailExists": true,
  "message": "OTP has been sent to your email address. Please check your inbox.",
  "otp": "123456"                   // Only in development (NODE_ENV !== 'production')
}
```

**Error Responses:**
```json
// 404 - Email not found
{
  "success": false,
  "emailExists": false,
  "message": "No account found with this email address. Please check your email or sign up."
}

// 400 - Missing email
{
  "success": false,
  "message": "Email is required."
}

// 500 - Email send failed
{
  "success": false,
  "message": "Failed to send OTP email. Please try again later."
}
```

**Notes:**
- OTP is **6 digits** (100000-999999)
- OTP expires in **10 minutes**
- OTP is sent via Gmail SMTP (configured with GMAIL_USER and GMAIL_APP_PASSWORD)
- In production, OTP is NOT returned in response (only sent via email)

---

#### 5. Verify OTP (Optional Pre-check)
**POST** `/api/auth/reset-password/verify-otp`

**Description:** Verify OTP before password reset (optional step for better UX).

**Request Body:**
```json
{
  "email": "user@example.com",      // Required
  "otp": "123456"                   // Required, 6-digit string
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password.",
  "email": "user@example.com"
}
```

**Error Responses:**
```json
// 400 - Invalid OTP
{
  "success": false,
  "message": "Invalid OTP. Please check and try again."
}

// 400 - OTP expired
{
  "success": false,
  "message": "OTP has expired. Please request a new one."
}

// 400 - No OTP found
{
  "success": false,
  "message": "No OTP request found. Please request a new OTP."
}

// 400 - Missing fields
{
  "success": false,
  "message": "Email and OTP are required."
}
```

---

#### 6. Reset Password
**POST** `/api/auth/reset-password`

**Description:** Reset password using verified OTP.

**Request Body:**
```json
{
  "email": "user@example.com",      // Required
  "otp": "123456",                  // Required, 6-digit string
  "newPassword": "NewSecurePass123" // Required, min 6 characters
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Error Responses:**
```json
// 400 - Password too short
{
  "success": false,
  "message": "Password must be at least 6 characters long."
}

// 400 - Invalid OTP
{
  "success": false,
  "message": "Invalid OTP. Please check and try again."
}

// 400 - OTP expired
{
  "success": false,
  "message": "OTP has expired. Please request a new one."
}

// 400 - Missing fields
{
  "success": false,
  "message": "Email, OTP, and new password are required."
}

// 500 - Password reset failed
{
  "success": false,
  "message": "Failed to reset password. Please try again."
}
```

**Notes:**
- Verifies OTP before resetting password
- Clears OTP fields after successful reset
- Sends confirmation email to user
- Uses passport-local-mongoose's `setPassword()` method for secure hashing

---

### University Endpoints

#### 7. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "status": "ok",
  "message": "University Matching API is running",
  "timestamp": "2025-10-29T04:18:18.000Z"
}
```

---

#### 8. Match Universities (POST)
**POST** `/api/match`

**Description:** Get personalized university matches based on user profile using a multi-factor scoring algorithm.

**Request Body:**
```json
{
  "gmat_score": 700,              // Optional (either gmat_score or gre_score required)
  "gre_score": 320,               // Optional (either gmat_score or gre_score required)
  "gpa": 3.5,                     // Required (0.0 - 4.0 or higher based on scale)
  "gpa_scale": 4.0,               // Optional (default: 4.0, supports: 4.0, 5.0, 10.0, 100.0)
  "work_experience": 3,           // Required (years, can be 0)
  "program_type": "MBA",          // Required (MBA, MS CS, MS Finance, MS Analytics, etc.)
  "industry_preference": "Tech",  // Optional
  "nationality": "India",         // Optional
  "visa_required": true,          // Optional (boolean)
  "preferred_location": "USA"     // Optional
}
```

**Validation Rules:**
- Either `gmat_score` OR `gre_score` is required (not both)
- `gmat_score`: 200-800
- `gre_score`: 260-340
- `gpa`: Must be between 0 and the specified `gpa_scale`
- `work_experience`: Required (number, can be 0)
- `program_type`: Required (string)

**Response:**
```json
{
  "success": true,
  "count": 15,
  "profile_summary": {
    "test_score": 700,
    "gpa": 3.5,
    "gpa_scale": 4.0,
    "work_experience": 3,
    "program_type": "MBA"
  },
  "matches": [
    {
      "university": {
        "university_id": 1,
        "name": "Harvard Business School",
        "program_name": "MBA",
        "program_type": "MBA",
        "location_city": "Boston",
        "location_country": "USA",
        "location_region": "North America",
        "ranking": 1,
        "acceptance_rate": 9.0,
        "median_gmat": 730,
        "median_gre": 328,
        "median_gpa": 3.70,
        "avg_work_experience": 4.7,
        "tuition_usd": 73440,
        "avg_starting_salary_usd": 175000,
        "scholarship_available": true,
        "visa_sponsorship": true,
        "primary_industry": "Consulting",
        "post_study_work_support": "Strong"
      },
      "match_percentage": 78.5,
      "category": "Target",
      "reasons": [
        "Your GMAT score (700) is close to the median (730) - solid competitive position.",
        "Your work experience (3 years) aligns well with the average (4.7 years).",
        "Visa sponsorship available for international students.",
        "Strong industry alignment with Consulting sector.",
        "Very competitive (9.0% acceptance rate)."
      ]
    }
  ]
}
```

**Match Categories:**
- **Safety**: 70-100% match - High likelihood of admission
- **Target**: 50-69% match - Moderate likelihood of admission
- **Reach**: 0-49% match - Challenging but possible

**Error Responses:**
```json
{
  "success": false,
  "error": "Either GMAT score or GRE score is required"
}
```

---

#### 9. Search Universities (GET)
**GET** `/api/search`

**Description:** Search and filter universities with multiple criteria, sorted and paginated results.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `program` | string | No | Program type filter | `MBA`, `MS CS` |
| `location_country` | string | No | Country (partial match) | `USA`, `Canada` |
| `min_acceptance` | number | No | Min acceptance rate (%) | `5` |
| `max_acceptance` | number | No | Max acceptance rate (%) | `20` |
| `visa_sponsorship` | boolean | No | Visa sponsorship required | `true`, `false` |
| `min_tuition` | number | No | Min tuition (USD) | `30000` |
| `max_tuition` | number | No | Max tuition (USD) | `60000` |
| `min_ranking` | number | No | Min ranking | `1` |
| `max_ranking` | number | No | Max ranking | `50` |
| `post_study_work` | string | No | Post-study work support | `OPT`, `H1B` |
| `has_scholarships` | boolean | No | Scholarship availability | `true`, `false` |
| `sort_by` | string | No | Sort field | `ranking`, `acceptance_rate`, `tuition_usd`, `avg_starting_salary_usd`, `name` |
| `order` | string | No | Sort order | `asc`, `desc` |
| `limit` | number | No | Results per page (max 100) | `20` |
| `offset` | number | No | Pagination offset | `0` |

**Example Requests:**

1. **MBA programs in USA with visa sponsorship:**
```
GET /api/search?program=MBA&location_country=USA&visa_sponsorship=true&sort_by=ranking&limit=10
```

2. **Affordable MS CS programs:**
```
GET /api/search?program=MS%20CS&min_tuition=30000&max_tuition=60000&sort_by=tuition_usd&order=asc
```

3. **Top 20 schools with high acceptance rates:**
```
GET /api/search?min_ranking=1&max_ranking=20&min_acceptance=15&sort_by=ranking
```

4. **Programs with scholarships in Canada:**
```
GET /api/search?location_country=Canada&has_scholarships=true
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "pages": 5,
  "filters": {
    "program": "MBA",
    "location_country": "USA",
    "acceptance_rate": { "min": null, "max": null },
    "visa_sponsorship": true,
    "tuition_range": { "min": null, "max": null },
    "ranking_range": { "min": null, "max": null },
    "post_study_work": null,
    "has_scholarships": null
  },
  "sort": {
    "field": "ranking",
    "order": "asc"
  },
  "universities": [
    {
      "university_id": 1,
      "name": "Harvard Business School",
      "program_name": "MBA",
      "program_type": "MBA",
      "location_city": "Boston",
      "location_country": "USA",
      "location_region": "North America",
      "ranking": 1,
      "acceptance_rate": 9.0,
      "median_gmat": 730,
      "median_gre": 328,
      "median_gpa": 3.70,
      "avg_work_experience": 4.7,
      "tuition_usd": 73440,
      "avg_starting_salary_usd": 175000,
      "scholarship_available": true,
      "visa_sponsorship": true,
      "primary_industry": "Consulting",
      "post_study_work_support": "Strong"
    }
  ]
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "Internal server error while searching universities"
}
```

---

#### 10. Metadata for Autocomplete (GET)
**GET** `/api/metadata`

**Description:** Retrieve normalized lists of program types, countries, and industries to power dropdown suggestions and maintain data consistency between frontend and backend.

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "programTypes": ["MBA", "MS Analytics", "MS CS", "MS Finance"],
  "countries": ["France", "UK", "USA"],
  "industries": ["Analytics", "Artificial Intelligence", "Consulting", "Cybersecurity", "Data Science", "Entrepreneurship", "Finance", "Healthcare", "Marketing", "Media", "Operations", "Quantitative Finance", "Risk Management", "Robotics", "Social Impact", "Software Engineering", "Sustainability", "Technology"]
}
```

**Usage Notes:**
- Use these arrays to populate dropdowns/autocomplete inputs for `program_type`, `location_country`, and `industry_preference`.
- The backend queries **normalized lookup tables** (`program_types`, `countries`, `industries`) for authoritative values.
- These lookup tables are the single source of truth, preventing data inconsistency between frontend and backend.
- Frontend should cache results per session and refetch periodically (e.g., every 12 hours) to pick up database updates.
- **Database is now normalized**: Universities table uses foreign keys to these lookup tables instead of denormalized VARCHAR fields.
- **Important**: Only use values returned by this endpoint to prevent validation errors when submitting forms.

---

## Data Models

### Database Schema (Normalized)

The database follows a normalized relational design with the following structure:

**Lookup Tables:**
- `program_types` - Stores distinct program types (MBA, MS CS, MS Finance, MS Analytics)
- `countries` - Stores countries with regions (USA, France, UK)
- `industries` - Stores industries (Consulting, Technology, Finance, etc.)

**Main Table:**
- `universities` - Contains university data with foreign keys to lookup tables

### University Schema
```typescript
interface University {
  university_id: number;              // Unique identifier
  name: string;                       // University name
  program_name: string;               // Program name
  program_type: string;               // MBA, MS CS, MS Finance, etc. (joined from program_types table)
  location_city: string | null;      // City
  location_country: string | null;   // Country (joined from countries table)
  location_region: string | null;    // State/Region (joined from countries table)
  ranking: number | null;            // Global/Program ranking
  acceptance_rate: number | null;    // Percentage (0-100)
  median_gmat: number | null;        // Median GMAT score (200-800)
  median_gre: number | null;         // Median GRE score (260-340)
  median_gpa: number | null;         // Median GPA (0.0-4.0)
  avg_work_experience: number | null; // Average years
  tuition_usd: number | null;        // Annual tuition in USD
  avg_starting_salary_usd: number | null; // Average post-graduation salary
  scholarship_available: boolean | null;  // Scholarship availability
  visa_sponsorship: boolean | null;  // Visa sponsorship offered
  primary_industry: string | null;   // Primary recruiting industry (joined from industries table)
  post_study_work_support: string | null; // OPT, CPT, H1B, etc.
}

// REMOVED FIELDS (no longer in database):
// - class_size: number | null;
// - secondary_industries: string[] | null;
// - international_student_ratio: number | null;
```

### Match Result Schema
```typescript
interface MatchResult {
  university: University;            // Full university object
  match_percentage: number;          // 0-100 score
  category: string;                  // "Safety" | "Target" | "Reach"
  reasons: string[];                 // Array of explanation strings (max 6)
}
```

### User Profile Schema (for matching)
```typescript
interface UserProfile {
  gmat_score?: number;               // 200-800
  gre_score?: number;                // 260-340
  gpa: number;                       // Required
  gpa_scale?: number;                // 4.0, 5.0, 10.0, 100.0
  work_experience: number;           // Required (years)
  program_type: string;              // Required
  industry_preference?: string;      // Optional
  nationality?: string;              // Optional
  visa_required?: boolean;           // Optional
  preferred_location?: string;       // Optional
}
```

---

## Matching Algorithm

### Scoring Factors (Total: 100%)
1. **Test Score (35%)** - GMAT or GRE comparison to median
2. **GPA (25%)** - Normalized GPA comparison to median
3. **Work Experience (20%)** - Years of experience alignment
4. **Acceptance Rate (10%)** - Inverse competitiveness factor
5. **Visa Sponsorship (5%)** - Availability for international students
6. **Industry Alignment (3%)** - Career interest match
7. **Location Preference (2%)** - Geographic preference match

### GPA Normalization
The API automatically normalizes GPAs from different scales to 4.0:
- **4.0 scale**: No conversion
- **5.0 scale**: `(gpa / 5.0) * 4.0`
- **10.0 scale**: `(gpa / 10.0) * 4.0`
- **100.0 scale**: `(gpa / 100.0) * 4.0`

### Test Score Handling
- **No conversion between GMAT and GRE**
- Each university has separate medians for GMAT and GRE
- Algorithm compares your score to the corresponding median

---

## Error Handling

### HTTP Status Codes
- `200 OK` - Successful request
- `400 Bad Request` - Validation error (missing/invalid parameters)
- `500 Internal Server Error` - Database or server error

### Common Errors

**Missing Required Fields:**
```json
{
  "success": false,
  "error": "Either GMAT score or GRE score is required"
}
```

**Invalid Score Range:**
```json
{
  "success": false,
  "error": "GMAT score must be between 200 and 800"
}
```

**Invalid GPA:**
```json
{
  "success": false,
  "error": "GPA must be between 0 and 4.0"
}
```

---

## CORS Configuration
The API has CORS enabled for all origins in development. Update for production deployment.

---

## Rate Limiting
Currently not implemented. Consider implementing for production.

---

## Databases

### PostgreSQL (University Data)
- **Type**: PostgreSQL (Supabase)
- **Connection**: Pooled connection (transaction mode)
- **Connection String Format**: 
  ```
  postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
  ```
- **Purpose**: Stores university data, program types, countries, industries (normalized schema)

### MongoDB (Authentication & Sessions)
- **Type**: MongoDB (Local or Atlas)
- **Connection**: Mongoose ODM
- **Purpose**: User authentication, session storage
- **Collections**: 
  - `users` - User accounts with hashed passwords
  - `sessions` - Active user sessions (managed by connect-mongodb-session)

---

## Environment Variables Required
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# PostgreSQL (University Data)
PROD_POSTGRES_URI=postgresql://postgres.PROJECT_REF:PASSWORD@HOST:6543/postgres

# MongoDB (User Authentication & Sessions)
MONGODB_URI=mongodb://localhost:27017/university-matcher
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname

# Session Configuration
SESSION_SECRET=your-secret-key-change-in-production

# Email Configuration (Gmail SMTP for OTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

**Email Setup Notes:**
- Use Gmail App Password (not regular password)
- Generate at: https://myaccount.google.com/apppasswords
- Requires 2FA enabled on Gmail account

---

## Available Program Types
- MBA
- MS CS (Master of Science in Computer Science)
- MS Finance
- MS Analytics
- MS Data Science
- MS Engineering
- MIM (Master in Management)

---

## Sample Countries in Database
- USA
- Canada
- UK
- Australia
- Germany
- Singapore
- France
- Netherlands

---

## Frontend Integration Tips

### 1. Form Validation
- Validate test scores client-side before submission
- Ensure either GMAT or GRE is provided (not both)
- Convert GPA to appropriate scale if needed

### 2. Error Display
- Parse `error` field from response for user-friendly messages
- Show validation errors inline on form fields

### 3. Loading States
- Match endpoint can take 1-3 seconds depending on database query
- Show loading spinner during API calls

### 4. Pagination for Search
- Use `page`, `pages`, and `total` fields for pagination UI
- Calculate next page: `offset = (page * limit)`

### 5. Result Display
- **Match Percentage**: Show as progress bar or badge
- **Category**: Color-code (Safety=green, Target=yellow, Reach=red)
- **Reasons**: Display as bullet points or card items

### 6. Filter State Management
- Store active filters in URL query parameters for shareability
- Clear filters should reset to default sort (ranking, asc)

### 7. Sorting UI
- Provide dropdown for sort field
- Toggle button for ascending/descending order

---

## Testing Endpoints

### cURL Examples

**Match Request:**
```bash
curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "gmat_score": 700,
    "gpa": 3.5,
    "work_experience": 3,
    "program_type": "MBA",
    "visa_required": true,
    "preferred_location": "USA"
  }'
```

**Search Request:**
```bash
curl "http://localhost:3000/api/search?program=MBA&location_country=USA&visa_sponsorship=true&sort_by=ranking&limit=5"
```

---

## TypeScript Types (Copy to Frontend)

```typescript
// Copy these interfaces to your frontend for type safety

export interface University {
  university_id: number;
  name: string;
  program_name: string;
  program_type: string;               // Joined from program_types table
  location_city: string | null;
  location_country: string | null;    // Joined from countries table
  location_region: string | null;     // Joined from countries table (region)
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
  primary_industry: string | null;    // Joined from industries table
  post_study_work_support: string | null;
}

// REMOVED FIELDS (no longer in API responses):
// - class_size: number | null;
// - secondary_industries: string[] | null;
// - international_student_ratio: number | null;

export interface MatchResult {
  university: University;
  match_percentage: number;
  category: 'Safety' | 'Target' | 'Reach';
  reasons: string[];
}

export interface MatchResponse {
  success: boolean;
  count: number;
  profile_summary: {
    test_score: number | string;
    gpa: number;
    gpa_scale: number;
    work_experience: number;
    program_type: string;
  };
  matches: MatchResult[];
}

export interface MetadataResponse {
  success: boolean;
  programTypes: string[];  // From program_types table
  countries: string[];     // From countries table
  industries: string[];    // From industries table
}

export interface SearchResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  filters: {
    program?: string;
    location_country?: string;
    acceptance_rate?: { min?: number; max?: number };
    visa_sponsorship?: boolean;
    tuition_range?: { min?: number; max?: number };
    ranking_range?: { min?: number; max?: number };
    post_study_work?: string;
    has_scholarships?: boolean;
  };
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
  universities: University[];
}

export interface ErrorResponse {
  success: false;
  error: string;
}
```

---

## Development Notes

### Backend Architecture
```
src/
├── app.ts                          # Express app configuration
├── server.ts                       # Server entry point
├── config/
│   └── db.ts                       # PostgreSQL connection pool
├── controllers/
│   ├── matchController.ts          # Match endpoint HTTP handler
│   ├── searchController.ts         # Search endpoint HTTP handler
│   └── metadataController.ts       # Metadata endpoint HTTP handler
├── services/
│   ├── matchingService.ts          # Match algorithm business logic
│   ├── searchService.ts            # Search filtering business logic
│   ├── metadataService.ts          # Metadata retrieval service
│   └── emailService.ts             # Email sending (OTP, confirmations)
├── routes/
│   ├── index.ts                    # Route aggregator (all /api routes)
│   ├── auth/
│   │   ├── index.ts                # Auth route aggregator
│   │   ├── signup.ts               # POST /api/auth/signup
│   │   ├── login.ts                # POST /api/auth/login
│   │   ├── logout.ts               # DELETE /api/auth/logout
│   │   ├── forgotPassword.ts       # POST /api/auth/forgot-password
│   │   └── resetPassword.ts        # POST /api/auth/reset-password
│   ├── matchRoutes.ts              # Match routes (deprecated)
│   └── searchRoutes.ts             # Search routes (deprecated)
├── models/
│   └── user.ts                     # Mongoose User schema
├── types/
│   └── index.ts                    # TypeScript interfaces
├── utils/
│   └── logger.ts                   # log4js logger utility
└── middleware/
    └── errorHandler.ts             # Error handling middleware
```

### Logging
All endpoints and services have comprehensive entry/exit logging using log4js.

---

## Contact & Support
For backend issues or questions, refer to the development team.

## Authentication Flow for Frontend

### 1. Sign Up Flow
```
User submits form → POST /api/auth/signup → User created → Session established → Redirect to dashboard
```

### 2. Login Flow
```
User submits form → POST /api/auth/login → Session established → Redirect to dashboard
```

### 3. Logout Flow
```
User clicks logout → DELETE /api/auth/logout → Session destroyed → Redirect to login
```

### 4. Forgot Password Flow
```
Step 1: User enters email → POST /api/auth/forgot-password → OTP sent via email
Step 2: User enters OTP + new password → POST /api/auth/reset-password → Password updated → Redirect to login
```

**Optional UX Enhancement:**
```
Step 1: User enters email → POST /api/auth/forgot-password → OTP sent
Step 2: User enters OTP → POST /api/auth/reset-password/verify-otp → OTP verified
Step 3: User enters new password → POST /api/auth/reset-password → Password updated
```

### Session Management
- **Cookie-based**: Session ID stored in `connect.sid` cookie
- **Auto-refresh**: Session extends on each request
- **Expiration**: 180 days of inactivity
- **Credentials**: Must include `credentials: 'include'` in fetch requests

**Example Fetch with Credentials:**
```javascript
fetch('http://localhost:3000/api/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // CRITICAL: Include session cookie
  body: JSON.stringify(matchData)
})
```

---

**Last Updated:** October 30, 2025
