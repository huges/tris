/**
 * Application entry point for Tris (Tic-Tac-Toe)
 */

import { UIController } from './ui_controller.js';

document.addEventListener('DOMContentLoaded', () => {
  const statusElement = document.getElementById('status-message');
  const cellElements = document.querySelectorAll('.cell');
  const resetButton = document.getElementById('btn-reset');
  const difficultyInput = document.getElementById('select-difficulty');

  new UIController({
    statusElement,
    cellElements,
    difficultyInput,
    resetButton,
  });
});
