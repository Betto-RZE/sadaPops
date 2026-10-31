import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

describe('Soporte Móvil del Videojuego (Controles Virtuales y Orientación Obligatoria)', () => {
  it('1. RotateDeviceOverlay y VirtualGamepad existen y están exportados', () => {
    assert.ok(fs.existsSync(path.join(srcDir, 'RotateDeviceOverlay.tsx')));
    assert.ok(fs.existsSync(path.join(srcDir, 'VirtualGamepad.tsx')));

    const indexContent = fs.readFileSync(path.join(srcDir, 'index.tsx'), 'utf8');
    assert.ok(indexContent.includes('RotateDeviceOverlay'));
    assert.ok(indexContent.includes('VirtualGamepad'));

    const indexTsContent = fs.readFileSync(path.join(srcDir, 'index.ts'), 'utf8');
    assert.ok(indexTsContent.includes('RotateDeviceOverlay'));
    assert.ok(indexTsContent.includes('VirtualGamepad'));
  });

  it('2. PixiGameCanvas integra el RotateDeviceOverlay para forzar horizontal', () => {
    const indexContent = fs.readFileSync(path.join(srcDir, 'index.tsx'), 'utf8');
    assert.ok(
      indexContent.includes('<RotateDeviceOverlay'),
      'PixiGameCanvas debe renderizar RotateDeviceOverlay para obligar a jugar en horizontal'
    );
  });

  it('3. Capítulo 1 (GameplayScene) integra VirtualGamepad y lo oculta en diálogos', () => {
    const cap1Content = fs.readFileSync(path.join(srcDir, 'GameplayScene.tsx'), 'utf8');
    assert.ok(cap1Content.includes('<VirtualGamepad'));
    assert.ok(
      cap1Content.includes('visible={dialogueState === "dismissed" && !isPaused}'),
      'Capítulo 1 debe mostrar el gamepad solo cuando el diálogo está cerrado'
    );
  });

  it('4. Capítulo 2 (Chapter2Scene) integra VirtualGamepad y lo oculta en diálogos', () => {
    const cap2Content = fs.readFileSync(path.join(srcDir, 'Chapter2Scene.tsx'), 'utf8');
    assert.ok(cap2Content.includes('<VirtualGamepad'));
    assert.ok(
      cap2Content.includes('!showBridgeDialogue') &&
      cap2Content.includes('!showConversation') &&
      cap2Content.includes('!showOutroDialogue'),
      'Capítulo 2 debe ocultar el gamepad durante cualquier diálogo o trivia'
    );
  });

  it('5. Capítulo 3 (Chapter3Scene) integra VirtualGamepad y lo elimina en la mampara POV (simulador)', () => {
    const cap3Content = fs.readFileSync(path.join(srcDir, 'Chapter3Scene.tsx'), 'utf8');
    assert.ok(cap3Content.includes('<VirtualGamepad'));
    assert.ok(
      cap3Content.includes('selectedMamparaIndex === null'),
      'Capítulo 3 debe eliminar obligatoriamente el gamepad virtual durante la vista POV de la mampara de voto'
    );
    assert.ok(
      cap3Content.includes('!showIntroDialogue'),
      'Capítulo 3 debe ocultar el gamepad durante el diálogo inicial'
    );
  });
});

