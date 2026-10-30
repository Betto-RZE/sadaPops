'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, Play, Pause, Sparkles } from 'lucide-react';
import { cn } from '@/shared/utils';

export interface DahliaPalette {
  id: string;
  name: string;
  hex: string;
  primary: string;
  inner: string;
  outer: string;
  base: string;
  core: string;
  coreAccent: string;
}

export const DAHLIA_PALETTES: DahliaPalette[] = [
  {
    id: 'rosa-dalia',
    name: 'Rosa Dalia',
    hex: '#C8006E',
    primary: '#E6007A',
    inner: '#FF70BA',
    outer: '#9E0054',
    base: '#600033',
    core: '#FBBF24',
    coreAccent: '#F59E0B',
  },
  {
    id: 'morado-voxel',
    name: 'Morado Voxel',
    hex: '#5E2CE6',
    primary: '#7C3AED',
    inner: '#B490FF',
    outer: '#4C1D95',
    base: '#2E1065',
    core: '#FBBF24',
    coreAccent: '#F59E0B',
  },
  {
    id: 'cempasuchil',
    name: 'Cempasúchil',
    hex: '#D97706',
    primary: '#F59E0B',
    inner: '#FDE047',
    outer: '#B45309',
    base: '#78350F',
    core: '#E11D48',
    coreAccent: '#BE123C',
  },
  {
    id: 'carmin',
    name: 'Carmín Mexicano',
    hex: '#E11D48',
    primary: '#F43F5E',
    inner: '#FDA4AF',
    outer: '#BE123C',
    base: '#881337',
    core: '#FBBF24',
    coreAccent: '#F59E0B',
  },
  {
    id: 'jade',
    name: 'Jade Turquesa',
    hex: '#0D9488',
    primary: '#14B8A6',
    inner: '#70E9D7',
    outer: '#0F766E',
    base: '#115E59',
    core: '#F59E0B',
    coreAccent: '#D97706',
  },
  {
    id: 'cobalto',
    name: 'Azul Cobalto',
    hex: '#2563EB',
    primary: '#3B82F6',
    inner: '#93C5FD',
    outer: '#1D4ED8',
    base: '#1E3A8A',
    core: '#FBBF24',
    coreAccent: '#F59E0B',
  },
];

interface VoxelDef {
  x: number;
  y: number;
  z: number;
  size: number;
  type: 'core' | 'coreAccent' | 'inner' | 'primary' | 'outer' | 'base';
}

/**
 * Geometría voxel de la Dalia Nacional (reconstrucción fiel de dahlia-4.png).
 * 3 niveles de pétalos escalonados con simetría octogonal y centro dorado.
 */
function buildDahliaVoxels(): VoxelDef[] {
  const voxels: VoxelDef[] = [];

  // 1. Centro Dorado / Pistilo (elevado, z = 2.0 .. 2.8)
  voxels.push({ x: 0, y: 0, z: 2.4, size: 1.1, type: 'core' });
  voxels.push({ x: 0, y: 0, z: 1.4, size: 1.2, type: 'coreAccent' });

  // 2. Corona de pétalos interiores (elevados y compactos, z = 1.0 .. 1.8)
  const innerAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  innerAngles.forEach((deg) => {
    const rad = (deg * Math.PI) / 180;
    const r1 = 1.6;
    const r2 = 2.6;
    voxels.push({
      x: Math.cos(rad) * r1,
      y: Math.sin(rad) * r1,
      z: 1.5,
      size: 1.0,
      type: 'inner',
    });
    voxels.push({
      x: Math.cos(rad) * r2,
      y: Math.sin(rad) * r2,
      z: 1.1,
      size: 1.05,
      type: 'primary',
    });
  });

  // 3. Corona de pétalos intermedios (capa media, z = 0.2 .. 0.8)
  const midAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
  midAngles.forEach((deg) => {
    const rad = (deg * Math.PI) / 180;
    const r = 2.2;
    voxels.push({
      x: Math.cos(rad) * r,
      y: Math.sin(rad) * r,
      z: 0.7,
      size: 1.0,
      type: 'primary',
    });
  });

  // 4. Corona exterior de pétalos (escalonados hacia afuera y abajo, z = -0.6 .. 0.4)
  innerAngles.forEach((deg) => {
    const rad = (deg * Math.PI) / 180;
    const r3 = 3.6;
    const r4 = 4.5;
    voxels.push({
      x: Math.cos(rad) * r3,
      y: Math.sin(rad) * r3,
      z: 0.3,
      size: 1.15,
      type: 'outer',
    });
    voxels.push({
      x: Math.cos(rad) * r4,
      y: Math.sin(rad) * r4,
      z: -0.2,
      size: 1.1,
      type: 'outer',
    });

    // Flancos laterales para dar grosor voxel en diagonal
    const leftRad = rad - 0.22;
    const rightRad = rad + 0.22;
    voxels.push({
      x: Math.cos(leftRad) * (r3 * 0.95),
      y: Math.sin(leftRad) * (r3 * 0.95),
      z: 0.0,
      size: 0.95,
      type: 'outer',
    });
    voxels.push({
      x: Math.cos(rightRad) * (r3 * 0.95),
      y: Math.sin(rightRad) * (r3 * 0.95),
      z: 0.0,
      size: 0.95,
      type: 'outer',
    });
  });

  // 5. Cáliz y base inferior (z = -1.0 .. -1.6)
  voxels.push({ x: 0, y: 0, z: -0.8, size: 1.8, type: 'base' });
  voxels.push({ x: 0, y: 0, z: -1.4, size: 1.3, type: 'base' });

  return voxels;
}

const STATIC_VOXELS = buildDahliaVoxels();

// Vector math helpers
type Vec3 = [number, number, number];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function shadeColor(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex);
  const nr = Math.min(255, Math.max(0, Math.round(r * factor)));
  const ng = Math.min(255, Math.max(0, Math.round(g * factor)));
  const nb = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `rgb(${nr}, ${ng}, ${nb})`;
}

interface FaceToDraw {
  depth: number;
  points: [number, number][];
  color: string;
  stroke: string;
}

export interface InteractiveVoxelDahlia3DProps {
  palette?: DahliaPalette;
  isPlanted?: boolean;
  stateName?: string;
  className?: string;
}

export function InteractiveVoxelDahlia3D({
  palette = DAHLIA_PALETTES[0],
  isPlanted = false,
  stateName = 'México',
  className,
}: InteractiveVoxelDahlia3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ángulos de rotación 3D (Euler: rotY = horizontal yaw, rotX = pitch)
  // Ángulo de reposo isométrico clásico idéntico a dahlia-4.png
  const [rotY, setRotY] = useState(0.785); // 45 grados en rad
  const [rotX, setRotX] = useState(0.61); // ~35 grados en rad
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Referencias para control de animación y arrastre
  const rotYRef = useRef(rotY);
  const rotXRef = useRef(rotX);
  const autoRotateRef = useRef(autoRotate);
  const isDraggingRef = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const animFrameId = useRef<number | null>(null);
  const bloomScaleRef = useRef(1);

  rotYRef.current = rotY;
  rotXRef.current = rotX;
  autoRotateRef.current = autoRotate;

  // Efecto de brote/florecimiento al sembrar
  useEffect(() => {
    if (isPlanted) {
      bloomScaleRef.current = 1.35;
      const start = performance.now();
      const dur = 600;
      const animateBloom = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / dur);
        // Rebote elástico
        const ease = 1 + Math.sin(progress * Math.PI * 2) * 0.25 * (1 - progress);
        bloomScaleRef.current = 1 + 0.35 * (1 - progress) * ease;
        if (progress < 1) {
          requestAnimationFrame(animateBloom);
        } else {
          bloomScaleRef.current = 1;
        }
      };
      requestAnimationFrame(animateBloom);
    }
  }, [isPlanted]);

  // Manejadores de arrastre con mouse y touch
  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    lastMousePos.current = { x: clientX, y: clientY };
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - lastMousePos.current.x;
    const dy = clientY - lastMousePos.current.y;
    lastMousePos.current = { x: clientX, y: clientY };

    // Sensibilidad del mouse
    const sensitivity = 0.009;
    rotYRef.current += dx * sensitivity;
    // Limitar inclinación pitch entre 10° y 80° para siempre ver la belleza de la flor
    rotXRef.current = Math.max(0.18, Math.min(1.35, rotXRef.current + dy * sensitivity));

    setRotY(rotYRef.current);
    setRotX(rotXRef.current);
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    // Reanudar suavemente el auto-giro tras 2.2 segundos de inactividad
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setAutoRotate(true);
    }, 2200);
  }, []);

  const handleResetView = () => {
    rotYRef.current = 0.785;
    rotXRef.current = 0.61;
    setRotY(0.785);
    setRotX(0.61);
    setAutoRotate(true);
  };

  // Render loop 3D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localAngle = rotYRef.current;

    const render = () => {
      // Auto-rotación sutil y fluida si no se está arrastrando
      if (autoRotateRef.current && !isDraggingRef.current) {
        localAngle += 0.007;
        rotYRef.current = localAngle;
      } else {
        localAngle = rotYRef.current;
      }

      const curPitch = rotXRef.current;
      const curYaw = rotYRef.current;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 10;
      // Escala visual adaptativa
      const baseScale = Math.min(width, height) / 14.5;
      const currentScale = baseScale * bloomScaleRef.current;

      // Matriz de rotación: R = Rx(pitch) * Ry(yaw)
      const cosY = Math.cos(curYaw);
      const sinY = Math.sin(curYaw);
      const cosX = Math.cos(curPitch);
      const sinX = Math.sin(curPitch);

      // Dirección de la luz principal (iluminación cenital cálida estilo estudio)
      const lightDir: Vec3 = [0.35, -0.65, 0.7];
      const lightLen = Math.hypot(lightDir[0], lightDir[1], lightDir[2]);
      const normLight: Vec3 = [
        lightDir[0] / lightLen,
        lightDir[1] / lightLen,
        lightDir[2] / lightLen,
      ];

      // 1. Dibujar sombra elíptica suave en el pedestal
      const shadowRadiusX = 5.2 * currentScale;
      const shadowRadiusY = 2.4 * currentScale * Math.sin(curPitch);
      const shadowY = centerY + 3.8 * currentScale * Math.sin(curPitch);

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, shadowY, shadowRadiusX, Math.max(12, shadowRadiusY), 0, 0, Math.PI * 2);
      const shadowGrad = ctx.createRadialGradient(
        centerX,
        shadowY,
        0,
        centerX,
        shadowY,
        shadowRadiusX
      );
      shadowGrad.addColorStop(0, 'rgba(15, 27, 45, 0.22)');
      shadowGrad.addColorStop(0.6, 'rgba(15, 27, 45, 0.08)');
      shadowGrad.addColorStop(1, 'rgba(15, 27, 45, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.fill();
      ctx.restore();

      // 2. Proyectar y recolectar las caras de los vóxeles
      const faces: FaceToDraw[] = [];

      STATIC_VOXELS.forEach((v) => {
        // Asignar color según el rol del voxel y la paleta actual
        let baseHex = palette.primary;
        if (v.type === 'core') baseHex = palette.core;
        else if (v.type === 'coreAccent') baseHex = palette.coreAccent;
        else if (v.type === 'inner') baseHex = palette.inner;
        else if (v.type === 'outer') baseHex = palette.outer;
        else if (v.type === 'base') baseHex = palette.base;

        const h = (v.size * 0.95) / 2;

        // 8 esquinas del cubo voxel en espacio de modelo
        const corners: Vec3[] = [
          [v.x - h, v.y - h, v.z - h],
          [v.x + h, v.y - h, v.z - h],
          [v.x + h, v.y + h, v.z - h],
          [v.x - h, v.y + h, v.z - h],
          [v.x - h, v.y - h, v.z + h],
          [v.x + h, v.y - h, v.z + h],
          [v.x + h, v.y + h, v.z + h],
          [v.x - h, v.y + h, v.z + h],
        ];

        // Rotar esquinas: primero alrededor de Z/Y (yaw), luego X (pitch)
        const rotCorners = corners.map(([cx, cy, cz]): Vec3 => {
          // Rotación Yaw (eje horizontal)
          const x1 = cx * cosY - cy * sinY;
          const y1 = cx * sinY + cy * cosY;
          const z1 = cz;

          // Rotación Pitch (inclinación hacia el observador)
          const x2 = x1;
          const y2 = y1 * cosX - z1 * sinX;
          const z2 = y1 * sinX + z1 * cosX;

          return [x2, y2, z2];
        });

        // 6 caras del cubo con sus índices y normales originales
        const faceDefs: { indices: [number, number, number, number]; normal: Vec3 }[] = [
          { indices: [4, 5, 6, 7], normal: [0, 0, 1] }, // Superior (Top)
          { indices: [0, 3, 2, 1], normal: [0, 0, -1] }, // Inferior (Bottom)
          { indices: [3, 2, 6, 7], normal: [0, 1, 0] }, // Frontal
          { indices: [0, 1, 5, 4], normal: [0, -1, 0] }, // Posterior
          { indices: [1, 2, 6, 5], normal: [1, 0, 0] }, // Derecha
          { indices: [0, 4, 7, 3], normal: [-1, 0, 0] }, // Izquierda
        ];

        faceDefs.forEach(({ indices, normal }) => {
          // Rotar vector normal
          const nx1 = normal[0] * cosY - normal[1] * sinY;
          const ny1 = normal[0] * sinY + normal[1] * cosY;
          const nz1 = normal[2];

          const nx2 = nx1;
          const ny2 = ny1 * cosX - nz1 * sinX;
          const nz2 = ny1 * sinX + nz1 * cosX;

          // Culling de caras traseras: si mira hacia atrás, descartar
          if (nz2 <= 0.02) return;

          // Iluminación según el ángulo con la fuente de luz
          const dot = nx2 * normLight[0] + ny2 * normLight[1] + nz2 * normLight[2];
          // Top recibe iluminación cenital especial
          const isTop = normal[2] > 0.5;
          const shade = isTop
            ? 1.15
            : Math.max(0.65, Math.min(1.05, 0.8 + dot * 0.35));

          const pts: [number, number][] = indices.map((idx) => {
            const p = rotCorners[idx];
            return [centerX + p[0] * currentScale, centerY - p[1] * currentScale];
          });

          // Profundidad promedio para el Painter's Algorithm
          const depth =
            (rotCorners[indices[0]][2] +
              rotCorners[indices[1]][2] +
              rotCorners[indices[2]][2] +
              rotCorners[indices[3]][2]) /
            4;

          const fillColor = shadeColor(baseHex, shade);
          const strokeColor = shadeColor(baseHex, Math.max(0.45, shade * 0.85));

          faces.push({
            depth,
            points: pts,
            color: fillColor,
            stroke: strokeColor,
          });
        });
      });

      // 3. Ordenar caras de atrás hacia adelante (Painter's Algorithm)
      faces.sort((a, b) => a.depth - b.depth);

      // 4. Dibujar polígonos con filete fino voxel pixel-art
      faces.forEach(({ points, color, stroke }) => {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        ctx.lineTo(points[1][0], points[1][1]);
        ctx.lineTo(points[2][0], points[2][1]);
        ctx.lineTo(points[3][0], points[3][1]);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      });

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [palette]);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-between p-6 sm:p-7 rounded-[4px] bg-[#FDFCFA] border border-[#E5DFD7] shadow-[-8px_14px_28px_-6px_rgba(18,24,38,0.08)] select-none overflow-hidden',
        className
      )}
    >
      {/* Filete decorativo superior en el color activo */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300"
        style={{
          background: `linear-gradient(90deg, ${palette.outer}, ${palette.primary}, ${palette.inner})`,
        }}
      />

      {/* Cabecera de vitrina / Pedestal editorial */}
      <div className="w-full flex items-center justify-between gap-2 pb-3 mb-2 border-b border-black/5">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full transition-colors duration-300 animate-pulse"
            style={{ backgroundColor: palette.hex }}
          />
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-[#0F1B2D]">
            MODELO VOXEL 3D
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-dalia-800 bg-dalia-50 border border-dalia-200/60 px-2 py-0.5 rounded-[2px]">
          {palette.name}
        </span>
      </div>

      {/* Canvas 3D Interactivo */}
      <div
        className="relative w-full aspect-square max-w-[340px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none group"
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchEnd={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
        />

        {/* Indicador de ayuda táctil en reposo */}
        <div
          className={cn(
            'absolute bottom-2 inset-x-0 mx-auto w-fit px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-black/10 text-[10px] font-mono font-medium text-[#4A5568] tracking-wider uppercase transition-opacity duration-300 pointer-events-none shadow-sm flex items-center gap-1.5',
            isDragging ? 'opacity-0' : 'opacity-85 group-hover:opacity-100'
          )}
        >
          <span>Arrastra para rotar 360°</span>
        </div>
      </div>

      {/* Controles de Vitrina al pie */}
      <div className="w-full mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-mono text-[#5A6474]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#F5F2EC] hover:bg-[#EAE4D9] text-[#2C384A] text-[11px] font-mono transition-colors cursor-pointer"
            title={autoRotate ? 'Pausar auto-giro' : 'Reanudar auto-giro'}
          >
            {autoRotate ? (
              <>
                <Pause className="w-3 h-3 text-[#717E91]" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#717E91]" />
                <span>Girar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[2px] bg-[#F5F2EC] hover:bg-[#EAE4D9] text-[#2C384A] text-[11px] font-mono transition-colors cursor-pointer"
            title="Restablecer ángulo isométrico"
          >
            <RotateCcw className="w-3 h-3 text-[#717E91]" />
            <span>Vista</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#0F1B2D] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-dalia-600" />
          <span>{stateName}</span>
        </div>
      </div>
    </div>
  );
}
