/**
 * Game Engine for Tris (Tic-Tac-Toe)
 * Pure logic, no DOM dependencies.
 */

export const PLAYER_HUMAN = 'X';
export const PLAYER_AI = 'O';

export const DIFFICULTY_EASY = 'easy';
export const DIFFICULTY_MEDIUM = 'medium';
export const DIFFICULTY_HARD = 'hard';

export const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Creates the initial game state.
 * @param {string} [difficulty='medium']
 * @returns {object} Initial GameState
 */
export function createInitialState(difficulty = DIFFICULTY_MEDIUM) {
  const validDifficulties = [DIFFICULTY_EASY, DIFFICULTY_MEDIUM, DIFFICULTY_HARD];
  const safeDifficulty = validDifficulties.includes(difficulty) ? difficulty : DIFFICULTY_MEDIUM;

  return {
    board: Array(9).fill(null),
    currentTurn: PLAYER_HUMAN,
    status: 'in_progress', // 'in_progress' | 'won' | 'draw'
    winner: null,          // null | 'X' | 'O'
    winningLine: null,     // null | [number, number, number]
    difficulty: safeDifficulty,
  };
}

/**
 * Returns indices of currently empty board cells.
 * @param {Array<string|null>} board
 * @returns {number[]}
 */
export function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      moves.push(i);
    }
  }
  return moves;
}

/**
 * Checks if the board has reached a terminal state (win or draw).
 * @param {Array<string|null>} board
 * @returns {{ status: string, winner: string|null, winningLine: number[]|null }}
 */
export function checkTerminal(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      return {
        status: 'won',
        winner: board[a],
        winningLine: [...line],
      };
    }
  }

  if (getAvailableMoves(board).length === 0) {
    return {
      status: 'draw',
      winner: null,
      winningLine: null,
    };
  }

  return {
    status: 'in_progress',
    winner: null,
    winningLine: null,
  };
}

/**
 * Applies a player's move to the game state.
 * Validates turn, index range, cell occupancy, and game status.
 * @param {object} state Current GameState
 * @param {number} index Cell index (0-8)
 * @param {string} player 'X' or 'O'
 * @returns {{ success: boolean, reason?: string, state: object }}
 */
export function applyMove(state, index, player) {
  if (state.status !== 'in_progress') {
    return { success: false, reason: 'Game is already finished', state };
  }

  if (player !== state.currentTurn) {
    return { success: false, reason: `Not player ${player}'s turn`, state };
  }

  if (!Number.isInteger(index) || index < 0 || index > 8) {
    return { success: false, reason: 'Index out of bounds', state };
  }

  if (state.board[index] !== null) {
    return { success: false, reason: 'Cell is already occupied', state };
  }

  const nextBoard = [...state.board];
  nextBoard[index] = player;

  const terminal = checkTerminal(nextBoard);

  let nextTurn = state.currentTurn;
  if (terminal.status === 'in_progress') {
    nextTurn = player === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
  }

  const nextState = {
    board: nextBoard,
    currentTurn: nextTurn,
    status: terminal.status,
    winner: terminal.winner,
    winningLine: terminal.winningLine,
    difficulty: state.difficulty,
  };

  return { success: true, state: nextState };
}
