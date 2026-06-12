import { motion as Motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 24,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: 'blur(6px)',
  },
};

const pageTransition = {
  duration: 0.45,
  ease: 'easeOut',
};

const PageTransition = ({ children }) => (
  <Motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    className="page-transition-wrapper"
  >
    {children}
  </Motion.div>
);

export default PageTransition;
