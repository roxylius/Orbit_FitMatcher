# Frontend Development Guide: Database Normalization & Metadata

## Database Architecture (Normalized Schema)

**CRITICAL**: The backend database uses a **normalized schema** with lookup tables. Understanding this is essential for frontend development.

### What This Means:
- **program_type**, **location_country**, and **primary_industry** are stored as **foreign keys** (integers) in the database
- API responses return **denormalized data** (strings) by joining with lookup tables
- Only **exact values** from lookup tables are valid - using any other value will cause **400 validation errors**

### Lookup Tables:
1. **program_types**: 4 program types (MBA, MS CS, MS Finance, MS Analytics)
2. **countries**: 3 countries (USA, France, UK) with regions (North America, Europe)
3. **industries**: 18 industries (Analytics, AI, Consulting, Cybersecurity, Data Science, Entrepreneurship, Finance, Healthcare, Marketing, Media, Operations, Quantitative Finance, Risk Management, Robotics, Social Impact, Software Engineering, Sustainability, Technology)

### Why Exact Values Matter:
❌ Sending `"MBA Program"` instead of `"MBA"` → **400 Bad Request**
❌ Sending `"United States"` instead of `"USA"` → **400 Bad Request**
❌ Sending `"Data Analytics"` instead of `"Data Science"` → **400 Bad Request**

The backend validates all incoming values against the lookup tables. Only exact string matches are accepted.

---

## Metadata Endpoint: Authoritative Source for Dropdowns

### Endpoint

```
GET /api/metadata
```

### Response Structure

```typescript
{
  success: boolean;
  programTypes: string[];  // From program_types table (4 values)
  countries: string[];     // From countries table (3 values)
  industries: string[];    // From industries table (18 values)
}
```

### Actual Values (Current Schema):

**programTypes**: `["MBA", "MS Analytics", "MS CS", "MS Finance"]`

**countries**: `["France", "UK", "USA"]`

**industries**: `["Analytics", "Artificial Intelligence", "Consulting", "Cybersecurity", "Data Science", "Entrepreneurship", "Finance", "Healthcare", "Marketing", "Media", "Operations", "Quantitative Finance", "Risk Management", "Robotics", "Social Impact", "Software Engineering", "Sustainability", "Technology"]`

---

## Usage Instructions

### 1. Fetch Metadata on App Initialization

```typescript
useEffect(() => {
  const fetchMetadata = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/metadata');
      const data = await response.json();
      
      if (data.success) {
        // Store in state/context
        setProgramTypes(data.programTypes);
        setCountries(data.countries);
        setIndustries(data.industries);
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }
  };
  
  fetchMetadata();
}, []); // Run once on mount
```

### 2. Use Exact Values in Dropdowns

```typescript
<select name="program_type" required>
  <option value="">Select program type</option>
  {programTypes.map(type => (
    <option key={type} value={type}>{type}</option>
  ))}
</select>

<select name="location_country">
  <option value="">Any country</option>
  {countries.map(country => (
    <option key={country} value={country}>{country}</option>
  ))}
</select>

<select name="primary_industry">
  <option value="">Any industry</option>
  {industries.map(industry => (
    <option key={industry} value={industry}>{industry}</option>
  ))}
</select>
```

### 3. Cache Values (Don't Refetch on Every Render)

- **Fetch once** on app initialization
- **Store in global state** (Context API, Redux, Zustand, etc.)
- **Refresh on app reload** (not on component remount)
- Consider **localStorage caching** with TTL for better UX

---

## Important Rules

### ✅ DO:
- **Always fetch from `/api/metadata`** to populate dropdowns
- **Use exact string values** from the API response
- **Cache metadata** in state/context to avoid repeated calls
- **Display values as-is** without transformation

### ❌ DON'T:
- **Hardcode dropdown values** in frontend code
- **Transform values** (e.g., adding suffixes like "Program")
- **Use variations** (e.g., "US" instead of "USA")
- **Assume values** - always fetch from the endpoint
- **Refetch on every render** - cache the response

---

## Removed Fields (No Longer in Schema)

The following fields have been **permanently removed** from the database and **will NOT appear in API responses**:

- ❌ `class_size: number | null`
- ❌ `secondary_industries: string[] | null`
- ❌ `international_student_ratio: number | null`

**Do not expect, display, or reference these fields in your UI.**

---

## Migration Impact for Frontend

If you have existing frontend code:

1. **Remove references** to `class_size`, `secondary_industries`, `international_student_ratio`
2. **Update TypeScript interfaces** to match the new schema (see CONTEXT.md)
3. **Implement metadata fetching** if not already done
4. **Update dropdown populations** to use `/api/metadata`
5. **Test form submissions** to ensure exact value matching

---

## Quick Reference Prompt for Frontend Components

When generating or updating frontend components that collect user input:

```
You are implementing form controls for the Orbit AI Right Fit Matcher frontend.
The backend uses a normalized database with lookup tables for program_type, location_country, and primary_industry.
MUST fetch metadata from GET /api/metadata and use the exact values returned to populate dropdowns.
The API will reject any value not in the lookup tables with a 400 error.
Cache the metadata response per session to avoid repeated API calls.
Do NOT hardcode values or use variations (e.g., "USA" not "US" or "United States").
Refer to CONTEXT.md for full API documentation.
```

Keep this file alongside `CONTEXT.md` and reference it whenever new frontend forms or filters are added.
