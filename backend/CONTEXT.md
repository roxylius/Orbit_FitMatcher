# Backend API Context for Frontend Development

## Base URL
```
Development: http://localhost:3000
Production: TBD
```

## API Endpoints

### 1. Health Check
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

### 2. Match Universities (POST)
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

### 3. Search Universities (GET)
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

### 4. Metadata for Autocomplete (GET)
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

## Database
- **Type**: PostgreSQL (Supabase)
- **Connection**: Pooled connection (transaction mode)
- **Connection String Format**: 
  ```
  postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
  ```

---

## Environment Variables Required
```env
NODE_ENV=development
PROD_POSTGRES_URI=postgresql://postgres.PROJECT_REF:PASSWORD@HOST:6543/postgres
```

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
├── app.ts                    # Express app configuration
├── server.ts                 # Server entry point
├── config/
│   └── db.ts                 # PostgreSQL connection pool
├── controllers/
│   ├── matchController.ts    # Match endpoint HTTP handler
│   └── searchController.ts   # Search endpoint HTTP handler
├── services/
│   ├── matchingService.ts    # Match algorithm business logic
│   └── searchService.ts      # Search filtering business logic
├── routes/
│   ├── index.ts              # Route aggregator
│   ├── matchRoutes.ts        # Match routes (deprecated)
│   └── searchRoutes.ts       # Search routes (deprecated)
├── types/
│   └── matching.ts           # TypeScript interfaces
├── utils/
│   ├── logger.ts             # log4js logger utility
│   └── helpers/
│       ├── scoreNormalization.ts  # GPA/test score helpers
│       └── matchHelpers.ts        # Category helpers
└── middleware/
    ├── errorHandler.js       # Error handling middleware
    └── validator.js          # Validation middleware
```

### Logging
All endpoints and services have comprehensive entry/exit logging using log4js.

---

## Contact & Support
For backend issues or questions, refer to the development team.

**Last Updated:** October 29, 2025
