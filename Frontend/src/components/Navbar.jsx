import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import FeaturesDropdown from './FeaturesDropdown';
import useClickOutside from '../hooks/useClickOutside';

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.98,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

const Navbar = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const isLandingPage = location.pathname === '/';

  const closeAllMenus = useCallback(() => {
    setDesktopDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileFeaturesOpen(false);
  }, []);

  useClickOutside(navRef, closeAllMenus);

  useEffect(() => {
    let frameId = 0;

    const updateScrolledState = () => {
      frameId = 0;
      setScrolled(window.scrollY > 50);
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
  }, []);

  useEffect(() => {
    closeAllMenus();
  }, [closeAllMenus, location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAllMenus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAllMenus]);

  const scrollToSection = (sectionId) => {
    if (location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    navigate('/');
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleLogin = () => {
    loginWithRedirect({ appState: { returnTo: '/dashboard' } });
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const officerName = user?.given_name || user?.nickname || 'Officer';
  const navbarClassName = `navbar ${scrolled || !isLandingPage ? 'scrolled' : ''} ${
    !isLandingPage ? 'navbar-internal' : ''
  }`;

  return (
    <nav ref={navRef} className={navbarClassName}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1 onClick={() => navigate('/')}>CYBER DIARY</h1>
        </div>

        <div className="desktop-nav">
          {!isAuthenticated ? (
            <>
              <button type="button" onClick={() => scrollToSection('features')} className="nav-item clean-btn">
                Features
              </button>
              <button type="button" onClick={() => scrollToSection('about')} className="nav-item clean-btn">
                About Us
              </button>
              <button type="button" onClick={() => scrollToSection('contact')} className="nav-item clean-btn">
                Contact
              </button>
              <button type="button" onClick={handleLogin} className="nav-btn login-btn">
                Login
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-item">
                Home
              </Link>

              <div
                className="dropdown-container"
                onMouseEnter={() => setDesktopDropdownOpen(true)}
                onMouseLeave={() => setDesktopDropdownOpen(false)}
              >
                <button
                  type="button"
                  className={`nav-item clean-btn dropdown-trigger ${desktopDropdownOpen ? 'active' : ''}`}
                  aria-expanded={desktopDropdownOpen}
                  onClick={() => setDesktopDropdownOpen((open) => !open)}
                >
                  Features <span className="arrow-indicator">v</span>
                </button>
                <AnimatePresence>
                  {desktopDropdownOpen && (
                    <FeaturesDropdown isOpen={desktopDropdownOpen} onClose={() => setDesktopDropdownOpen(false)} />
                  )}
                </AnimatePresence>
              </div>

              <Link to="/dashboard" className="nav-item">
                Dashboard
              </Link>

              <div className="user-section">
                <span className="user-greeting">Hi, {officerName}</span>
                <button type="button" onClick={handleLogout} className="nav-btn logout-btn">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          className={`mobile-menu-button ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <AnimatePresence>
          {mobileMenuOpen && (
            <Motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mobile-menu-panel"
            >
              {!isAuthenticated ? (
                <div className="mobile-menu-links">
                  <button
                    type="button"
                    onClick={() => {
                      scrollToSection('features');
                      setMobileMenuOpen(false);
                    }}
                    className="mobile-nav-item clean-btn"
                  >
                    Features
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToSection('about');
                      setMobileMenuOpen(false);
                    }}
                    className="mobile-nav-item clean-btn"
                  >
                    About Us
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToSection('contact');
                      setMobileMenuOpen(false);
                    }}
                    className="mobile-nav-item clean-btn"
                  >
                    Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="mobile-nav-btn login-btn"
                  >
                    Login
                  </button>
                </div>
              ) : (
                <div className="mobile-menu-links">
                  <Link to="/" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
                    Home
                  </Link>

                  <div className="mobile-accordion">
                    <button
                      type="button"
                      onClick={() => setMobileFeaturesOpen((open) => !open)}
                      className="mobile-nav-item clean-btn"
                      aria-expanded={mobileFeaturesOpen}
                    >
                      <span>Features</span>
                      <span className={`accordion-arrow ${mobileFeaturesOpen ? 'rotate' : ''}`}>v</span>
                    </button>

                    <AnimatePresence>
                      {mobileFeaturesOpen && (
                        <Motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="mobile-accordion-content"
                        >
                          <Link to="/create-case" className="mobile-sub-nav-item" onClick={() => setMobileMenuOpen(false)}>
                            <span className="item-icon">+</span>
                            <span>New Full Case Entry</span>
                          </Link>
                          <Link to="/cases" className="mobile-sub-nav-item" onClick={() => setMobileMenuOpen(false)}>
                            <span className="item-icon">#</span>
                            <span>View All Cases</span>
                          </Link>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link to="/dashboard" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>

                  <div className="mobile-user-section">
                    <span className="mobile-user-greeting">Hi, {officerName}</span>
                    <button type="button" onClick={handleLogout} className="mobile-nav-btn logout-btn">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
