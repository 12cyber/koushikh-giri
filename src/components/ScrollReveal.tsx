import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  distance?: number;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 24,
  once = true,
}) => {
  const initialOffset = {
    up: { y: distance, x: 0, scale: 0.985 },
    down: { y: -distance, x: 0, scale: 0.985 },
    left: { x: distance, y: 0, scale: 0.985 },
    right: { x: -distance, y: 0, scale: 0.985 },
    scale: { x: 0, y: 10, scale: 0.95 },
  }[direction];

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...initialOffset,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ once, amount: 0.15, margin: '0px 0px -30px 0px' }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScrollParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  offsetRange?: [number, number];
}

export const ScrollParallaxBox: React.FC<ScrollParallaxSectionProps> = ({
  children,
  className = '',
  offsetRange = [24, -24],
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    restDelta: 0.001,
  });

  const y = useTransform(smoothProgress, [0, 1], offsetRange);

  return (
    <motion.div
      ref={ref}
      style={{ y, willChange: 'transform' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
