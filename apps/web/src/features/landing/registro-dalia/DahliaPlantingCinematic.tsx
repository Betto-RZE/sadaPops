'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getStateCinematicAnchor } from './dahliaCinematicData';
import { type RegistrationTheme } from './themes';
import styles from './DahliaPlantingCinematic.module.css';

interface Props {
  theme: RegistrationTheme;
  stateId: string;
  stateName: string;
  startPoint: { x: number; y: number } | null;
  onComplete: () => void;
}

const BURST_PETAL_OFFSETS = [
  { dx: '-45px', dy: '-38px', rot: '-35deg' },
  { dx: '48px', dy: '-32px', rot: '45deg' },
  { dx: '55px', dy: '24px', rot: '80deg' },
  { dx: '12px', dy: '50px', rot: '120deg' },
  { dx: '-42px', dy: '40px', rot: '-75deg' },
  { dx: '-52px', dy: '-10px', rot: '-110deg' },
];

export function DahliaPlantingCinematic({
  theme,
  stateId,
  stateName,
  startPoint,
  onComplete,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  const anchor = useMemo(() => getStateCinematicAnchor(stateId), [stateId]);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [hasImpacted, setHasImpacted] = useState(false);
  const [isMapShaking, setIsMapShaking] = useState(false);

  // Calcula la posición real en pixeles del estado dentro del contenedor
  useEffect(() => {
    function computeTarget() {
      if (!mapWrapperRef.current || !containerRef.current) return;
      const mapRect = mapWrapperRef.current.getBoundingClientRect();
      const contRect = containerRef.current.getBoundingClientRect();
      const x = mapRect.left - contRect.left + (mapRect.width * anchor.pctX) / 100;
      const y = mapRect.top - contRect.top + (mapRect.height * anchor.pctY) / 100;
      setTargetPos({ x, y });
    }

    computeTarget();
    window.addEventListener('resize', computeTarget);
    return () => window.removeEventListener('resize', computeTarget);
  }, [anchor.pctX, anchor.pctY]);

  // Cronómetro del impacto y finalización
  useEffect(() => {
    // A los 1.75s la flor impacta el mapa
    const impactTimer = setTimeout(() => {
      setHasImpacted(true);
      setIsMapShaking(true);
      setTimeout(() => setIsMapShaking(false), 220);
    }, 1750);

    // A los 3.2s termina la cinemática y regresa a la hoja de confirmación
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(impactTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const initialX = startPoint?.x ?? 300;
  const initialY = startPoint?.y ?? 450;
  const apexX = containerRef.current ? containerRef.current.clientWidth / 2 : 350;
  const apexY = containerRef.current ? containerRef.current.clientHeight * 0.16 : 80;
  const finalX = targetPos?.x ?? initialX;
  const finalY = targetPos?.y ?? initialY;

  return (
    <div
      ref={containerRef}
      className={styles.cinematicOverlay}
      style={{
        '--dahlia-swatch': theme.hex,
        '--dahlia-accent': theme.accent,
      } as React.CSSProperties}
    >
      <button
        type="button"
        className={styles.skipButton}
        onClick={onComplete}
        aria-label="Saltar animación"
      >
        Saltar animación ✕
      </button>

      {/* Contenedor del Mapa de México */}
      <div
        ref={mapWrapperRef}
        className={`${styles.mapWrapper} ${styles.mapEnter} ${isMapShaking ? styles.mapShaking : ''}`}
      >
        <NextImage
          src="/data/map-shadow.webp"
          alt=""
          width={710}
          height={480}
          className={styles.mapShadow}
          unoptimized
          priority
        />
        <NextImage
          src="/data/map-base.png"
          alt="Mapa de México"
          width={660}
          height={435}
          className={styles.mapBase}
          unoptimized
          priority
        />

        {/* Faro / Beacon del estado objetivo */}
        {!hasImpacted && (
          <div
            className={styles.targetBeacon}
            style={{
              left: `${anchor.pctX}%`,
              top: `${anchor.pctY}%`,
            }}
          >
            <div className={styles.beaconRing} />
            <div className={styles.beaconDot} />
          </div>
        )}

        {/* Efectos de impacto sobre el estado */}
        {hasImpacted && (
          <>
            {/* Ondas de choque dorada y color dalia */}
            <div
              className={styles.shockwaveContainer}
              style={{
                left: `${anchor.pctX}%`,
                top: `${anchor.pctY}%`,
              }}
            >
              <div className={styles.shockwaveGold} />
              <div className={styles.shockwaveTheme} />

              {/* Ráfaga de pétalos radiales */}
              {BURST_PETAL_OFFSETS.map((p, idx) => (
                <NextImage
                  key={idx}
                  src={`/form/themes/petal-${theme.id}.webp`}
                  alt=""
                  width={28}
                  height={28}
                  className={styles.burstPetal}
                  style={
                    {
                      '--dx': p.dx,
                      '--dy': p.dy,
                      '--rot': p.rot,
                    } as React.CSSProperties
                  }
                  unoptimized
                />
              ))}
            </div>

            {/* Dalia plantada en el estado */}
            <div
              className={styles.flyingDahliaWrap}
              style={{
                left: `${anchor.pctX}%`,
                top: `${anchor.pctY}%`,
                width: 58,
                height: 58,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className={styles.dahliaGlow}>
                <div className={styles.goldenHalo} />
                <NextImage
                  src={`/form/themes/dahlia-${theme.id}.webp`}
                  alt=""
                  width={120}
                  height={101}
                  className={styles.dahliaSprite}
                  unoptimized
                />
              </div>
            </div>

            {/* Pin con el nombre del estado */}
            <div
              className={styles.impactPin}
              style={{
                left: `${anchor.pctX}%`,
                top: `${anchor.pctY}%`,
              }}
            >
              <span className={styles.pinIcon}>✦</span>
              <span>{stateName || anchor.name}</span>
            </div>
          </>
        )}
      </div>

      {/* Dalia en vuelo parabólico (desde el botón al cenit y picada al estado) */}
      {!hasImpacted && (
        <motion.div
          className={styles.flyingDahliaWrap}
          initial={{
            x: initialX,
            y: initialY,
            scale: 0.55,
            opacity: 0.2,
            rotate: 0,
          }}
          animate={{
            x: [initialX, apexX, finalX],
            y: [initialY, apexY, finalY],
            scale: [0.55, 1.35, 0.75],
            opacity: [0.2, 1, 1],
            rotate: [0, 45, 180],
          }}
          transition={{
            duration: 1.75,
            times: [0, 0.48, 1],
            ease: ['easeOut', 'anticipate'],
          }}
          style={{
            width: 72,
            height: 72,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className={styles.dahliaGlow}>
            <div className={styles.goldenHalo} />
            <NextImage
              src={`/form/themes/dahlia-${theme.id}.webp`}
              alt=""
              width={160}
              height={135}
              className={styles.dahliaSprite}
              unoptimized
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
