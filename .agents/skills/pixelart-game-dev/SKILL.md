---
name: pixelart-game-dev
description: Instrucciones técnicas detalladas para desarrollar las escenas en pixel art (Mitos y Simulador de Voto) en packages/game usando PixiJS/Kaplay y conectando el estado con Next.js.
---

# Skill: Desarrollo del Juego Pixel Art (Core Feature #2)

## 1. Visión General
El **Modo Juego Pixel Art** en `packages/game/` proporciona un canal interactivo gamificado pensado para el público joven. Contiene dos sub-características principales:
1. **Desmentir Mitos Cívicos:** Grafo de diálogo interactivo donde personajes responden mitos con datos reales de la CCPC del INE.
2. **Simulador de Voto:** Emulador paso a paso de la experiencia en la casilla de votación.

---

## 2. Especificación Técnica de las Escenas

### Escena 1: Desmentir Mitos (Diálogos con Datos CCPC)
- El jugador controla al funcionario INE en un mapa 2D de un módulo cívico.
- Al interactuar con NPCs jóvenes, se despliega un árbol de diálogo con 3 opciones de respuesta.
- La respuesta correcta utiliza **datos oficiales de la CCPC del INE** (ej. *"De 2012 a 2024 la participación del grupo de 18-29 años creció en 14 entidades"*).

### Escena 2: Simulador de Voto en Casilla (Paso a Paso)
- **Paso 1:** Presentación de la credencial del INE.
- **Paso 2:** Verificación en la lista nominal.
- **Paso 3:** Recepción de boletas impresas.
- **Paso 4:** Ingreso a la mampara y marcado secreto.
- **Paso 5:** Depósito en urnas según la elección.
- **Paso 6:** Tinta indeleble en el pulgar y devolución de credencial.

---

## 3. Integración en Next.js y Callback de Desbloqueo

En `apps/web/src/features/juego/GameLoader.tsx`:
```tsx
'use client';
import dynamic from 'next/dynamic';

const CanvasGame = dynamic(
  () => import('@mapa-dalias/game').then((mod) => mod.PixiGameCanvas),
  { ssr: false, loading: () => <div>Cargando motor de juego pixel art...</div> }
);

export function GameLoader() {
  const handleComplete = (moduleName: string) => {
    // Registra módulo completado y desbloquea el botón "Agrega tu dalia"
  };

  return <CanvasGame onModuleComplete={handleComplete} />;
}
```
