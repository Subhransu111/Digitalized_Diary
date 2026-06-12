import { motion } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';
import { fadeUp, staggerContainer } from '../utils/motion';

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;

const Hero = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogin = () => {
    loginWithRedirect({ appState: { returnTo: '/dashboard' } });
  };

  return (
    <header className="hero-wrapper" id="home">
      <div className="hero-overlay" />
      <div className="hero-glow" />

      <MotionDiv
        variants={staggerContainer(0.2, 0.1)}
        initial="hidden"
        animate="show"
        className="hero-content"
      >
        <MotionH1 variants={fadeUp}>
          Digital Evidence Management System
        </MotionH1>

        <MotionP variants={fadeUp}>
          Securely record investigation data, manage digital evidence,
          and track case progress with automated analytics.
        </MotionP>

        <MotionDiv variants={fadeUp} className="hero-buttons">
          {!isAuthenticated && (
            <button type="button" onClick={handleLogin} className="primary-btn">
              Get Started
            </button>
          )}
          <button type="button" className="secondary-btn" onClick={scrollToAbout}>
            Learn More
          </button>
        </MotionDiv>
      </MotionDiv>
    </header>
  );
};

export default Hero;
