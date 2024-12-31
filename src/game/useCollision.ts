import { Point, Snake } from '../types/snake';
import { Food } from '../types/food';
import { BASE_GRID_SIZE } from '../config/constants';

export const useCollision = (wallCollision: boolean = false) => {
  const checkWallCollision = (point: Point): boolean => {
    if (!wallCollision) return false;
    return point.x < 0 || point.x >= BASE_GRID_SIZE || point.y < 0 || point.y >= BASE_GRID_SIZE;
  };

  const checkFoodCollision = (snake: Snake, food: Food | null): boolean => {
    if (!food) return false;
    const head = snake.body[0];
    return head.x === food.position.x && head.y === food.position.y;
  };

  const checkSelfCollision = (snake: Snake): boolean => {
    const head = snake.body[0];
    return snake.body.slice(1).some(segment => 
      segment.x === head.x && segment.y === head.y
    );
  };

  const isPointOccupied = (point: Point, snake: Snake): boolean => {
    return snake.body.some(segment => 
      segment.x === point.x && segment.y === point.y
    );
  };

  return {
    checkWallCollision,
    checkFoodCollision,
    checkSelfCollision,
    isPointOccupied
  };
};