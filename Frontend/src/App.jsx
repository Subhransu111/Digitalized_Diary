import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CreateCase from './pages/CreateCase';
import CasesList from './pages/CasesList';
import CaseDetails from './pages/CaseDetails';
import useLenis from './hooks/useLenis';

import './App.css';
import './styles/theme.css';
import './styles/navbar.css';
import './styles/dashboard.css';
import './styles/cases.css';
import './styles/createCase.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div className="loading-screen">Authenticating Session...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-case"
          element={
            <ProtectedRoute>
              <PageTransition>
                <CreateCase />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <ProtectedRoute>
              <PageTransition>
                <CasesList />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:id"
          element={
            <ProtectedRoute>
              <PageTransition>
                <CaseDetails />
              </PageTransition>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  useLenis();

  return (
    <Router>
      <div className="App">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
