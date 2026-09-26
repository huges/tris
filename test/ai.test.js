import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAYER_HUMAN,
  PLAYER_AI,
  DIFFICULTY_EASY,
  DIFFICULTY_MEDIUM,
  DIFFICULTY_HARD,
  createInitialState,
  applyMove,
  checkTerminal,
  getAvailableMoves,
} from '../src/engine.js';
import { getAiMove } from '../src/ai.js';

describe('AI Engine', () => {
  describe('Easy difficulty', () => {
    it('picks an available move randomly', () => {
      const board = ['X', 'O', 'X', 'O', 'X', null, null, null, null];
      const move = getAiMove(board, DIFFICULTY_EASY);
      assert.ok([5, 6, 7, 8].includes(move));
    });
  });

  describe('Medium difficulty', () => {
    it('prioritizes immediate win for O over blocking X', () => {
      // O can win at index 2 (row 0: O, O, null)
      // X threatens win at index 8 (col 2: X, X, null)
      const board = [
        'O', 'O', null, // 0, 1, 2
        null, 'X', null, // 3, 4, 5
        'X', null, null  // 6, 7, 8
      ];
      const move = getAiMove(board, DIFFICULTY_MEDIUM);
      assert.equal(move, 2, 'O should take immediate winning move at index 2');
    });

    it('blocks immediate win for X when O cannot win immediately', () => {
      // X has 0 and 1, threatens 2
      // O has 4
      const board = [
        'X', 'X', null,
        null, 'O', null,
        null, null, null,
      ];
      const move = getAiMove(board, DIFFICULTY_MEDIUM);
      assert.equal(move, 2, 'O should block X winning move at index 2');
    });

    it('picks a valid available move when no immediate win or block exists', () => {
      const board = [
        'X', null, null,
        null, null, null,
        null, null, null,
      ];
      const move = getAiMove(board, DIFFICULTY_MEDIUM);
      assert.notEqual(move, 0);
      assert.ok(move >= 1 && move <= 8);
    });
  });

  describe('Hard difficulty (Minimax)', () => {
    it('takes immediate win if presented', () => {
      const board = [
        'O', 'O', null,
        'X', 'X', null,
        null, null, null,
      ];
      const move = getAiMove(board, DIFFICULTY_HARD);
      assert.equal(move, 2);
    });

    it('blocks immediate threat if unable to win immediately', () => {
      const board = [
        'X', 'X', null,
        'O', null, null,
        null, null, null,
      ];
      const move = getAiMove(board, DIFFICULTY_HARD);
      assert.equal(move, 2);
    });

    /**
     * Exhaustive simulation CA-4:
     * Simulate the complete game tree where X plays every possible legal move,
     * and O plays getAiMove(..., DIFFICULTY_HARD).
     * In NO branch must X ever win (O must never lose).
     */
    it('guarantees O never loses against all legal human moves (exhaustive tree)', () => {
      let gamesExplored = 0;

      function simulate(state) {
        if (state.status !== 'in_progress') {
          gamesExplored++;
          assert.notEqual(state.winner, PLAYER_HUMAN, `Minimax lost on board: ${JSON.stringify(state.board)}`);
          return;
        }

        if (state.currentTurn === PLAYER_HUMAN) {
          const moves = getAvailableMoves(state.board);
          for (const move of moves) {
            const next = applyMove(state, move, PLAYER_HUMAN);
            assert.equal(next.success, true);
            simulate(next.state);
          }
        } else {
          const aiMove = getAiMove(state.board, DIFFICULTY_HARD);
          assert.ok(aiMove >= 0, 'AI must have a valid move');
          const next = applyMove(state, aiMove, PLAYER_AI);
          assert.equal(next.success, true);
          simulate(next.state);
        }
      }

      const initialState = createInitialState(DIFFICULTY_HARD);
      simulate(initialState);

      assert.ok(gamesExplored > 0, `Expected games explored, got ${gamesExplored}`);
    });
  });
});
