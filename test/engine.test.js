import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAYER_HUMAN,
  PLAYER_AI,
  createInitialState,
  getAvailableMoves,
  checkTerminal,
  applyMove,
} from '../src/engine.js';

describe('Game Engine', () => {
  it('creates initial state correctly', () => {
    const state = createInitialState('medium');
    assert.deepEqual(state.board, Array(9).fill(null));
    assert.equal(state.currentTurn, PLAYER_HUMAN);
    assert.equal(state.status, 'in_progress');
    assert.equal(state.winner, null);
    assert.equal(state.winningLine, null);
    assert.equal(state.difficulty, 'medium');
  });

  it('handles fallback for invalid difficulty gracefully', () => {
    const state = createInitialState('unknown');
    assert.equal(state.difficulty, 'medium');
  });

  it('returns available moves accurately', () => {
    const board = [null, 'X', null, 'O', null, null, 'X', 'O', null];
    assert.deepEqual(getAvailableMoves(board), [0, 2, 4, 5, 8]);
  });

  it('detects row win', () => {
    const board = [
      'X', 'X', 'X',
      null, 'O', null,
      'O', null, null
    ];
    const terminal = checkTerminal(board);
    assert.equal(terminal.status, 'won');
    assert.equal(terminal.winner, 'X');
    assert.deepEqual(terminal.winningLine, [0, 1, 2]);
  });

  it('detects column win', () => {
    const board = [
      'O', 'X', null,
      'O', 'X', null,
      'O', null, null
    ];
    const terminal = checkTerminal(board);
    assert.equal(terminal.status, 'won');
    assert.equal(terminal.winner, 'O');
    assert.deepEqual(terminal.winningLine, [0, 3, 6]);
  });

  it('detects diagonal win', () => {
    const board = [
      'X', 'O', null,
      'O', 'X', null,
      null, null, 'X'
    ];
    const terminal = checkTerminal(board);
    assert.equal(terminal.status, 'won');
    assert.equal(terminal.winner, 'X');
    assert.deepEqual(terminal.winningLine, [0, 4, 8]);
  });

  it('detects anti-diagonal win', () => {
    const board = [
      'O', 'X', 'O',
      null, 'O', 'X',
      'O', null, 'X'
    ];
    const terminal = checkTerminal(board);
    assert.equal(terminal.status, 'won');
    assert.equal(terminal.winner, 'O');
    assert.deepEqual(terminal.winningLine, [2, 4, 6]);
  });

  it('detects draw when board full and no winner', () => {
    const board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X'
    ];
    const terminal = checkTerminal(board);
    assert.equal(terminal.status, 'draw');
    assert.equal(terminal.winner, null);
    assert.equal(terminal.winningLine, null);
  });

  it('applies move successfully and toggles turn', () => {
    const state = createInitialState();
    const res = applyMove(state, 4, PLAYER_HUMAN);
    assert.equal(res.success, true);
    assert.equal(res.state.board[4], 'X');
    assert.equal(res.state.currentTurn, PLAYER_AI);
    assert.equal(res.state.status, 'in_progress');
  });

  it('rejects move on occupied cell', () => {
    const state = createInitialState();
    const res1 = applyMove(state, 0, PLAYER_HUMAN);
    assert.equal(res1.success, true);
    const res2 = applyMove(res1.state, 0, PLAYER_AI);
    assert.equal(res2.success, false);
    assert.equal(res2.reason, 'Cell is already occupied');
  });

  it('rejects move when not player turn', () => {
    const state = createInitialState();
    const res = applyMove(state, 0, PLAYER_AI);
    assert.equal(res.success, false);
    assert.match(res.reason, /Not player O's turn/);
  });

  it('rejects move on out of bounds indices', () => {
    const state = createInitialState();
    const resLow = applyMove(state, -1, PLAYER_HUMAN);
    assert.equal(resLow.success, false);
    const resHigh = applyMove(state, 9, PLAYER_HUMAN);
    assert.equal(resHigh.success, false);
    const resFloat = applyMove(state, 1.5, PLAYER_HUMAN);
    assert.equal(resFloat.success, false);
  });

  it('rejects move when game is already finished', () => {
    const wonBoard = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null
    ];
    const wonState = {
      board: wonBoard,
      currentTurn: PLAYER_AI,
      status: 'won',
      winner: 'X',
      winningLine: [0, 1, 2],
      difficulty: 'medium'
    };
    const res = applyMove(wonState, 5, PLAYER_AI);
    assert.equal(res.success, false);
    assert.equal(res.reason, 'Game is already finished');
  });
});
