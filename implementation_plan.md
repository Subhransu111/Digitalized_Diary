# Implementation Plan: CYBER DIARY Landing Page Redesign

This implementation plan outlines the steps required to redesign the landing page of **CYBER DIARY** to achieve a dark, cinematic, premium police-tech visual aesthetic. It ensures that all original written copy, button texts, navigation links, and functional routes remain exactly identical, and that styles for non-landing pages (e.g., Dashboard, Create Case) are isolated and unaffected.

---

## 1. Project Understanding & Visual Direction

*   **Theme**: Dark cinematic cyber-tech.
*   **Palette**: Pure black/charcoal backgrounds, thin transparent borders, vivid orange highlights, and soft red/orange glowing radial gradients.
*   **Typography**: Elegant Serif headings (`Playfair Display`) contrasted with clean, geometric Sans-Serif body/UI text (`Inter`).
*   **Animation**: Smooth page entrance and scroll reveals using `Framer Motion`, and liquid-like scrolling using `Lenis`.
*   **Safety Rule**: Absolute isolation of landing page styles. The global `App.css` file contains extensive layout rules for case registration, lists, and forms. All landing page styles will be scoped under the `.landing-page-scope` class to prevent style regressions.

---

## 2. Asset Placement & Renaming

Rename the three newly provided images in `Frontend/public/assets/landing/` as follows:

1.  `ChatGPT Image Jun 11, 2026, 11_18_32 PM.png` &rarr; **`hero-bg.png`** (Main hero background)
2.  `ChatGPT Image Jun 11, 2026, 11_18_58 PM.png` &rarr; **`grid-bg.png`** (Middle feature/about background)
3.  `ChatGPT Image Jun 11, 2026, 11_20_54 PM.png` &rarr; **`glow-bg.png`** (CTA and footer background)

Inside the CSS/React files, they will be referenced as:
*   `/assets/landing/hero-bg.png`
*   `/assets/landing/grid-bg.png`
*   `/assets/landing/glow-bg.png`

---

## 3. Package Installation

Execute the following command inside the `Frontend` folder to install the required animation, scroll, and typography packages:

```bash
npm install framer-motion @studio-freight/lenis @fontsource/playfair-display @fontsource/inter
```

---

## 4. Directory & File Blueprint

All landing-page-related modifications will be grouped in the `Frontend/src` directory:

```
Frontend/src/
├── hooks/
│   └── useLenis.js                # Custom hook for Lenis smooth scroll
├── utils/
│   └── motion.js                  # Framer Motion animation variants
├── styles/
│   └── landing.css                # Scoped CSS for the new landing page
├── components/
│   ├── Navbar.jsx                 # Redesigned transparent navbar
│   ├── Hero.jsx                   # New Cinematic Hero Section
│   ├── FeatureSection.jsx         # Redesigned Features Grid Section
│   ├── WorkflowSection.jsx        # Redesigned "Why Cyber Diary?" (About) Section
│   ├── CTASection.jsx             # Redesigned "Ready to Modernize" Section
│   └── Footer.jsx                 # Redesigned Footer Section
└── pages/
    ├── LandingPage.jsx            # Parent wrapper replacing the Home page
    └── Home.jsx                   # (Kept / updated to route cleanly, or replaced by LandingPage.jsx)
```

---

## 5. Implementation Files Code Drafts

### 5.1. Smooth Scroll Hook
**File**: `Frontend/src/hooks/useLenis.js`
```javascript
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
}
```

---

### 5.2. Framer Motion Variants
**File**: `Frontend/src/utils/motion.js`
```javascript
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      duration: 1.25,
      bounce: 0.1,
    },
  },
};

export const fadeIn = (direction = "up", type = "tween", delay = 0, duration = 1) => ({
  hidden: {
    x: direction === "left" ? 60 : direction === "right" ? -60 : 0,
    y: direction === "up" ? 60 : direction === "down" ? -60 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type,
      delay,
      duration,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
});

export const scaleIn = {
  hidden: { scale: 0.95, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      duration: 1,
      bounce: 0.1,
    },
  },
};
```

---

### 5.3. Scoped CSS & Theme Definition
**File**: `Frontend/src/styles/landing.css`
```css
@import "@fontsource/playfair-display/400.css";
@import "@fontsource/playfair-display/700.css";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/700.css";

/* Scope all landing page elements to prevent leakage to interior forms & dashboards */
.landing-page-scope {
  --bg: #050505;
  --bg-soft: #0b0b0d;
  --text: #ffffff;
  --muted: rgba(255, 255, 255, 0.68);
  --border: rgba(255, 255, 255, 0.08);
  --orange: #ff5a1f;
  --orange-soft: rgba(255, 90, 31, 0.15);
  --red-glow: rgba(255, 60, 20, 0.25);

  background-color: var(--bg);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  min-height: 100vh;
}

/* Typography Helpers */
.landing-page-scope h1,
.landing-page-scope h2,
.landing-page-scope h3 {
  font-family: 'Playfair Display', serif;
  letter-spacing: -0.02em;
}

.landing-page-scope p,
.landing-page-scope button,
.landing-page-scope a,
.landing-page-scope span {
  font-family: 'Inter', sans-serif;
}

/* Glassmorphism Navbar (Conditional styling based on landing route) */
.navbar-landing {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(5, 5, 5, 0.45) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border) !important;
  padding: 1.25rem 2rem !important;
  transition: all 0.3s ease;
  box-shadow: none !important;
}

.navbar-landing.scrolled {
  background: rgba(5, 5, 5, 0.8) !important;
  border-bottom: 1px solid rgba(255, 90, 31, 0.15) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5) !important;
}

/* Navbar specific elements in landing mode */
.navbar-landing .navbar-brand h1 {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, var(--orange) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-left: 0 !important;
}

.navbar-landing .nav-item {
  color: var(--muted) !important;
  margin-right: 0 !important;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.navbar-landing .nav-item:hover {
  color: var(--text) !important;
}

.navbar-landing .login-btn {
  background-color: var(--orange) !important;
  border: 1px solid var(--orange) !important;
  border-radius: 8px !important;
  padding: 8px 20px !important;
  font-weight: 500 !important;
  color: #ffffff !important;
  transition: all 0.3s ease !important;
  margin-right: 0 !important;
}

.navbar-landing .login-btn:hover {
  box-shadow: 0 0 15px var(--orange-soft);
  transform: translateY(-1px);
}

/* Redesigned Button Styles */
.landing-page-scope .primary-btn {
  background: var(--orange);
  color: #ffffff;
  border: 1px solid var(--orange);
  padding: 14px 28px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 20px rgba(255, 90, 31, 0.2);
}

.landing-page-scope .primary-btn:hover {
  box-shadow: 0 0 25px var(--orange);
  transform: translateY(-2px);
}

.landing-page-scope .secondary-btn {
  background: rgba(255, 255, 255, 0.03);
  color: #ffffff;
  border: 1px solid var(--border);
  padding: 14px 28px;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-page-scope .secondary-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Hero Section */
.hero-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/assets/landing/hero-bg.png') no-repeat center center;
  background-size: cover;
  padding: 120px 20px 80px 20px;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.95) 85%);
  z-index: 1;
}

.hero-glow {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 350px;
  background: radial-gradient(ellipse at bottom, var(--red-glow) 0%, transparent 70%);
  z-index: 2;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 3;
  max-width: 850px;
  text-align: center;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.1;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(to bottom, #ffffff 60%, rgba(255, 255, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-content p {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--muted);
  line-height: 1.6;
  max-width: 650px;
  margin: 0 auto 40px auto;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
}

/* Features Section */
.features-wrapper {
  position: relative;
  background: url('/assets/landing/grid-bg.png') no-repeat center center;
  background-size: cover;
  padding: 100px 20px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.features-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(5,5,5,1) 0%, rgba(5,5,5,0.85) 50%, rgba(5,5,5,1) 100%);
  z-index: 1;
}

.features-container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
}

.features-container h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  text-align: center;
  margin-bottom: 60px;
  font-weight: 700;
  color: #ffffff !important; /* Ensure it stays white */
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}

.feature-glass-card {
  background: rgba(15, 15, 15, 0.45);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 40px 30px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
}

.feature-glass-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 90, 31, 0.3);
  box-shadow: 0 10px 40px rgba(255, 90, 31, 0.05);
}

.feature-icon-wrapper {
  background: rgba(255, 90, 31, 0.05);
  border: 1px solid rgba(255, 90, 31, 0.15);
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.feature-glass-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ffffff;
}

.feature-glass-card p {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

/* About/Workflow Section */
.about-wrapper {
  background: var(--bg);
  padding: 100px 20px;
  position: relative;
}

.about-content-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.about-img-frame {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 20px 45px rgba(0,0,0,0.6);
}

.about-img-frame::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(5,5,5,0.4) 0%, transparent 50%);
  pointer-events: none;
}

.about-img-element {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}

.about-txt-panel {
  display: flex;
  flex-direction: column;
}

.about-txt-panel h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 24px;
  font-weight: 700;
}

.about-txt-panel p {
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 24px;
}

.about-stats-grid {
  display: flex;
  gap: 40px;
  margin-top: 30px;
  border-top: 1px solid var(--border);
  padding-top: 30px;
}

.stat-item h3 {
  font-size: 3rem;
  font-weight: 700;
  color: var(--orange) !important; /* Force override */
  margin-bottom: 8px;
}

.stat-item p {
  color: var(--muted);
  font-size: 0.95rem;
  margin-bottom: 0;
}

/* CTA & Security Section */
.cta-wrapper {
  position: relative;
  background: url('/assets/landing/glow-bg.png') no-repeat center bottom;
  background-size: cover;
  padding: 120px 20px;
  text-align: center;
  border-top: 1px solid var(--border);
}

.cta-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(5,5,5,0.3) 0%, rgba(5,5,5,0.95) 90%);
  z-index: 1;
}

.cta-glow-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 400px;
  background: radial-gradient(circle, var(--orange-soft) 0%, transparent 60%);
  z-index: 2;
  pointer-events: none;
}

.cta-container {
  position: relative;
  z-index: 3;
  max-width: 700px;
  margin: 0 auto;
}

.cta-container h2 {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 20px;
}

.cta-container p {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: var(--orange) !important; /* Preserve original colored look of subhead if matches */
  line-height: 1.6;
  margin-bottom: 40px;
}

.contact-btn {
  background-color: var(--orange) !important;
  color: white !important;
  padding: 16px 48px !important;
  font-size: 1.1rem !important;
  border: 1px solid var(--orange) !important;
  border-radius: 30px !important;
  cursor: pointer !important;
  font-weight: bold !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 20px rgba(255, 90, 31, 0.35) !important;
}

.contact-btn:hover {
  transform: scale(1.05) translateY(-2px) !important;
  box-shadow: 0 0 30px var(--orange) !important;
}

/* Footer redesign */
.landing-footer {
  background-color: #020202 !important;
  border-top: 1px solid var(--border);
  padding: 60px 20px !important;
  text-align: center;
  position: relative;
  z-index: 3;
}

.landing-footer .footer-links {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
}

.landing-footer .footer-link {
  color: var(--muted) !important;
  font-size: 0.95rem;
  transition: color 0.2s ease;
  text-decoration: none;
}

.landing-footer .footer-link:hover {
  color: var(--text) !important;
}

.landing-footer p {
  color: rgba(255, 255, 255, 0.3) !important;
  font-size: 0.85rem;
}

/* Responsive Grid Adaptation */
@media (max-width: 991px) {
  .about-content-container {
    grid-template-columns: 1fr;
    gap: 50px;
  }
}

@media (max-width: 768px) {
  .hero-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
    gap: 15px;
  }
  .landing-page-scope .primary-btn,
  .landing-page-scope .secondary-btn {
    width: 100%;
  }
}
```

---

### 5.4. Navbar Redesign
**File**: `Frontend/src/components/Navbar.jsx`
*   *Note*: Dynamically detects if it is rendered on the landing route (`location.pathname === '/'`) and applies premium landing styling, while retaining standard style for interior routing so Dashboard and other forms remain unaffected.

```javascript
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import '../App.css'; // Keep App.css for other pages
import '../styles/landing.css'; // Import new landing page scoped styles

const Navbar = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    if (!isLandingPage) return;

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandingPage]);

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
        <h1 onClick={() => navigate('/')} style={{cursor:'pointer'}}>
          CYBER DIARY
        </h1>
      </div>
      
      <div className="navbar-links">
        {!isAuthenticated && (
          <>
            <button onClick={() => scrollToSection('features')} className="nav-item clean-btn">Features</button>
            <button onClick={() => scrollToSection('about')} className="nav-item clean-btn">About Us</button>
            <button onClick={() => scrollToSection('contact')} className="nav-item clean-btn">Contact</button>
            <button onClick={() => loginWithRedirect()} className="nav-btn login-btn" style={{marginLeft: '20px'}}>Login</button>
          </>
        )}

        {isAuthenticated && (
          <>
            <Link to="/" className="nav-item">Home</Link>
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

            <Link to="/dashboard" className="nav-item">Dashboard</Link>

            <div style={{display: 'flex', gap: '15px', alignItems: 'center', marginLeft:'15px'}}>
              <span style={{color: '#cbd5e1', fontSize: '0.9rem', fontWeight:'bold'}}>
                Hi, {user?.given_name || user?.nickname || "Officer"}
              </span>
              <button 
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
```

---

### 5.5. Modular Components

#### Hero Section Component
**File**: `Frontend/src/components/Hero.jsx`
```javascript
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth0 } from "@auth0/auth0-react";
import { fadeUp, staggerContainer } from '../utils/motion';

const Hero = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  return (
    <div className="hero-wrapper" id="home">
      <div className="hero-overlay" />
      <div className="hero-glow" />
      
      <motion.div 
        variants={staggerContainer(0.2, 0.1)}
        initial="hidden"
        animate="show"
        className="hero-content"
      >
        <motion.h1 variants={fadeUp}>
          Digital Evidence Management System
        </motion.h1>
        
        <motion.p variants={fadeUp}>
          Securely record investigation data, manage digital evidence, 
          and track case progress with automated analytics.
        </motion.p>
        
        <motion.div variants={fadeUp} className="hero-buttons">
          {!isAuthenticated && (
            <button onClick={() => loginWithRedirect()} className="primary-btn">
              Get Started
            </button>
          )}
          <button 
            className="secondary-btn" 
            onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
```

#### Core Features Section Component
**File**: `Frontend/src/components/FeatureSection.jsx`
```javascript
import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '../utils/motion';

const FeatureSection = () => {
  return (
    <section className="features-wrapper" id="features">
      <div className="features-overlay" />
      
      <div className="features-container">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8 }}
        >
          Our Core Features
        </motion.h2>
        
        <motion.div 
          variants={staggerContainer(0.15, 0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="features-grid"
        >
          {/* Card 1 */}
          <motion.div variants={fadeUp} className="feature-glass-card">
            <div className="feature-icon-wrapper">
              <span style={{ fontSize: '2rem' }}>📂</span>
            </div>
            <h3>Digital Case Diary</h3>
            <p>Time-stamped recording of facts, witnesses, and seizures following legal standards.</p>
          </motion.div>
          
          {/* Card 2 */}
          <motion.div variants={fadeUp} className="feature-glass-card">
            <div className="feature-icon-wrapper">
              <span style={{ fontSize: '2rem' }}>📊</span>
            </div>
            <h3>Analytics Dashboard</h3>
            <p>Real-time visualization of pendency rates and case resolution timelines.</p>
          </motion.div>
          
          {/* Card 3 */}
          <motion.div variants={fadeUp} className="feature-glass-card">
            <div className="feature-icon-wrapper">
              <span style={{ fontSize: '2rem' }}>🔒</span>
            </div>
            <h3>Secure Evidence</h3>
            <p>Upload forensic reports with Magic Number verification & QR code linking.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;
```

#### Workflow (About Us) Section Component
**File**: `Frontend/src/components/WorkflowSection.jsx`
```javascript
import React from 'react';
import { motion } from 'framer-motion';
import aboutImage from '../assets/hero-image-4-1.webp';
import { fadeIn } from '../utils/motion';

const WorkflowSection = () => {
  return (
    <section className="about-wrapper" id="about">
      <div className="about-content-container">
        {/* Left Side: Animated Image Frame */}
        <motion.div 
          variants={fadeIn("right", "tween", 0.1, 1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="about-img-frame"
        >
          <img src={aboutImage} alt="About Cyber Diary" className="about-img-element" />
        </motion.div>

        {/* Right Side: Animated Text and Metrics */}
        <motion.div 
          variants={fadeIn("left", "tween", 0.1, 1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="about-txt-panel"
        >
          <h2>Why Cyber Diary?</h2>
          <p>
            Traditional investigation methods are slow and prone to data loss.<br />
            <strong>Cyber Diary</strong> bridges the gap between physical investigation and digital management.
          </p>
          <p>
            Designed for modern Cyber Cells, our platform ensures integrity, 
            speed, and security for every piece of evidence collected.
          </p>
          
          <div className="about-stats-grid">
            <div className="stat-item">
              <h3>50%</h3>
              <p>Faster Reporting</p>
            </div>
            <div className="stat-item">
              <h3>100%</h3>
              <p>Data Integrity</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WorkflowSection;
```

#### CTA Section Component
**File**: `Frontend/src/components/CTASection.jsx`
```javascript
import React from 'react';
import { motion } from 'framer-motion';
import { scaleIn } from '../utils/motion';

const CTASection = () => {
  return (
    <section className="cta-wrapper" id="contact">
      <div className="cta-overlay" />
      <div className="cta-glow-core" />
      
      <div className="cta-container">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2>Ready to Modernize?</h2>
          <p style={{ color: '#ff5a1f', fontSize: '1.2rem' }}>
            Join the police departments already using Cyber Diary to solve cases faster.
          </p>
          <button className="contact-btn">Contact Sales Team</button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
```

#### Footer Component
**File**: `Frontend/src/components/Footer.jsx`
```javascript
import React from 'react';

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-links">
        <a href="#" className="footer-link">Privacy Policy</a>
        <a href="#" className="footer-link">Terms of Service</a>
        <a href="#" className="footer-link">Support</a>
      </div>
      <p>&copy; 2025 Cyber Diary. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
```

---

### 5.6. Landing Page Parent Layout Component
**File**: `Frontend/src/pages/LandingPage.jsx`
```javascript
import React from 'react';
import useLenis from '../hooks/useLenis';
import Hero from '../components/Hero';
import FeatureSection from '../components/FeatureSection';
import WorkflowSection from '../components/WorkflowSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import '../styles/landing.css';

const LandingPage = () => {
  // Activate Lenis smooth scrolling for the landing screen
  useLenis();

  return (
    <div className="landing-page-scope">
      <Hero />
      <FeatureSection />
      <WorkflowSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
```

---

### 5.7. App Router Integration
**File**: `Frontend/src/App.jsx`
Modify route configuration to replace `Home` with the new `LandingPage` component:

```diff
-import Home from './pages/Home';
+import LandingPage from './pages/LandingPage';
 
 ...
 
         <Navbar />
         <Routes>
-          <Route path="/" element={<Home />} />
+          <Route path="/" element={<LandingPage />} />
```

---

## 6. CSS Scope Verification & Safety Checklist

To ensure other project sections are unaffected by styling changes:
1.  **Scope Validation**: All declarations inside `landing.css` reside strictly inside the `.landing-page-scope` selector, except for `.navbar-landing` which is conditionally applied using template literals inside React.
2.  **Typography Isolation**: Playfair Display is set only under headings within `.landing-page-scope`.
3.  **Global Resets Excluded**: No global resets (`* { ... }` or `html, body { ... }` overrides) are introduced in `landing.css` that might mutate form inputs or dashboards.

---

## 7. Responsive Design Checklist

*   [ ] **Navbar Link Scaling**: On mobile views, the horizontal row switches layout or wraps cleanly. Links are readable, margins are reduced, and the login button does not overlap the logo.
*   [ ] **Hero Text clamp() Adjustments**: Typography scales dynamically via `clamp()` to prevent title clipping on screen widths under 480px.
*   [ ] **Mobile Button Flow**: Primary and secondary CTA buttons wrap to a clean vertical stack on devices with screen widths under 768px.
*   [ ] **Features Grid Realignment**: The three feature cards switch to a $1$-column vertical flow on tablet and mobile resolutions.
*   [ ] **Stats Layout Wrapping**: Statistics grid elements wrap from horizontal rows to structured columns on screen widths below 600px.
*   [ ] **Cover Fitted Asset Rendering**: Background images utilize `background-size: cover` to maintain cinematic aspect ratios across variable display heights.

---

## 8. Final Testing & Verification Plan

*   [ ] **Auth State Visual Check**: Verify that "Get Started" behaves correctly, is replaced appropriately when authenticated, and logging in routes cleanly to `/dashboard`.
*   [ ] **Lenis Friction Checks**: Verify that smooth scrolling is operational and doesn't interfere with modal/scrolling inputs in forms inside Dashboard.
*   [ ] **Anchor Scroll Behavior**: Confirm clicking navbar links ("Features", "About Us", "Contact") properly scrolls down to target sections smoothly using Lenis.
*   [ ] **Contrast Ratio Audit**: Ensure text contrast conforms to WCAG guidelines over background images.
*   [ ] **DOM Leak Checks**: Navigate to `/create-case` and ensure input fields, fonts, tables, and buttons render exactly with their original layout styles from `App.css`.
