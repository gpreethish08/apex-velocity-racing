import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvasContainer = document.getElementById('canvas-container');
  const hudContainer = document.getElementById('hud-container');

  if (canvasContainer && hudContainer) {
    const game = new Game(canvasContainer, hudContainer);
    window.__APEX_GAME__ = game;
  }
});
