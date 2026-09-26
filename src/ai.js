/**
 * AI Logic for Tris (Tic-Tac-Toe)
 */

import {
  PLAYER_HUMAN,
  PLAYER_AI,
  DIFFICULTY_EASY,
  DIFFICULTY_MEDIUM,
  DIFFICULTY_HARD,
  getAvailableMoves,
  checkTerminal,
} from './engine.js';

/**
 * Minimax algorithm for Tic-Tac-Toe
 * @param {Array<string|null>} board
 * @param {number} depth
 * @param {boolean} isMaximizing
 * @returns {number} evaluated score
 */
function minimax(board, depth, isMaximizing) {
  const terminal = checkTerminal(board);
  if (terminal.status === 'won') {
    if (terminal.winner === PLAYER_AI) {
      return 10 - depth;
    } else {
      return depth - 10;
    }
  }
  if (terminal.status === 'draw') {
    return 0;
  }

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of moves) {
      board[move] = PLAYER_AI;
      const score = minimax(board, depth + 1, false);
      board[move] = null;
      if (score > bestScore) {
        bestScore = score;
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of moves) {
      board[move] = PLAYER_HUMAN;
      const score = minimax(board, depth + 1, true);
      board[move] = null;
      if (score < bestScore) {
        bestScore = score;
      }
    }
    return bestScore;
  }
}

/**
 * Computes best move for AI using Minimax
 * @param {Array<string|null>} board
 * @returns {number}
 */
export function getBestMoveMinimax(board) {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) return -1;

  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    board[move] = PLAYER_AI;
    const score = minimax(board, 0, false);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Calculates AI move according to selected difficulty.
 * @param {Array<string|null>} board
 * @param {string} difficulty
 * @param {Function} [randomFn=Math.random]
 * @returns {number} selected cell index, or -1 if no moves
 */
export function getAiMove(board, difficulty = DIFFICULTY_MEDIUM, randomFn = Math.random) {
  const available = getAvailableMoves(board);
  if (available.length === 0) {
    return -1;
  }

  // EASY
  if (difficulty === DIFFICULTY_EASY) {
    const randomIndex = Math.floor(randomFn() * available.length);
    return available[randomIndex];
  }

  // MEDIUM
  if (difficulty === DIFFICULTY_MEDIUM) {
    const tempBoard = [...board];

    // 1. Immediate win for O
    for (const move of available) {
      tempBoard[move] = PLAYER_AI;
      if (checkTerminal(tempBoard).winner === PLAYER_AI) {
        return move;
      }
      tempBoard[move] = null;
    }

    // 2. Immediate block for X
    for (const move of available) {
      tempBoard[move] = PLAYER_HUMAN;
      if (checkTerminal(tempBoard).winner === PLAYER_HUMAN) {
        return move;
      }
      tempBoard[move] = null;
    }

    // 3. Fallback: random available move or first available
    const fallbackIndex = Math.floor(randomFn() * available.length);
    return available[fallbackIndex];
  }

  // HARD (Minimax)
  if (difficulty === DIFFICULTY_HARD) {
    const tempBoard = [...board];
    return getBestMoveMinimax(tempBoard);
  }

  return available[0];
}
