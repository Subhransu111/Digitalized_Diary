import React from 'react';
import { motion } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';
import { fadeUp, staggerContainer } from '../utils/motion';

const Hero = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="hero-wrapper" id="home">
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
            <button type="button" onClick={() => loginWithRedirect()} className="primary-btn">
              Get Started
            </button>
          )}
          <button type="button" className="secondary-btn" onClick={scrollToAbout}>
            Learn More
          </button>
        </motion.div>
      </motion.div>
    </header>
  );
};

export default Hero;
