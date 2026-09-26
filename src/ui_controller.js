/**
 * UI Controller for Tris (Tic-Tac-Toe)
 * Coordinates user events, AI scheduling, DOM updates, and accessibility.
 */

import {
  PLAYER_HUMAN,
  PLAYER_AI,
  createInitialState,
  applyMove,
} from './engine.js';
import { getAiMove } from './ai.js';

export class UIController {
  /**
   * @param {object} domElements
   * @param {HTMLElement} domElements.statusElement
   * @param {NodeListOf<HTMLElement>|Array<HTMLElement>} domElements.cellElements
   * @param {HTMLSelectElement|NodeListOf<HTMLInputElement>} domElements.difficultyInput
   * @param {HTMLElement} domElements.resetButton
   * @param {object} [options]
   * @param {number} [options.aiDelay=150]
   */
  constructor(domElements, options = {}) {
    this.statusElement = domElements.statusElement;
    this.cellElements = Array.from(domElements.cellElements);
    this.difficultyInput = domElements.difficultyInput;
    this.resetButton = domElements.resetButton;
    this.aiDelay = options.aiDelay !== undefined ? options.aiDelay : 150;

    this.gameState = createInitialState(this.getSelectedDifficulty());
    this.isAiThinking = false;
    this.aiTimeoutId = null;

    this.initEvents();
    this.render();
  }

  getSelectedDifficulty() {
    if (!this.difficultyInput) return 'medium';
    if (this.difficultyInput.value !== undefined) {
      return this.difficultyInput.value;
    }
    // If RadioNodeList or Array of radio buttons
    if (typeof this.difficultyInput.forEach === 'function') {
      for (const input of this.difficultyInput) {
        if (input.checked) return input.value;
      }
    }
    return 'medium';
  }

  initEvents() {
    this.cellElements.forEach((cell, index) => {
      cell.addEventListener('click', () => this.handleCellClick(index));
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleCellClick(index);
        }
      });
    });

    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.handleReset());
    }

    if (this.difficultyInput) {
      const onDifficultyChange = (val) => {
        this.gameState.difficulty = val;
      };
      if (this.difficultyInput.addEventListener) {
        this.difficultyInput.addEventListener('change', (e) => {
          onDifficultyChange(e.target.value);
        });
      } else if (typeof this.difficultyInput.forEach === 'function') {
        this.difficultyInput.forEach((radio) => {
          radio.addEventListener('change', (e) => {
            if (e.target.checked) onDifficultyChange(e.target.value);
          });
        });
      }
    }
  }

  handleCellClick(index) {
    if (this.gameState.status !== 'in_progress' || this.gameState.currentTurn !== PLAYER_HUMAN || this.isAiThinking) {
      return;
    }

    const result = applyMove(this.gameState, index, PLAYER_HUMAN);
    if (!result.success) {
      return;
    }

    this.gameState = result.state;
    this.render();

    if (this.gameState.status === 'in_progress' && this.gameState.currentTurn === PLAYER_AI) {
      this.scheduleAiTurn();
    }
  }

  scheduleAiTurn() {
    this.isAiThinking = true;
    this.renderStatusIndicator();
    this.updateBoardInteractivity();

    this.aiTimeoutId = setTimeout(() => {
      try {
        const aiIndex = getAiMove(this.gameState.board, this.gameState.difficulty);
        if (aiIndex >= 0) {
          const result = applyMove(this.gameState, aiIndex, PLAYER_AI);
          if (result.success) {
            this.gameState = result.state;
          }
        }
      } finally {
        this.isAiThinking = false;
        this.aiTimeoutId = null;
        this.render();
      }
    }, this.aiDelay);
  }

  handleReset() {
    if (this.aiTimeoutId) {
      clearTimeout(this.aiTimeoutId);
      this.aiTimeoutId = null;
    }
    this.isAiThinking = false;
    const diff = this.getSelectedDifficulty();
    this.gameState = createInitialState(diff);
    this.render();
  }

  render() {
    this.renderBoard();
    this.renderStatusIndicator();
    this.updateBoardInteractivity();
  }

  renderBoard() {
    const winningSet = new Set(this.gameState.winningLine || []);

    this.cellElements.forEach((cell, index) => {
      const val = this.gameState.board[index];
      cell.textContent = val !== null ? val : '';

      // Accessible aria-label
      const posNum = index + 1;
      if (val === null) {
        cell.setAttribute('aria-label', `Casella ${posNum}, vuota`);
      } else {
        cell.setAttribute('aria-label', `Casella ${posNum}, ${val}`);
      }

      if (winningSet.has(index)) {
        cell.classList.add('cell--winning');
      } else {
        cell.classList.remove('cell--winning');
      }
    });
  }

  updateBoardInteractivity() {
    const isGameOver = this.gameState.status !== 'in_progress';
    const disabled = isGameOver || this.isAiThinking || this.gameState.currentTurn !== PLAYER_HUMAN;

    this.cellElements.forEach((cell, index) => {
      const isOccupied = this.gameState.board[index] !== null;
      if (disabled || isOccupied) {
        cell.setAttribute('aria-disabled', 'true');
        cell.classList.add('cell--disabled');
      } else {
        cell.setAttribute('aria-disabled', 'false');
        cell.classList.remove('cell--disabled');
      }
    });
  }

  renderStatusIndicator() {
    if (!this.statusElement) return;

    if (this.gameState.status === 'won') {
      if (this.gameState.winner === PLAYER_HUMAN) {
        this.statusElement.textContent = 'Hai vinto!';
        this.statusElement.className = 'status-message status--won';
      } else {
        this.statusElement.textContent = 'Il computer ha vinto!';
        this.statusElement.className = 'status-message status--lost';
      }
      return;
    }

    if (this.gameState.status === 'draw') {
      this.statusElement.textContent = 'Pareggio!';
      this.statusElement.className = 'status-message status--draw';
      return;
    }

    // In progress
    this.statusElement.className = 'status-message status--in-progress';
    if (this.isAiThinking || this.gameState.currentTurn === PLAYER_AI) {
      this.statusElement.textContent = 'Turno del computer (O)...';
    } else {
      this.statusElement.textContent = 'Tuo turno (X)';
    }
  }
}
