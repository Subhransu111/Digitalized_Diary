import React from 'react';
import { motion } from 'framer-motion';
import aboutImage from '../assets/hero-image-4-1.webp';
import { fadeIn } from '../utils/motion';

const WorkflowSection = () => {
  return (
    <section className="about-wrapper" id="about">
      <div className="about-content-container">
        <motion.div
          variants={fadeIn('right', 'tween', 0.1, 1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="about-img-frame"
        >
          <img src={aboutImage} alt="About Cyber Diary" className="about-img-element" />
        </motion.div>

        <motion.div
          variants={fadeIn('left', 'tween', 0.1, 1)}
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
