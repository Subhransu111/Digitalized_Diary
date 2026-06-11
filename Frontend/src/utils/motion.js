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
      type: 'spring',
      duration: 1.25,
      bounce: 0.1,
    },
  },
};

export const fadeIn = (direction = 'up', type = 'tween', delay = 0, duration = 1) => ({
  hidden: {
    x: direction === 'left' ? 60 : direction === 'right' ? -60 : 0,
    y: direction === 'up' ? 60 : direction === 'down' ? -60 : 0,
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
      type: 'spring',
      duration: 1,
      bounce: 0.1,
    },
  },
};
