import { create } from 'zustand';
import { Direction, Position } from '../types/game';
import { BOARD_SIZE } from '../constants';

const INITIAL_SNAKE_LENGTH = 3;

/**
 * 生成初始蛇的位置
 */
function generateInitialSnake(): Position[] {
  return Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
    x: Math.floor(BOARD_SIZE / 2) - i,
    y: Math.floor(BOARD_SIZE / 2),
  }));
}

/**
 * 生成食物位置
 */
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

/**
 * 检查是否碰撞
 */
function checkCollision(head: Position, body: Position[]): boolean {
  // 检查是否撞到自己
  return body.some((segment, index) => {
    if (index === 0) return false;
    return segment.x === head.x && segment.y === head.y;
  });
}

/**
 * 检查是否撞墙
 */
function checkWallCollision(position: Position): boolean {
  return (
    position.x < 0 ||
    position.x >= BOARD_SIZE ||
    position.y < 0 ||
    position.y >= BOARD_SIZE
  );
}

interface GameState {
  snake: Position[];
  direction: Direction;
  food: Position;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  obstacles: Position[];
  timeLeft: number;
  move: () => void;
  setDirection: (direction: Direction) => void;
  restartGame: () => void;
  togglePause: () => void;
  addObstacle: (position: Position) => void;
  setTimeLeft: (time: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // 初始状态
  snake: generateInitialSnake(),
  direction: Direction.Right,
  food: generateFood(generateInitialSnake()),
  score: 0,
  isGameOver: false,
  isPaused: false,
  obstacles: [],
  timeLeft: 60,

  // 移动蛇
  move: () => {
    const { snake, direction, food, obstacles, isGameOver, isPaused } = get();
    
    if (isGameOver || isPaused) return;

    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
      case Direction.Up:
        head.y -= 1;
        break;
      case Direction.Down:
        head.y += 1;
        break;
      case Direction.Left:
        head.x -= 1;
        break;
      case Direction.Right:
        head.x += 1;
        break;
    }

    // 检查碰撞
    if (
      checkWallCollision(head) ||
      checkCollision(head, snake) ||
      obstacles.some(obs => obs.x === head.x && obs.y === head.y)
    ) {
      set({ isGameOver: true });
      return;
    }

    // 移动蛇身
    const newSnake = [head, ...snake];
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
      set(state => ({
        snake: newSnake,
        score: state.score + 10,
        food: generateFood([...newSnake, ...obstacles])
      }));
    } else {
      newSnake.pop(); // 如果没吃到食物，移除尾部
      set({ snake: newSnake });
    }
  },

  // 设置方向
  setDirection: (newDirection: Direction) => {
    const { direction } = get();
    
    // 防止反向移动
    const isOpposite = (
      (newDirection === Direction.Up && direction === Direction.Down) ||
      (newDirection === Direction.Down && direction === Direction.Up) ||
      (newDirection === Direction.Left && direction === Direction.Right) ||
      (newDirection === Direction.Right && direction === Direction.Left)
    );

    if (!isOpposite) {
      set({ direction: newDirection });
    }
  },

  // 重启游戏
  restartGame: () => {
    const initialSnake = generateInitialSnake();
    set({
      snake: initialSnake,
      direction: Direction.Right,
      food: generateFood(initialSnake),
      score: 0,
      isGameOver: false,
      isPaused: false,
      obstacles: [],
      timeLeft: 60
    });
  },

  // 暂停/继续游戏
  togglePause: () => {
    set(state => ({ isPaused: !state.isPaused }));
  },

  // 添加障碍物
  addObstacle: (position: Position) => {
    set(state => ({
      obstacles: [...state.obstacles, position]
    }));
  },

  // 设置剩余时间
  setTimeLeft: (time: number) => {
    set({ timeLeft: time });
  }
})); 