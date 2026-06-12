import React from 'react';
import { useAuth0 } from "@auth0/auth0-react"; // Optional: To hide button if logged in
import aboutImage from '../assets/hero-image-4-1.webp'

const Home = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const handleLogin = () => {
    loginWithRedirect({ appState: { returnTo: '/dashboard' } });
  };

  return (
    <div className="home-container">
      
      {/* 1. HERO SECTION (Top) */}
      <header className="hero-section" id="home">
        <h1>Digital Evidence Management System</h1>
        <p>
          Securely record investigation data, manage digital evidence, 
          and track case progress with automated analytics.
        </p>
        <div className="hero-buttons">
          {!isAuthenticated && (
            <button onClick={handleLogin} className="primary-btn">Get Started</button>
          )}
          <button className="secondary-btn" onClick={() => document.getElementById('about').scrollIntoView()}>Learn More</button>
        </div>
      </header>

      {/* 2. FEATURES SECTION */}
      <section className="landing-section section-white" id="features">
        <h2 className="section-title" style={{marginBottom: '40px', color: '#1e293b'}}>Our Core Features</h2>
        <div className="features-section">
          <div className="feature-card">
            <div style={{fontSize: '2rem', marginBottom: '10px'}}>📂</div>
            <h3>Digital Case Diary</h3>
            <p>Time-stamped recording of facts, witnesses, and seizures following legal standards.</p>
          </div>
          <div className="feature-card">
            <div style={{fontSize: '2rem', marginBottom: '10px'}}>📊</div>
            <h3>Analytics Dashboard</h3>
            <p>Real-time visualization of pendency rates and case resolution timelines.</p>
          </div>
          <div className="feature-card">
            <div style={{fontSize: '2rem', marginBottom: '10px'}}>🔒</div>
            <h3>Secure Evidence</h3>
            <p>Upload forensic reports with Magic Number verification & QR code linking.</p>
          </div>
        </div>
      </section>

      {/* 3. ABOUT US SECTION  */}
      <section className="landing-section section-light" id="about">
        <div className="about-container">
          <img src={aboutImage} alt="About Cyber Diary" className="about-image" />
          <div className="about-text">
            <h2>Why Cyber Diary?</h2>
            <p>
              Traditional investigation methods are slow and prone to data loss.<br></br>
              <strong>Cyber Diary</strong> bridges the gap between physical investigation and digital management.
            </p>
            <p>
              Designed for modern Cyber Cells, our platform ensures integrity, 
              speed, and security for every piece of evidence collected.
            </p>
            <div style={{display:'flex', gap:'20px', marginTop:'20px'}}>
              <div>
                <h3 style={{color:'#6366f1', fontSize:'2rem'}}>50%</h3>
                <p>Faster Reporting</p>
              </div>
              <div>
                <h3 style={{color:'#6366f1', fontSize:'2rem'}}>100%</h3>
                <p>Data Integrity</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONTACT / CTA SECTION (New!) */}
      <section className="landing-section section-accent" id="contact">
        <div className="contact-container">
          <h2>Ready to Modernize?</h2>
          <p style={{color: '#7c2d12', fontSize: '1.1rem'}}>
            Join the police departments already using Cyber Diary to solve cases faster.
          </p>
          <button className="contact-btn">Contact Sales Team</button>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Support</a>
        </div>
        <p>&copy; 2025 Cyber Diary. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Home;
