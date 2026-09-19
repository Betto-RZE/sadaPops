---
name: pixelart-game-dev
description: Technical instructions for developing 2D pixel art game modules in packages/game using PixiJS/Kaplay and bridging state with Next.js.
---

# Skill: Pixel Art Game Development & Next.js Bridge

## 1. Overview
The **Modo Juego Pixel Art** provides an alternative, interactive narrative channel for youth engagement. It contains two playable sub-features:
1. **Desmentir Mitos:** NPC dialogues debunking civic myths with real CCPC data.
2. **Simulador de Voto:** Interactive voting booth process emulator.

---

## 2. Package Architecture (`packages/game/`)

```
packages/game/
├── src/
│   ├── engine/                     # PixiJS / Kaplay initialization & canvas scale manager
│   ├── features/
│   │   ├── mitos/                  # Dialogue system & myth buster scene graph
│   │   └── simulador-voto/         # Step-by-step voting simulation logic
│   ├── shared/
│   │   ├── sprites/                # Pixel art assets (INE officer, ballot box, citizens)
│   │   └── ui/                     # Dialog boxes, pixel font loaders
│   └── index.ts                    # Exports PixiGameCanvas component & completion callback
```

---

## 3. Communication Bridge (Game $\leftrightarrow$ Web App)

When a player completes a scene in the game, trigger the completion callback to inform Next.js and update the user's unlock status for "Agrega tu dalia":

```typescript
// packages/game/src/index.ts
export interface GameProps {
  onModuleComplete?: (moduleName: 'mitos' | 'simulador') => void;
  language?: 'es' | 'nah';
}

export function PixiGameCanvas({ onModuleComplete, language = 'es' }: GameProps) {
  useEffect(() => {
    const app = new PIXI.Application({ width: 800, height: 450, backgroundColor: 0x1e1b4b });
    // Mount canvas & start game loop...

    // On scene completion trigger:
    // onModuleComplete?.('mitos');

    return () => app.destroy(true);
  }, [language]);

  return <div id="game-container" className="rounded-xl overflow-hidden shadow-2xl" />;
}
```

---

## 4. Cultural Diversity & Representation Rules
- Character sprites must reflect real Mexican diversity (rural, urban, indigenous, migrant).
- Avoid caricatures or exaggerated stereotypical traits. Use respectful visual references.
- All dialogue strings must be driven by `packages/types` i18n keys to support Náhuatl.
