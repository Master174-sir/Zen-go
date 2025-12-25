export enum Player {
  None = 0,
  Black = 1,
  White = 2,
}

export type BoardState = Player[][];

export interface Position {
  r: number;
  c: number;
}

export interface GameStats {
  prisoners: {
    [Player.Black]: number;
    [Player.White]: number;
  };
  score: {
    [Player.Black]: number;
    [Player.White]: number;
  };
  territory: {
    [Player.Black]: number;
    [Player.White]: number;
  };
}

export const BOARD_SIZE = 9;
export const KOMI = 0.5;