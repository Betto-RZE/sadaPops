import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadImages } from '../src/features/loading/loadImages.ts';
import { GAME_ASSET_PATHS } from '../src/features/loading/gameAssets.ts';

describe('Game resource loading gate', () => {
  it('ships every resource in the generated loading manifest', () => {
    assert.ok(GAME_ASSET_PATHS.length > 0);
    for (const source of GAME_ASSET_PATHS) {
      assert.ok(fs.existsSync(new URL('../../../apps/web/public' + source, import.meta.url)), source);
    }
  });
  it('waits for decoding, deduplicates URLs and limits concurrent requests to four', async () => {
    let active = 0, peak = 0, decoded = 0, requests = 0;
    const progress = [];
    const factory = () => ({
      naturalWidth: 512,
      set src(value) {
        requests++;
        peak = Math.max(peak, ++active);
        setImmediate(() => this.onload());
      },
      async decode() {
        await new Promise(resolve => setImmediate(resolve));
        active--; decoded++;
      },
    });
    await loadImages(['a', 'b', 'c', 'd', 'e', 'a'], (n, total) => progress.push([n, total]), factory);
    assert.equal(requests, 5);
    assert.equal(decoded, 5);
    assert.equal(peak, 4);
    assert.deepEqual(progress.at(-1), [5, 5]);
  });
  it('rejects a broken resource and permits a clean retry', async () => {
    await assert.rejects(loadImages(['broken'], () => {}, () => ({
      set src(value) { setImmediate(() => this.onerror()); },
    })), /No se pudo cargar/);
    await loadImages(['broken'], () => {}, () => ({
      naturalWidth: 512,
      set src(value) { setImmediate(() => this.onload()); },
      async decode() {},
    }));
  });
  it('does not consider undecodable images ready', async () => {
    await assert.rejects(loadImages(['bad'], () => {}, () => ({
      naturalWidth: 512,
      set src(value) { setImmediate(() => this.onload()); },
      async decode() { throw new Error('Decode failed'); },
    })), /decodificar/);
  });
  it('cancels an outstanding load when the game unmounts', async () => {
    const controller = new AbortController();
    const loading = loadImages(['pending'], () => {}, () => ({ set src(value) {} }), controller.signal);
    controller.abort();
    await assert.rejects(loading, /cancelada/);
  });
});
