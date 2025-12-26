import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import '../App.css';

const Navbar = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Cyber Diary</h1>
      </div>
      
      <div className="navbar-links">
        {/* 1. Always show Home */}
        <Link to="/" className="nav-item">Home</Link>

        {isAuthenticated && (
          <div 
            className="dropdown-container"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <span className="nav-item dropdown-trigger">
              Features <small></small>
            </span>
            
            {dropdownOpen && (
              // ... inside the dropdown-menu div
    <div className="dropdown-menu">
      {/* The Master Entry Form */}
      <Link to="/create-case" className="dropdown-item" style={{fontWeight:'bold', color:'#38bdf8'}}>
        ➕ New Full Case Entry
      </Link>
      
      <hr style={{borderColor: '#334155', margin: '5px 0'}}/>

      {/* Future View Features */}
      <Link to="/cases" className="dropdown-item">📂 View All Cases</Link>
      <Link to="/analytics" className="dropdown-item">📊 Reports</Link>
    </div>
            )}
          </div>
        )}
        
        {/* 2. Only show Dashboard if Logged In */}
        {isAuthenticated && (
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
        )}

        {/* 3. Logic: If NOT logged in, show Login... If YES logged in, show Logout */}
        {!isAuthenticated ? (
          <>
            <button 
              onClick={() => loginWithRedirect()} 
              className="nav-btn login-btn"
            >
              Login
            </button>
            <button 
              onClick={() => loginWithRedirect({ screen_hint: 'signup' })} 
              className="nav-btn signup-btn"
            >
              Sign Up
            </button>
          </>
        ) : (
          <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
            {/* Show User Name */}
            <span style={{color: '#cbd5e1', fontSize: '0.9rem'}}>
              Hello, {user?.name}
            </span>
            
            {/* The Logout Button */}
            <button 
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} 
              className="nav-btn"
              style={{background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer'}}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;