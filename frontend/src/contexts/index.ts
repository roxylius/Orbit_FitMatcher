// Unified Context - All exports from AppContext
export { AppProvider, useApp, useAuth, useMetadata, useSavedUniversities, useSearch } from './AppContext';
export type { User, University, MatchResult, Metadata } from './AppContext';

// Theme Context
export { ThemeProvider, useTheme } from './ThemeContext';