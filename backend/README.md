# Backend Project

This is a Node.js TypeScript backend project.

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/roxylius/Orbit_FitMatcher.git
   ```

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Compile the TypeScript files:
   ```
   npm run build
   ```

5. Start the application:
   ```
   npm run dev
   ```

## Usage Guidelines

- The application is structured to separate concerns, with the main application logic in `src/app.ts` and type definitions in `src/types/index.ts`.
- Modify the `src/app.ts` file to add routes and middleware as needed.
- Use the `src/types/index.ts` file to define and export any interfaces or types that will be used throughout the application for better type safety.