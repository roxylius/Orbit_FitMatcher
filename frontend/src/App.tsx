import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import FitMatcher from '@/pages/FitMatcher';
import Search from '@/pages/Search';
import SavedUniversities from '@/pages/SavedUniversities';
import { Login, Signup, ForgotPassword, ResetPassword } from '@/pages/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AppProvider } from '@/contexts';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/search" replace />} />
            <Route path="search" element={<Search />} />
            <Route path="fit-matcher" element={<FitMatcher />} />
            <Route path="saved" element={<SavedUniversities />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
