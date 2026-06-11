import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react"; // Import Auth0
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard'; // Import Dashboard
import './App.css';
import CreateCase from './pages/CreateCase';
import CasesList from './pages/CasesList';
import CaseDetails from './pages/CaseDetails';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Protect the Dashboard Route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-case" 
            element={
              <ProtectedRoute>
                <CreateCase />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cases" 
            element={
              <ProtectedRoute>
                <CasesList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cases/:id" 
            element={
              <ProtectedRoute>
                <CaseDetails />
              </ProtectedRoute>
            } 
          />
        </Routes>
        

      </div>
    </Router>
  );
}

export default App;
