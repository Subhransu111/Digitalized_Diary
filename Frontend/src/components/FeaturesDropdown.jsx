import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';

const menuVariants = {
  hidden: { opacity: 0, x: '-50%', y: -10, scale: 0.98 },
  visible: {
    opacity: 1,
    x: '-50%',
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: '-50%',
    y: -10,
    scale: 0.98,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

const FeaturesDropdown = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Motion.div
      variants={menuVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="features-dropdown-menu"
    >
      <Link to="/create-case" className="features-dropdown-item" onClick={onClose}>
        <span className="item-icon">+</span>
        <span>New Full Case Entry</span>
      </Link>
      <div className="dropdown-divider" />
      <Link to="/cases" className="features-dropdown-item" onClick={onClose}>
        <span className="item-icon">#</span>
        <span>View All Cases</span>
      </Link>
    </Motion.div>
  );
};

export default FeaturesDropdown;
