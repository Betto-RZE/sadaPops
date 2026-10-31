'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Número que "rueda" hasta su nuevo valor cuando cambian los datos. */
export function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(value, { stiffness: 90, damping: 22, mass: 0.6 });
  useEffect(() => {
    if (reduceMotion) spring.jump(value);
    else spring.set(value);
  }, [value, reduceMotion, spring]);
  const text = useTransform(spring, (current) => (decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString('es-MX')));
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

/** Sección que aparece suavemente al entrar en pantalla. */
export function Reveal({ children, className = '', delay = 0, ...rest }: { children: React.ReactNode; className?: string; delay?: number; id?: string } & React.AriaAttributes) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
