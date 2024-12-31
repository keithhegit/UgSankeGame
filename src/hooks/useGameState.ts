import { useState } from 'react';
import { Direction, GameState, Position } from '../types/game';

const BOARD_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;

function generateInitialSnake(): Position[] {
  return Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
    x: Math.floor(BOARD_SIZE / 2) - i,
    y: Math.floor(BOARD_SIZE / 2),
  }));
}

function generateFood(occupiedPositions: Position[]): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (
    occupiedPositions.some(pos => pos.x === food.x && pos.y === food.y)
  );
  return food;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    snake: generateInitialSnake(),
    direction: Direction.Right,
    food: generateFood([]),
    score: 0,
    isGameOver: false,
    isPaused: false,
    obstacles: [],
  });

  return {
    gameState,
    setGameState,
  };
}