import { useState, useCallback } from 'react';
import { Food } from '../types/food';
import { Point } from '../types/snake';
import { BASE_GRID_SIZE } from '../config/constants';

export const useFood = (
  isOccupied: (point: Point) => boolean,
  timeout?: number
) => {
  const [food, setFood] = useState<Food | null>(null);

  const generateFood = useCallback(() => {
    let newFood: Food;
    do {
      newFood = {
        position: {
          x: Math.floor(Math.random() * BASE_GRID_SIZE),
          y: Math.floor(Math.random() * BASE_GRID_SIZE)
        },
        timeLeft: timeout
      };
    } while (isOccupied(newFood.position));
    
    setFood(newFood);
  }, [isOccupied, timeout]);

  const removeFood = useCallback(() => {
    setFood(null);
  }, []);

  const updateFoodTimer = useCallback((deltaTime: number) => {
    if (!food || food.timeLeft === undefined) return;

    setFood(currentFood => {
      if (!currentFood || currentFood.timeLeft === undefined) return currentFood;
      
      const newTimeLeft = currentFood.timeLeft - deltaTime;
      if (newTimeLeft <= 0) {
        return null;
      }
      
      return {
        ...currentFood,
        timeLeft: newTimeLeft
      };
    });
  }, [food]);

  return {
    food,
    generateFood,
    removeFood,
    updateFoodTimer
  };
};