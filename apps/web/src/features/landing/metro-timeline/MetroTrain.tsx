'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/shared/utils';
import { METRO_ASSETS, TRAIN_ASPECT, TRAIN_DOCKED } from './metroCalibration';

interface MetroTrainProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Tren voxel de tres vagones. Por defecto se coloca en posición «estacionado»
 * (TRAIN_DOCKED) dentro de la caja de una MetroStation. En la Fase 2 la
 * posición horizontal se controlará con el scroll.
 */
export function MetroTrain({ className, style }: MetroTrainProps) {
  return (
    <div
      aria-hidden
      className={cn('absolute z-20 pointer-events-none', className)}
      style={{
        left: `${TRAIN_DOCKED.left}%`,
        top: `${TRAIN_DOCKED.top}%`,
        width: `${TRAIN_DOCKED.width}%`,
        aspectRatio: TRAIN_ASPECT,
        ...style,
      }}
    >
      <Image
        src={METRO_ASSETS.train}
        alt=""
        fill
        draggable={false}
        sizes="(min-width: 1024px) 32vw, 90vw"
        className="object-contain select-none drop-shadow-[0_1.2cqw_1.2cqw_rgba(30,20,102,0.25)]"
      />
    </div>
  );
}
