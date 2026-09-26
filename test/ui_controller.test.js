import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UIController } from '../src/ui_controller.js';
import { PLAYER_HUMAN, PLAYER_AI } from '../src/engine.js';

// Mock DOM Element helper for Node.js test environment
function createMockElement(tagName = 'div', attributes = {}) {
  const listeners = {};
  const classList = new Set();
  const attrs = { ...attributes };

  return {
    tagName: tagName.toUpperCase(),
    textContent: '',
    className: '',
    value: attrs.value || '',
    checked: Boolean(attrs.checked),
    classList: {
      add: (cls) => classList.add(cls),
      remove: (cls) => classList.delete(cls),
      contains: (cls) => classList.has(cls),
    },
    setAttribute: (name, val) => {
      attrs[name] = String(val);
    },
    getAttribute: (name) => attrs[name] ?? null,
    addEventListener: (event, handler) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    },
    dispatch: (event, eventObj = {}) => {
      if (listeners[event]) {
        listeners[event].forEach((fn) => fn(eventObj));
      }
    },
    get _classListSet() {
      return classList;
    },
  };
}

describe('UIController', () => {
  function setupMockUI(difficulty = 'easy') {
    const statusElement = createMockElement('div');
    const cellElements = Array.from({ length: 9 }, (_, i) =>
      createMockElement('button', { 'data-index': i, 'aria-label': `Casella ${i + 1}, vuota` })
    );
    const difficultyInput = createMockElement('select', { value: difficulty });
    const resetButton = createMockElement('button');

    const controller = new UIController(
      {
        statusElement,
        cellElements,
        difficultyInput,
        resetButton,
      },
      { aiDelay: 0 } // instant AI response in tests
    );

    return { controller, statusElement, cellElements, difficultyInput, resetButton };
  }

  it('initializes UI correctly', () => {
    const { controller, statusElement, cellElements } = setupMockUI('easy');
    assert.equal(controller.gameState.difficulty, 'easy');
    assert.equal(controller.gameState.currentTurn, PLAYER_HUMAN);
    assert.equal(statusElement.textContent, 'Tuo turno (X)');
    cellElements.forEach((cell, i) => {
      assert.equal(cell.textContent, '');
      assert.equal(cell.getAttribute('aria-label'), `Casella ${i + 1}, vuota`);
      assert.equal(cell.getAttribute('aria-disabled'), 'false');
    });
  });

  it('applies human move on click and executes AI move asynchronously', async () => {
    const { controller, cellElements, statusElement } = setupMockUI('easy');
    
    // Click cell 0
    cellElements[0].dispatch('click');
    assert.equal(controller.gameState.board[0], 'X');
    assert.equal(cellElements[0].textContent, 'X');
    assert.equal(cellElements[0].getAttribute('aria-label'), 'Casella 1, X');

    // Wait for AI setTimeout to finish
    await new Promise((resolve) => setTimeout(resolve, 10));

    // AI should have played one move 'O'
    const oCount = controller.gameState.board.filter((c) => c === 'O').length;
    assert.equal(oCount, 1);
    assert.equal(controller.gameState.currentTurn, PLAYER_HUMAN);
  });

  it('ignores clicks on already occupied cells', () => {
    const { controller, cellElements } = setupMockUI('easy');
    cellElements[0].dispatch('click');
    const boardSnapshot = [...controller.gameState.board];

    // Click again on cell 0
    cellElements[0].dispatch('click');
    assert.deepEqual(controller.gameState.board, boardSnapshot);
  });

  it('ignores clicks when AI is thinking', () => {
    const { controller, cellElements } = setupMockUI('easy');
    controller.isAiThinking = true;
    cellElements[1].dispatch('click');
    assert.equal(controller.gameState.board[1], null);
  });

  it('resets game when reset button is clicked', async () => {
    const { controller, cellElements, resetButton, statusElement } = setupMockUI('medium');
    cellElements[0].dispatch('click');
    await new Promise((resolve) => setTimeout(resolve, 10));

    resetButton.dispatch('click');
    assert.deepEqual(controller.gameState.board, Array(9).fill(null));
    assert.equal(controller.gameState.status, 'in_progress');
    assert.equal(controller.gameState.currentTurn, PLAYER_HUMAN);
    assert.equal(statusElement.textContent, 'Tuo turno (X)');
  });

  it('handles keyboard Enter / Space activation on cells', () => {
    const { controller, cellElements } = setupMockUI('easy');
    let prevented = false;
    cellElements[4].dispatch('keydown', {
      key: 'Enter',
      preventDefault: () => {
        prevented = true;
      },
    });
    assert.equal(prevented, true);
    assert.equal(controller.gameState.board[4], 'X');
  });
});
