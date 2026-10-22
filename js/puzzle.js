/**
 * Core 8-Puzzle Domain Logic & Utilities
 * AI Search Algorithm Visualizer
 */

class PuzzleState {
  constructor(board, parent = null, move = null, depth = 0, cost = 0) {
    // board is an array of length 9: numbers 1-8 and 0 (blank)
    this.board = Array.isArray(board) ? [...board] : [];
    this.parent = parent;
    this.move = move; // 'UP', 'DOWN', 'LEFT', 'RIGHT' (movement of blank tile)
    this.depth = depth; // g(n) in uniform cost
    this.cost = cost; // total path cost g(n)
    this.h = 0; // heuristic value h(n)
    this.f = 0; // evaluation function f(n)
    this.id = this.board.join(',');
  }

  get blankIndex() {
    return this.board.indexOf(0);
  }

  // Row and Column of blank tile (0-indexed)
  get blankRow() {
    return Math.floor(this.blankIndex / 3);
  }

  get blankCol() {
    return this.blankIndex % 3;
  }

  equals(otherState) {
    if (!otherState) return false;
    for (let i = 0; i < 9; i++) {
      if (this.board[i] !== otherState.board[i]) return false;
    }
    return true;
  }
}

const PuzzleUtil = {
  // Default goal state according to assignment sample
  DEFAULT_GOAL: [1, 2, 3, 8, 0, 4, 7, 6, 5],
  
  // Standard standard 1-8 sequential goal state option
  STANDARD_GOAL: [1, 2, 3, 4, 5, 6, 7, 8, 0],

  // Sample initial state from assignment document (page 3)
  SAMPLE_INITIAL: [2, 8, 3, 1, 6, 4, 7, 0, 5],

  /**
   * Count inversions in a 9-element array (ignoring 0/blank)
   */
  countInversions(board) {
    let inversions = 0;
    const tiles = board.filter(t => t !== 0);
    for (let i = 0; i < tiles.length - 1; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i] > tiles[j]) {
          inversions++;
        }
      }
    }
    return inversions;
  },

  /**
   * Validates if target goal state is reachable from initial state
   * On a 3x3 board, reachable if and only if both inversion counts have the same parity
   */
  isSolvable(initialBoard, goalBoard = PuzzleUtil.DEFAULT_GOAL) {
    const initialInv = this.countInversions(initialBoard);
    const goalInv = this.countInversions(goalBoard);
    return (initialInv % 2) === (goalInv % 2);
  },

  /**
   * Generates all valid successor states by sliding the blank tile
   */
  getSuccessors(state) {
    const successors = [];
    const blankIdx = state.blankIndex;
    const row = Math.floor(blankIdx / 3);
    const col = blankIdx % 3;

    // Movement directions: Up, Down, Left, Right
    const moves = [
      { name: 'UP', r: row - 1, c: col },
      { name: 'DOWN', r: row + 1, c: col },
      { name: 'LEFT', r: row, c: col - 1 },
      { name: 'RIGHT', r: row, c: col + 1 }
    ];

    for (const m of moves) {
      if (m.r >= 0 && m.r < 3 && m.c >= 0 && m.c < 3) {
        const targetIdx = m.r * 3 + m.c;
        const newBoard = [...state.board];
        // Swap blank with target tile
        newBoard[blankIdx] = newBoard[targetIdx];
        newBoard[targetIdx] = 0;

        const nextState = new PuzzleState(
          newBoard,
          state,
          m.name,
          state.depth + 1,
          state.cost + 1
        );
        successors.push(nextState);
      }
    }

    return successors;
  },

  /**
   * Heuristic 1: Misplaced Tiles
   * Count of non-blank tiles not in their goal position
   */
  hMisplaced(board, goalBoard) {
    let count = 0;
    for (let i = 0; i < 9; i++) {
      if (board[i] !== 0 && board[i] !== goalBoard[i]) {
        count++;
      }
    }
    return count;
  },

  /**
   * Heuristic 2: Manhattan Distance
   * Sum of horizontal and vertical distances from goal positions
   */
  hManhattan(board, goalBoard) {
    let distance = 0;
    for (let i = 0; i < 9; i++) {
      const tile = board[i];
      if (tile !== 0) {
        const goalIdx = goalBoard.indexOf(tile);
        const currR = Math.floor(i / 3);
        const currC = i % 3;
        const goalR = Math.floor(goalIdx / 3);
        const goalC = goalIdx % 3;
        distance += Math.abs(currR - goalR) + Math.abs(currC - goalC);
      }
    }
    return distance;
  },

  /**
   * Method 2: Generate a random solvable puzzle from a goal state
   * Solvability is guaranteed by walking randomly backward from goal
   */
  generateRandomSolvable(goalBoard = PuzzleUtil.DEFAULT_GOAL, shuffleSteps = 28) {
    let current = new PuzzleState([...goalBoard]);
    let lastMove = null;

    for (let s = 0; s < shuffleSteps; s++) {
      const neighbors = this.getSuccessors(current);
      // Avoid immediate backtrack if possible
      const filtered = neighbors.filter(n => {
        if (!lastMove) return true;
        if (lastMove === 'UP' && n.move === 'DOWN') return false;
        if (lastMove === 'DOWN' && n.move === 'UP') return false;
        if (lastMove === 'LEFT' && n.move === 'RIGHT') return false;
        if (lastMove === 'RIGHT' && n.move === 'LEFT') return false;
        return true;
      });

      const pool = filtered.length > 0 ? filtered : neighbors;
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      lastMove = chosen.move;
      current = new PuzzleState(chosen.board);
    }

    // Ensure it's not accidentally already solved
    if (current.board.every((val, idx) => val === goalBoard[idx])) {
      return this.generateRandomSolvable(goalBoard, shuffleSteps + 5);
    }

    return current.board;
  },

  /**
   * Validate and parse 9 values input (allows numbers 1-8 and 0 or '_')
   */
  parseInput(valuesArray) {
    if (!valuesArray || valuesArray.length !== 9) {
      return { valid: false, error: 'Puzzle must contain exactly 9 tiles.' };
    }

    const parsed = valuesArray.map(v => {
      const s = String(v).trim();
      if (s === '' || s === '_' || s === '0') return 0;
      const num = parseInt(s, 10);
      return isNaN(num) ? -1 : num;
    });

    // Check bounds 0-8
    for (const val of parsed) {
      if (val < 0 || val > 8) {
        return { valid: false, error: 'Tile values must be between 1 and 8, or blank (_ / 0).' };
      }
    }

    // Check unique
    const set = new Set(parsed);
    if (set.size !== 9) {
      return { valid: false, error: 'Duplicate numbers detected! Each number from 1 to 8 and one blank must appear once.' };
    }

    return { valid: true, board: parsed };
  },

  /**
   * Trace solution path from goal node back to root
   */
  extractPath(endNode) {
    const path = [];
    let curr = endNode;
    while (curr) {
      path.unshift({
        board: [...curr.board],
        move: curr.move,
        depth: curr.depth,
        cost: curr.cost,
        h: curr.h,
        f: curr.f
      });
      curr = curr.parent;
    }
    return path;
  }
};

window.PuzzleState = PuzzleState;
window.PuzzleUtil = PuzzleUtil;
