import { BoardState, Player, Position, BOARD_SIZE } from '../types';

// Helper to create an empty board
export const createEmptyBoard = (size: number = BOARD_SIZE): BoardState => {
  return Array(size).fill(null).map(() => Array(size).fill(Player.None));
};

// Deep copy the board
export const copyBoard = (board: BoardState): BoardState => {
  return board.map(row => [...row]);
};

// Get liberties and group for a stone at (r, c)
export const getLiberties = (board: BoardState, r: number, c: number) => {
  const color = board[r][c];
  if (color === Player.None) return { liberties: new Set<string>(), group: [] };

  const stack: Position[] = [{ r, c }];
  const visited = new Set<string>();
  const group: Position[] = [];
  const liberties = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = `${current.r},${current.c}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    group.push(current);

    const neighbors = [
      { r: current.r - 1, c: current.c },
      { r: current.r + 1, c: current.c },
      { r: current.r, c: current.c - 1 },
      { r: current.r, c: current.c + 1 },
    ];

    for (const n of neighbors) {
      if (n.r >= 0 && n.r < BOARD_SIZE && n.c >= 0 && n.c < BOARD_SIZE) {
        const neighborColor = board[n.r][n.c];
        if (neighborColor === Player.None) {
          liberties.add(`${n.r},${n.c}`);
        } else if (neighborColor === color && !visited.has(`${n.r},${n.c}`)) {
          stack.push(n);
        }
      }
    }
  }

  return { liberties, group };
};

// Check if a move is valid
export const isValidMove = (
  board: BoardState, 
  r: number, 
  c: number, 
  currentPlayer: Player, 
  history: string[] // Array of JSON stringified boards
): boolean => {
  if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
  if (board[r][c] !== Player.None) return false;

  const tempBoard = copyBoard(board);
  tempBoard[r][c] = currentPlayer;
  const opponent = currentPlayer === Player.Black ? Player.White : Player.Black;

  // Check captures
  let capturesFound = false;
  const neighbors = [
    { r: r - 1, c: c },
    { r: r + 1, c: c },
    { r: r, c: c - 1 },
    { r: r, c: c + 1 },
  ];

  const capturedStones: Position[] = [];

  for (const n of neighbors) {
    if (n.r >= 0 && n.r < BOARD_SIZE && n.c >= 0 && n.c < BOARD_SIZE) {
      if (tempBoard[n.r][n.c] === opponent) {
        const { liberties, group } = getLiberties(tempBoard, n.r, n.c);
        if (liberties.size === 0) {
          capturesFound = true;
          group.forEach(g => capturedStones.push(g));
        }
      }
    }
  }

  // Remove captures
  capturedStones.forEach(pos => {
    tempBoard[pos.r][pos.c] = Player.None;
  });

  // Check Suicide
  const { liberties } = getLiberties(tempBoard, r, c);
  if (liberties.size === 0) return false;

  // Check Ko (compare stringified board state)
  const tempBoardStr = JSON.stringify(tempBoard);
  if (history.length > 0 && history[history.length - 1] === tempBoardStr) {
    return false;
  }

  return true;
};

// Execute a move (assumes valid check passed usually, but we can double check)
export const placeStone = (
  board: BoardState, 
  r: number, 
  c: number, 
  currentPlayer: Player
): { newBoard: BoardState, captured: number } => {
  const newBoard = copyBoard(board);
  newBoard[r][c] = currentPlayer;
  const opponent = currentPlayer === Player.Black ? Player.White : Player.Black;

  let capturedCount = 0;
  const neighbors = [
    { r: r - 1, c: c },
    { r: r + 1, c: c },
    { r: r, c: c - 1 },
    { r: r, c: c + 1 },
  ];

  // We need to check all neighbors for captures
  for (const n of neighbors) {
    if (n.r >= 0 && n.r < BOARD_SIZE && n.c >= 0 && n.c < BOARD_SIZE) {
      if (newBoard[n.r][n.c] === opponent) {
        const { liberties, group } = getLiberties(newBoard, n.r, n.c);
        if (liberties.size === 0) {
          group.forEach(g => {
            newBoard[g.r][g.c] = Player.None;
            capturedCount++;
          });
        }
      }
    }
  }

  return { newBoard, captured: capturedCount };
};

// Simplified territory estimation (Flood Fill)
export const estimateTerritory = (board: BoardState) => {
  let bTerritory = 0;
  let wTerritory = 0;
  const visited = new Set<string>();

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const key = `${r},${c}`;
      if (board[r][c] === Player.None && !visited.has(key)) {
        const stack = [{ r, c }];
        const region: Position[] = [];
        const borders = new Set<Player>();
        
        // Flood fill empty region
        while (stack.length > 0) {
          const curr = stack.pop()!;
          const currKey = `${curr.r},${curr.c}`;
          
          if (visited.has(currKey)) continue;
          visited.add(currKey);
          region.push(curr);

          const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          for (const [dr, dc] of dirs) {
            const nr = curr.r + dr;
            const nc = curr.c + dc;
            
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
              if (board[nr][nc] === Player.None) {
                stack.push({ r: nr, c: nc });
              } else {
                borders.add(board[nr][nc]);
              }
            }
          }
        }

        // Determine ownership
        if (borders.size === 1) {
          const owner = Array.from(borders)[0];
          if (owner === Player.Black) bTerritory += region.length;
          else if (owner === Player.White) wTerritory += region.length;
        }
      }
    }
  }

  return { [Player.Black]: bTerritory, [Player.White]: wTerritory };
};

// AI Logic (Random valid move)
export const getAIMove = (board: BoardState, player: Player, history: string[]): Position | null => {
  const possibleMoves: Position[] = [];
  
  // Collect all valid moves
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isValidMove(board, r, c, player, history)) {
        possibleMoves.push({ r, c });
      }
    }
  }

  if (possibleMoves.length === 0) return null; // Pass

  // Basic Heuristic: Prefer center or near existing stones?
  // For now, pure random as per original Python code structure, 
  // but let's try to verify if it captures something to be slightly smarter? 
  // (Keeping it simple to match "realistic game" request without overengineering AI)
  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
};
