import React from 'react';

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>Digital Evidence Management System</h1>
        <p>
          Securely record investigation data, manage digital evidence, 
          and track case progress with automated analytics.
        </p>
        <div className="hero-buttons">
          <button className="primary-btn">Get Started</button>
          <button className="secondary-btn">Learn More</button>
        </div>
      </header>

      <section className="features-section">
        <div className="feature-card">
          <h3>📂 Digital Case Diary</h3>
          <p>Time-stamped recording of facts, witnesses, and seizures.</p>
        </div>
        <div className="feature-card">
          <h3>📊 Analytics Dashboard</h3>
          <p>Real-time visualization of pendency and case timelines.</p>
        </div>
        <div className="feature-card">
          <h3>🔒 Secure Evidence</h3>
          <p>Upload forensic reports with Magic Number verification & QR linking.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;