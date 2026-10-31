import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getFullscreenElement, requestGameFullscreen, exitGameFullscreen, getGameViewport, isStandaloneDisplay } from '../src/features/fullscreen/fullscreen.ts';

describe('Mobile fullscreen compatibility', () => {
  it('does not mistake a regular browser tab for an installed app', () => {
    const win = { matchMedia: () => ({ matches: false }) };
    assert.equal(isStandaloneDisplay(win, {}), false);
    assert.equal(isStandaloneDisplay(win, { standalone: false }), false);
    assert.equal(isStandaloneDisplay(win, { standalone: true }), true);
  });
  it('recognizes standalone and fullscreen Home Screen launches', () => {
    for (const mode of ['standalone', 'fullscreen']) {
      const win = { matchMedia: query => ({ matches: query === `(display-mode: ${mode})` }) };
      assert.equal(isStandaloneDisplay(win, {}), true);
    }
  });
  it('fits expanded mode to the visible area when browser bars obscure the layout viewport', () => {
    const win = { innerWidth: 844, innerHeight: 390,
      visualViewport: { width: 844, height: 320, offsetLeft: 0, offsetTop: 24 } };
    assert.deepEqual(getGameViewport(win, true), { width: 844, height: 320, left: 0, top: 24 });
    win.visualViewport = { width: 390, height: 760, offsetLeft: 0, offsetTop: 0 };
    assert.deepEqual(getGameViewport(win, true), { width: 390, height: 760, left: 0, top: 0 });
  });
  it('uses the full window for native fullscreen and when VisualViewport is unavailable', () => {
    const win = { innerWidth: 844, innerHeight: 390,
      visualViewport: { width: 844, height: 320, offsetLeft: 0, offsetTop: 24 } };
    assert.deepEqual(getGameViewport(win, false), { width: 844, height: 390, left: 0, top: 0 });
    assert.deepEqual(getGameViewport({ ...win, visualViewport: null }, true),
      { width: 844, height: 390, left: 0, top: 0 });
  });
  it('reports native fullscreen as unavailable when the API is missing', async () => {
    assert.equal(await requestGameFullscreen({ ownerDocument: {} }), false);
  });
  it('reports failure when the browser denies the request', async () => {
    assert.equal(await requestGameFullscreen({ ownerDocument: {}, requestFullscreen() {
      throw new Error('Permission denied');
    } }), false);
    assert.equal(await requestGameFullscreen({ ownerDocument: {}, async requestFullscreen() {
      throw new Error('Not supported');
    } }), false);
  });
  it('preserves the receiver and enters and exits standard fullscreen', async () => {
    const doc = { fullscreenElement: null, async exitFullscreen() { this.fullscreenElement = null; } };
    const element = { ownerDocument: doc, async requestFullscreen(options) {
      assert.deepEqual(options, { navigationUI: 'hide' });
      doc.fullscreenElement = this;
    } };
    assert.equal(await requestGameFullscreen(element), true);
    assert.equal(getFullscreenElement(doc), element);
    await exitGameFullscreen(doc);
    assert.equal(getFullscreenElement(doc), null);
  });
  it('supports Safari prefixed entry, detection and exit', async () => {
    const doc = { webkitFullscreenElement: null, webkitExitFullscreen() { this.webkitFullscreenElement = null; } };
    const element = { ownerDocument: doc, webkitRequestFullscreen() { doc.webkitFullscreenElement = this; } };
    assert.equal(await requestGameFullscreen(element), true);
    assert.equal(getFullscreenElement(doc), element);
    await exitGameFullscreen(doc);
    assert.equal(getFullscreenElement(doc), null);
  });
  it('does not report success when a request silently fails or another element is fullscreen', async () => {
    assert.equal(await requestGameFullscreen({ ownerDocument: { fullscreenElement: {} }, requestFullscreen() {} }), false);
  });
});
