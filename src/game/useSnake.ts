import { useState, useCallback } from 'react';
import { Direction, Snake } from '../types/snake';
import { BASE_GRID_SIZE, INITIAL_SNAKE_LENGTH } from '../config/constants';

const INITIAL_SNAKE: Snake = {
  body: Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({ 
    x: Math.floor(BASE_GRID_SIZE / 4) - i, 
    y: Math.floor(BASE_GRID_SIZE / 2) 
  })),
  direction: Direction.RIGHT,
  nextDirection: Direction.RIGHT,
};

export const useSnake = () => {
  const [snake, setSnake] = useState<Snake>(INITIAL_SNAKE);

  const moveSnake = useCallback(() => {
    setSnake(currentSnake => {
      const head = currentSnake.body[0];
      const newHead = { ...head };

      switch (currentSnake.nextDirection) {
        case Direction.UP:
          newHead.y = (newHead.y - 1 + BASE_GRID_SIZE) % BASE_GRID_SIZE;
          break;
        case Direction.DOWN:
          newHead.y = (newHead.y + 1) % BASE_GRID_SIZE;
          break;
        case Direction.LEFT:
          newHead.x = (newHead.x - 1 + BASE_GRID_SIZE) % BASE_GRID_SIZE;
          break;
        case Direction.RIGHT:
          newHead.x = (newHead.x + 1) % BASE_GRID_SIZE;
          break;
      }

      const newBody = [newHead, ...currentSnake.body.slice(0, -1)];
      
      return {
        body: newBody,
        direction: currentSnake.nextDirection,
        nextDirection: currentSnake.nextDirection,
      };
    });
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    setSnake(currentSnake => {
      const opposites = {
        [Direction.UP]: Direction.DOWN,
        [Direction.DOWN]: Direction.UP,
        [Direction.LEFT]: Direction.RIGHT,
        [Direction.RIGHT]: Direction.LEFT,
      };

      if (opposites[newDirection] === currentSnake.direction) {
        return currentSnake;
      }

      return {
        ...currentSnake,
        nextDirection: newDirection,
      };
    });
  }, []);

  const grow = useCallback(() => {
    setSnake(currentSnake => ({
      ...currentSnake,
      body: [...currentSnake.body, { ...currentSnake.body[currentSnake.body.length - 1] }],
    }));
  }, []);

  return {
    snake,
    moveSnake,
    changeDirection,
    grow,
  };
};