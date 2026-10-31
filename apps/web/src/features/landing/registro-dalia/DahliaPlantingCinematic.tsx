'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import NextImage from 'next/image';
import { useReducedMotion } from 'framer-motion';
import { getStateCinematicAnchor } from './dahliaCinematicData';
import { type RegistrationTheme } from './themes';
import styles from './DahliaPlantingCinematic.module.css';

export interface DahliaStartPoint { x: number; y: number; width: number; height: number }
interface Props {
  theme: RegistrationTheme;
  stateId: string;
  stateName: string;
  startPoint: DahliaStartPoint | null;
  onComplete: () => void;
}

const PETALS = [
  { x: '-65px', y: '-50px', rotation: '-35deg' },
  { x: '70px', y: '-45px', rotation: '45deg' },
  { x: '78px', y: '30px', rotation: '80deg' },
  { x: '15px', y: '65px', rotation: '120deg' },
  { x: '-60px', y: '55px', rotation: '-75deg' },
  { x: '-75px', y: '-15px', rotation: '-110deg' },
];

export function DahliaPlantingCinematic({ theme, stateId, stateName, startPoint, onComplete }: Props) {
  const reducedMotion = useReducedMotion();
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);
  const [phase, setPhase] = useState<'clearing' | 'center' | 'map' | 'impact'>('clearing');
  const impacted = phase === 'impact';
  const skip = useRef<HTMLButtonElement>(null);
  const anchor = getStateCinematicAnchor(stateId);

  useLayoutEffect(() => {
    const measure = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    measure();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('resize', measure);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const center = window.setTimeout(() => setPhase('center'), 1550);
    const map = window.setTimeout(() => setPhase('map'), 2100);
    const impact = window.setTimeout(() => setPhase('impact'), reducedMotion ? 0 : 3150);
    const complete = window.setTimeout(onComplete, reducedMotion ? 900 : 4250);
    return () => { window.clearTimeout(center); window.clearTimeout(map); window.clearTimeout(impact); window.clearTimeout(complete); };
  }, [onComplete, reducedMotion]);

  useEffect(() => { if (viewport) skip.current?.focus({ preventScroll: true }); }, [viewport]);

  if (!viewport) return null;
  const { width, height } = viewport;
  // The map has no perspective transform: anchor percentages and the sprite use
  // the very same viewport coordinate space, including after a resize.
  const mapWidth = Math.min(900, width * .92, height * .72 * 660 / 435);
  const mapHeight = mapWidth * 435 / 660;
  const targetX = (width - mapWidth) / 2 + mapWidth * anchor.pctX / 100;
  const targetY = (height - mapHeight) / 2 + mapHeight * anchor.pctY / 100;
  const largeWidth = Math.min(width * .78, height * .65 * 720 / 607, 560);
  const variables = {
    '--dahlia-swatch': theme.hex, '--dahlia-accent': theme.accent,
    '--source-x': `${startPoint?.x ?? width * .92}px`, '--source-y': `${startPoint?.y ?? height / 2}px`,
    '--source-width': `${startPoint?.width ?? 200}px`, '--source-height': `${startPoint?.height ?? 169}px`,
    '--center-x': `${width / 2}px`, '--center-y': `${height / 2}px`,
    '--large-width': `${largeWidth}px`, '--large-height': `${largeWidth * 607 / 720}px`,
    '--target-x': `${targetX}px`, '--target-y': `${targetY}px`,
  } as CSSProperties;

  return createPortal(
    <div data-phase={phase} className={`${styles.cinematicOverlay} ${reducedMotion ? styles.reducedMotion : ''}`} style={variables} role="dialog" aria-modal="true" aria-label="Plantando tu dalia">
      <div className={styles.revealBackground} />
      <button ref={skip} type="button" className={styles.skipButton} onClick={onComplete}>Saltar animación ✕</button>
      <p className={styles.srOnly} role="status">{impacted ? `Tu dalia florece en ${stateName}.` : phase === 'center' ? 'Tu dalia florece en comunidad.' : phase === 'map' ? `Destino: ${stateName}.` : `Plantando tu dalia en ${stateName}.`}</p>
      <div className={`${styles.mapWrapper} ${impacted ? styles.mapImpacted : ''}`} style={{ width: mapWidth, height: mapHeight }}>
        <NextImage src="/data/map-base.png" alt="Mapa de México" width={660} height={435} className={styles.mapBase} unoptimized priority />
        <div className={styles.targetBeacon} style={{ left: `${anchor.pctX}%`, top: `${anchor.pctY}%` }} aria-hidden="true" />
      </div>
      {!impacted && <div className={styles.flyingDahlia} aria-hidden="true">
        <NextImage src={`/form/themes/dahlia-${theme.id}.webp`} alt="" width={720} height={607} className={styles.dahliaSprite} unoptimized priority />
      </div>}
      {impacted && <div className={styles.impact} style={{ left: targetX, top: targetY, '--pin-shift': `${Math.min(width - 88, Math.max(88, targetX)) - targetX}px` } as CSSProperties}>
        <div className={styles.shockwave} aria-hidden="true" />
        <NextImage src={`/form/themes/dahlia-${theme.id}.webp`} alt="" width={52} height={44} className={styles.plantedDahlia} unoptimized />
        {PETALS.map((petal, index) => <NextImage key={index} src={`/form/themes/petal-${theme.id}.webp`} alt="" width={24} height={22} className={styles.burstPetal} style={{ '--dx': petal.x, '--dy': petal.y, '--rotation': petal.rotation } as CSSProperties} unoptimized />)}
        <span className={styles.impactPin}>✦ {stateName || anchor.name}</span>
      </div>}
    </div>, document.body,
  );
}
