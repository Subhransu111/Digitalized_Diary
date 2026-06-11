import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import '../App.css';
import '../styles/landing.css';

const Navbar = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    if (!isLandingPage) {
      scrolledRef.current = false;
      setScrolled(false);
      return undefined;
    }

    let frameId = 0;

    const updateScrolledState = () => {
      frameId = 0;
      const nextScrolled = window.scrollY > 50;

      if (scrolledRef.current !== nextScrolled) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }
    };

    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateScrolledState);
    };

    updateScrolledState();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLandingPage]);

  // Scroll Handler (Same as before)
  const scrollToSection = (sectionId) => {
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <nav className={`navbar ${isLandingPage ? `navbar-landing ${scrolled ? 'scrolled' : ''}` : ''}`}>
      <div className="navbar-brand">
        {/* The Brand/Logo acts as 'Home' */}
        <h1 onClick={() => navigate('/')} style={{cursor:'pointer'}}>
          CYBER DIARY
        </h1>
      </div>
      
      <div className="navbar-links">
        
        {/* =========================================
            SCENARIO 1: LOGGED OUT (Public Visitor)
            Shows: Features, About, Contact, Login
           ========================================= */}
        {!isAuthenticated && (
          <>
            <button type="button" onClick={() => scrollToSection('features')} className="nav-item clean-btn">Features</button>
            <button type="button" onClick={() => scrollToSection('about')} className="nav-item clean-btn">About Us</button>
            <button type="button" onClick={() => scrollToSection('contact')} className="nav-item clean-btn">Contact</button>
            
            {/* Login / Signup Buttons */}
            <button type="button" onClick={() => loginWithRedirect()} className="nav-btn login-btn" style={{marginLeft: '20px'}}>Login</button>
            
          </>
        )}

        {/* =========================================
            SCENARIO 2: LOGGED IN (Officer Mode)
            Shows: Home, Actions, Dashboard, User, Logout
           ========================================= */}
        {isAuthenticated && (
          <>
            {/* 1. Home Link (Explicit) */}
            <Link to="/" className="nav-item">Home</Link>

            {/* 2. Actions Dropdown */}
            <div 
              className="dropdown-container"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <span className="nav-item dropdown-trigger">
                Features
              </span>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/create-case" className="dropdown-item">➕ New Full Case Entry</Link>
                  <hr style={{borderColor: '#334155', margin: '5px 0'}}/>
                  <Link to="/cases" className="dropdown-item">📂 View All Cases</Link>
                </div>
              )}
            </div>

            {/* 3. Dashboard */}
            <Link to="/dashboard" className="nav-item">Dashboard</Link>

            {/* 4. User Name & Logout */}
            <div style={{display: 'flex', gap: '15px', alignItems: 'center', marginLeft:'15px'}}>
              <span style={{color: '#cbd5e1', fontSize: '0.9rem', fontWeight:'bold'}}>
                Hi, {user?.given_name || user?.nickname || "Officer"}
              </span>
              <button 
                type="button"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} 
                className="nav-btn"
                style={{background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer'}}
              >
                Logout
              </button>
            </div>
          </>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
