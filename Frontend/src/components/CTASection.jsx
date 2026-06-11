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
          <p>
            Join the police departments already using Cyber Diary to solve cases faster.
          </p>
          <button type="button" className="contact-btn">Contact Sales Team</button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
