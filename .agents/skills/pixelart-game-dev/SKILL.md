---
name: pixelart-game-dev
description: Instrucciones técnicas para el desarrollo de módulos del juego 2D en pixel art dentro de packages/game usando PixiJS/Kaplay y conectando el estado con Next.js.
---

# Skill: Desarrollo del Juego Pixel Art y Puente con Next.js

## 1. Visión General
El **Modo Juego Pixel Art** proporciona un canal narrativo interactivo alternativo para enganchar al público joven. Contiene dos sub-características jugables:
1. **Desmentir Mitos:** Diálogos con NPCs para desmentir mitos cívicos con datos reales de la CCPC.
2. **Simulador de Voto:** Emulador del proceso paso a paso en la casilla de votación.

---

## 2. Arquitectura del Paquete (`packages/game/`)

```
packages/game/
├── src/
│   ├── engine/                     # Inicialización de PixiJS / Kaplay y gestor de escala del canvas
│   ├── features/
│   │   ├── mitos/                  # Sistema de diálogo y grafo de la escena de mitos
│   │   └── simulador-voto/         # Lógica de simulación de votación paso a paso
│   ├── shared/
│   │   ├── sprites/                # Assets en pixel art (funcionario INE, urna, ciudadanía)
│   │   └── ui/                     # Cajas de diálogo, cargadores de fuentes pixel
│   └── index.ts                    # Exporta componente PixiGameCanvas y callback de finalización
```

---

## 3. Puente de Comunicación (Juego $\leftrightarrow$ Aplicación Web)

Cuando un jugador completa una escena en el juego, se dispara un callback de finalización para notificar a Next.js y actualizar el estado de desbloqueo del usuario para "Agrega tu dalia":

```typescript
// packages/game/src/index.ts
export interface GameProps {
  onModuleComplete?: (moduleName: 'mitos' | 'simulador') => void;
  language?: 'es' | 'nah';
}

export function PixiGameCanvas({ onModuleComplete, language = 'es' }: GameProps) {
  useEffect(() => {
    const app = new PIXI.Application({ width: 800, height: 450, backgroundColor: 0x1e1b4b });
    // Montar canvas e iniciar loop del juego...

    // Al completar la escena:
    // onModuleComplete?.('mitos');

    return () => app.destroy(true);
  }, [language]);

  return <div id="game-container" className="rounded-xl overflow-hidden shadow-2xl" />;
}
```

---

## 4. Reglas de Diversidad Cultural y Representación
- Los sprites de los personajes deben reflejar la diversidad mexicana real (comunidades rurales, urbanas, indígenas, migrantes).
- Evitar caricaturas o rasgos estereotipados exagerados. Utilizar referencias visuales respetuosas.
- Todas las cadenas de diálogo deben provenir de las claves de i18n definidas en `packages/types` para soportar Náhuatl.
