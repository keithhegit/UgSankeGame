export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT'
}

export enum Difficulty {
  Casual = 'CASUAL',
  Hard = 'HARD',
  Hell = 'HELL',
  Og = 'OG'
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  direction: Direction;
  food: Position;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  obstacles: Position[];
}