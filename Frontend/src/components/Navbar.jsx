import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react"; // Import hook
import '../App.css';

const Navbar = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Cyber Diary</h1>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-item">Home</Link>
        
        {/* NEW: Only show Dashboard link if logged in */}
        {isAuthenticated && (
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
        )}

        {!isAuthenticated ? (
          // ... existing login buttons
          <>
            <button onClick={() => loginWithRedirect()} className="nav-btn login-btn">Login</button>
            <button onClick={() => loginWithRedirect({ screen_hint: 'signup' })} className="nav-btn signup-btn">Sign Up</button>
          </>
        ) : (
           // ... existing logout/user section
           <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
             {/* ... */}
           </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;