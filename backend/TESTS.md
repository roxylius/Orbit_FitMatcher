# Unit Tests Documentation

## Overview
This project includes comprehensive unit tests using **Jest** and **Supertest** to ensure code quality and reliability.

## Test Structure
```
src/__tests__/
├── auth.test.ts          # Authentication route tests
├── metadata.test.ts      # Metadata service tests
└── matching.test.ts      # University matching algorithm tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

### 1. Authentication Tests (4 test cases)
**File:** `auth.test.ts`

- ✅ Validates signup route handles missing required fields
- ✅ Accepts valid signup data structure
- ✅ Validates forgot-password requires email
- ✅ Accepts valid email format for password reset

**Purpose:** Ensures authentication endpoints properly validate input and handle edge cases.

---

### 2. Metadata Service Tests (4 test cases)
**File:** `metadata.test.ts`

- ✅ Validates metadata returns program types, countries, and industries
- ✅ Handles database errors gracefully
- ✅ Ensures metadata arrays are not empty
- ✅ Validates metadata response format

**Purpose:** Ensures metadata endpoint provides correct data structure for dropdown population.

---

### 3. University Matching Algorithm Tests (10 test cases)
**File:** `matching.test.ts`

**GPA Normalization (4 tests):**
- ✅ Normalizes 4.0 scale GPA correctly
- ✅ Normalizes 5.0 scale GPA correctly (4.0 → 3.2)
- ✅ Normalizes 10.0 scale GPA correctly (8.5 → 3.4)
- ✅ Normalizes 100.0 scale GPA correctly (85 → 3.4)

**Match Category Classification (3 tests):**
- ✅ Classifies Safety schools (70-100% match)
- ✅ Classifies Target schools (50-69% match)
- ✅ Classifies Reach schools (0-49% match)

**Score Validation (3 tests):**
- ✅ Validates GMAT score range (200-800)
- ✅ Validates GRE score range (260-340)
- ✅ Ensures either GMAT or GRE provided (not both)

**Purpose:** Validates core business logic for university matching algorithm accuracy.

---

## Test Results

```
Test Suites: 3 passed, 3 total
Tests:       18 passed, 18 total
Time:        ~7s
```

## Key Testing Principles Demonstrated

1. **Unit Testing** - Tests individual functions and logic in isolation
2. **API Testing** - Uses Supertest to validate HTTP endpoints
3. **Mock Data** - Mocks database and external dependencies
4. **Edge Cases** - Tests boundary conditions and error scenarios
5. **Business Logic** - Validates core algorithm calculations
6. **Input Validation** - Ensures proper request validation

## Technologies Used

- **Jest** - Testing framework
- **Supertest** - HTTP assertions for Express routes
- **ts-jest** - TypeScript support for Jest
- **@types/jest** - TypeScript types for Jest

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test

- name: Generate Coverage
  run: npm run test:coverage
```

## Adding New Tests

1. Create test file in `src/__tests__/` directory
2. Name file as `*.test.ts`
3. Import necessary modules and use Jest syntax
4. Run `npm test` to verify

Example:
```typescript
describe('Feature Name', () => {
  it('should do something', () => {
    expect(actualValue).toBe(expectedValue);
  });
});
```

---

**Last Updated:** October 30, 2025
