import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import FitMatcher from '@/pages/FitMatcher';
import Search from '@/pages/Search';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/search" replace />} />
          <Route path="search" element={<Search />} />
          <Route path="fit-matcher" element={<FitMatcher />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
