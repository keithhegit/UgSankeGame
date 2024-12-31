import { useState, useCallback } from 'react';
import { Obstacle } from '../types/obstacle';
import { Point } from '../types/snake';
import { BASE_GRID_SIZE, OBSTACLE_INTERVAL, MAX_OBSTACLES } from '../config/constants';

export const useObstacles = (
  isPositionOccupied: (point: Point) => boolean
) => {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  const generateObstacle = useCallback(() => {
    if (obstacles.length >= MAX_OBSTACLES) return;

    let newObstacle: Obstacle;
    do {
      newObstacle = {
        position: {
          x: Math.floor(Math.random() * BASE_GRID_SIZE),
          y: Math.floor(Math.random() * BASE_GRID_SIZE)
        }
      };
    } while (
      isPositionOccupied(newObstacle.position) ||
      obstacles.some(o => 
        o.position.x === newObstacle.position.x && 
        o.position.y === newObstacle.position.y
      )
    );

    setObstacles(current => [...current, newObstacle]);
  }, [obstacles, isPositionOccupied]);

  const startObstacleGeneration = useCallback(() => {
    const interval = setInterval(generateObstacle, OBSTACLE_INTERVAL);
    return () => clearInterval(interval);
  }, [generateObstacle]);

  const checkObstacleCollision = useCallback((point: Point): boolean => {
    return obstacles.some(obstacle => 
      obstacle.position.x === point.x && 
      obstacle.position.y === point.y
    );
  }, [obstacles]);

  const resetObstacles = useCallback(() => {
    setObstacles([]);
  }, []);

  return {
    obstacles,
    checkObstacleCollision,
    startObstacleGeneration,
    resetObstacles
  };
};