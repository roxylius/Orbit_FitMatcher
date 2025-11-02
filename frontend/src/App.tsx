import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import FitMatcher from '@/pages/FitMatcher';
import Search from '@/pages/Search';
import SavedUniversities from '@/pages/SavedUniversities';
import { Login, Signup, ForgotPassword, ResetPassword } from '@/pages/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { AppProvider, ThemeProvider } from '@/contexts';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={
              <ErrorBoundary>
                <Login />
              </ErrorBoundary>
            } />
            <Route path="/signup" element={
              <ErrorBoundary>
                <Signup />
              </ErrorBoundary>
            } />
            <Route path="/forgot-password" element={
              <ErrorBoundary>
                <ForgotPassword />
              </ErrorBoundary>
            } />
            <Route path="/reset-password" element={
              <ErrorBoundary>
                <ResetPassword />
              </ErrorBoundary>
            } />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/search" replace />} />
              <Route path="search" element={
                <ErrorBoundary>
                  <Search />
                </ErrorBoundary>
              } />
              <Route path="fit-matcher" element={
                <ErrorBoundary>
                  <FitMatcher />
                </ErrorBoundary>
              } />
              <Route path="saved" element={
                <ErrorBoundary>
                  <SavedUniversities />
                </ErrorBoundary>
              } />
            </Route>
          </Routes>
        </Router>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
