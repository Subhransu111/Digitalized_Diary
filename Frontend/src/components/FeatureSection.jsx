import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../utils/motion';

const MotionArticle = motion.article;
const MotionDiv = motion.div;
const MotionH2 = motion.h2;

const features = [
  {
    iconClass: 'feature-icon-case',
    title: 'Digital Case Diary',
    description: 'Time-stamped recording of facts, witnesses, and seizures following legal standards.',
  },
  {
    iconClass: 'feature-icon-chart',
    title: 'Analytics Dashboard',
    description: 'Real-time visualization of pendency rates and case resolution timelines.',
  },
  {
    iconClass: 'feature-icon-lock',
    title: 'Secure Evidence',
    description: 'Upload forensic reports with Magic Number verification & QR code linking.',
  },
];

const FeatureSection = () => {
  return (
    <section className="features-wrapper" id="features">
      <div className="features-overlay" />

      <div className="features-container">
        <MotionH2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8 }}
        >
          Our Core Features
        </MotionH2>

        <MotionDiv
          variants={staggerContainer(0.15, 0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="features-grid"
        >
          {features.map((feature) => (
            <MotionArticle key={feature.title} variants={fadeUp} className="feature-glass-card">
              <div className={`feature-icon-wrapper ${feature.iconClass}`} aria-hidden="true" />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </MotionArticle>
          ))}
        </MotionDiv>
      </div>
    </section>
  );
};

export default FeatureSection;
