import React, { useEffect, useRef, useState } from 'react';
import { Direction, GameState, Position } from '../types/game';
import { imageLoader, SnakeImages } from '../utils/imageLoader';
import { VirtualJoystick } from './VirtualJoystick';
import { BOARD_SIZE, CELL_SIZE } from '../constants';
import { audioManager } from '../utils/audioManager';
import { supabase } from '../lib/supabase';

interface GameBoardProps {
  difficulty: string;
  onGameEnd: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ difficulty, onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<SnakeImages | null>(null);
  const [timeLeft, setTimeLeft] = useState(() => {
    switch (difficulty) {
      case 'CASUAL': return 30;
      case 'HARD': return 60;
      case 'HELL': return Infinity;
      default: return 60;
    }
  });
  const [lives, setLives] = useState(1);
  const [gameState, setGameState] = useState<GameState>({
    snake: [
      { x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) },
      { x: Math.floor(BOARD_SIZE / 2) - 1, y: Math.floor(BOARD_SIZE / 2) },
      { x: Math.floor(BOARD_SIZE / 2) - 2, y: Math.floor(BOARD_SIZE / 2) }
    ],
    direction: Direction.Right,
    food: { x: Math.floor(Math.random() * BOARD_SIZE), y: Math.floor(Math.random() * BOARD_SIZE) },
    score: 0,
    isGameOver: false,
    isPaused: false,
    obstacles: []
  });

  const [maxObstacles, setMaxObstacles] = useState(() => {
    switch (difficulty) {
      case 'CASUAL': return 0;
      case 'HARD': return 12;
      case 'HELL': return 30;
      default: return 0;
    }
  });

  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 生成障碍物的位置
  const generateObstacle = (snake: Position[], food: Position, obstacles: Position[]): Position | null => {
    // 休闲模式不生成障碍物
    if (difficulty === 'CASUAL') return null;

    // 如果已达到最大障碍物数量，不生成
    if (obstacles.length >= maxObstacles) return null;

    // 尝试20次生成位置
    for (let i = 0; i < 20; i++) {
      const obstacle = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };

      // 检查是否与蛇身重叠
      const isOnSnake = snake.some(segment => 
        segment.x === obstacle.x && segment.y === obstacle.y
      );

      // 检查是否与食物重叠
      const isOnFood = food.x === obstacle.x && food.y === obstacle.y;

      // 检查是否与其他障碍物重叠
      const isOnObstacle = obstacles.some(obs => 
        obs.x === obstacle.x && obs.y === obstacle.y
      );

      // 检查是否太靠近蛇头
      const snakeHead = snake[0];
      const isTooCloseToHead = Math.abs(obstacle.x - snakeHead.x) <= 2 && 
                              Math.abs(obstacle.y - snakeHead.y) <= 2;

      if (!isOnSnake && !isOnFood && !isOnObstacle && !isTooCloseToHead) {
        return obstacle;
      }
    }

    return null;
  };

  // 障碍物生成计时器
  useEffect(() => {
    if (!gameState.isPaused && !gameState.isGameOver && difficulty !== 'CASUAL') {
      const interval = difficulty === 'HELL' ? 4000 : 5000;
      const timer = setInterval(() => {
        // 增加障碍物上限
        setMaxObstacles(prev => {
          const maxLimit = difficulty === 'HELL' ? 30 : 12;
          return Math.min(prev + 1, maxLimit);
        });

        // 生成新障碍物
        const newObstacle = generateObstacle(
          gameState.snake,
          gameState.food,
          gameState.obstacles
        );

        if (newObstacle) {
          setGameState(prev => ({
            ...prev,
            obstacles: [...prev.obstacles, newObstacle]
          }));
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [gameState.isPaused, gameState.isGameOver, difficulty]);

  // 重置游戏时清除障碍物
  const resetGame = () => {
    setMaxObstacles(() => {
      switch (difficulty) {
        case 'CASUAL': return 0;
        case 'HARD': return 12;
        case 'HELL': return 30;
        default: return 0;
      }
    });
    // ... 其他重置逻辑
  };

  // 修改重启游戏按钮的点击处理
  const handleRestart = () => {
    resetGame();
    setTimeLeft(() => {
      switch (difficulty) {
        case 'CASUAL': return 30;
        case 'HARD': return 60;
        case 'HELL': return Infinity;
        default: return 60;
      }
    });
    setLives(1);
    setGameState({
      snake: [
        { x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) },
        { x: Math.floor(BOARD_SIZE / 2) - 1, y: Math.floor(BOARD_SIZE / 2) },
        { x: Math.floor(BOARD_SIZE / 2) - 2, y: Math.floor(BOARD_SIZE / 2) }
      ],
      direction: Direction.Right,
      food: { x: Math.floor(Math.random() * BOARD_SIZE), y: Math.floor(Math.random() * BOARD_SIZE) },
      score: 0,
      isGameOver: false,
      isPaused: false,
      obstacles: []
    });
  };

  // 计时器
  useEffect(() => {
    if (!gameState.isPaused && !gameState.isGameOver && timeLeft !== Infinity) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            audioManager.play('die');
            setGameState(prev => ({ ...prev, isGameOver: true }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.isPaused, gameState.isGameOver]);

  // 加载图片
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages = await imageLoader.loadAllImages();
      setImages(loadedImages);
    };
    loadImages();
  }, []);

  // 移动蛇
  const moveSnake = () => {
    if (gameState.isGameOver || gameState.isPaused) return;

    const newSnake = [...gameState.snake];
    const head = { ...newSnake[0] };

    // 根据方向移动蛇头，允许穿墙
    switch (gameState.direction) {
      case Direction.Up:
        head.y = (head.y - 1 + BOARD_SIZE) % BOARD_SIZE;
        break;
      case Direction.Down:
        head.y = (head.y + 1) % BOARD_SIZE;
        break;
      case Direction.Left:
        head.x = (head.x - 1 + BOARD_SIZE) % BOARD_SIZE;
        break;
      case Direction.Right:
        head.x = (head.x + 1) % BOARD_SIZE;
        break;
    }

    // 检查碰撞（只检查自身和障碍物）
    if (
      newSnake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y) ||
      gameState.obstacles.some(obs => obs.x === head.x && obs.y === head.y)
    ) {
      audioManager.play('die');
      handleCollision();
      return;
    }

    newSnake.unshift(head);

    // 检查是否吃到食物
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
      audioManager.play('eat');
      const newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
      
      // 统一所有难度为1分
      setGameState(prev => ({
        ...prev,
        snake: newSnake,
        food: newFood,
        score: prev.score + 1
      }));
    } else {
      newSnake.pop();
      setGameState(prev => ({
        ...prev,
        snake: newSnake
      }));
    }
  };

  // 游戏循环
  useEffect(() => {
    const gameLoop = setInterval(() => {
      moveSnake();
    }, 200);

    return () => clearInterval(gameLoop);
  }, [gameState]);

  // 获取蛇头图片
  const getHeadImage = (direction: Direction): HTMLImageElement => {
    if (!images) throw new Error('Images not loaded');
    
    // 根据实际移动方向（而不是按键方向）决定蛇头图片
    const head = gameState.snake[0];
    const neck = gameState.snake[1];
    
    // 如果蛇正在转向，保持原来的方向直到实际移动
    if (head && neck) {
      if (head.x === neck.x) {
        // 垂直移动
        return head.y < neck.y ? images.head_up : images.head_down;
      } else {
        // 水平移动
        return head.x < neck.x ? images.head_left : images.head_right;
      }
    }

    // 默认情况下使用当前方向
    switch (direction) {
      case Direction.Up: return images.head_up;
      case Direction.Down: return images.head_down;
      case Direction.Left: return images.head_left;
      case Direction.Right: return images.head_right;
    }
  };

  // 获取蛇身图片
  const getBodyImage = (current: Position, prev: Position, next: Position): HTMLImageElement => {
    if (!images) throw new Error('Images not loaded');

    // 水平移动
    if (prev.y === current.y && current.y === next.y) {
      return images.body_horizontal;
    }
    
    // 垂直移动
    if (prev.x === current.x && current.x === next.x) {
      return images.body_vertical;
    }

    // 顺时针转向
    // 从右到左，按上键
    if (prev.x > current.x && next.y < current.y) {
      return images.body_topright;
    }
    // 从下到上，按右键
    if (prev.y > current.y && next.x > current.x) {
      return images.body_bottomright;
    }
    // 从左到右，按下键
    if (prev.x < current.x && next.y > current.y) {
      return images.body_bottomleft;
    }
    // 从上到下，按右键
    if (prev.y < current.y && next.x > current.x) {
      return images.body_topleft;
    }

    // 逆时针转向
    // 从下向左
    if (prev.y > current.y && next.x < current.x) {
      return images.body_topright;
    }
    // 从左向下
    if (prev.x < current.x && next.y > current.y) {
      return images.body_topleft;
    }
    // 从上向左
    if (prev.y < current.y && next.x < current.x) {
      return images.body_bottomleft;
    }
    // 从左到右，按上键
    if (prev.x < current.x && next.y < current.y) {
      return images.body_topleft;
    }

    // 默认情况
    return images.body_horizontal;
  };

  // 获取蛇尾图片
  const getTailImage = (tail: Position, beforeTail: Position): HTMLImageElement => {
    if (!images) throw new Error('Images not loaded');

    // 根据尾巴和前一个节点的相对位置确定朝向
    if (tail.x === beforeTail.x) {
      // 垂直移动
      return tail.y > beforeTail.y ? images.tail_down : images.tail_up;
    } else {
      // 水平移动
      return tail.x > beforeTail.x ? images.tail_right : images.tail_left;
    }
  };

  // 绘制游戏
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    if (!images) return;

    // 清空画布
    ctx.clearRect(0, 0, BOARD_SIZE * CELL_SIZE, BOARD_SIZE * CELL_SIZE);

    // 绘制棋盘格背景
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        ctx.fillStyle = (i + j) % 2 === 0 ? '#90EE90' : '#7CCD7C'; // 浅绿色和深绿色交替
        ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    // 绘制障碍物
    gameState.obstacles.forEach((obstacle: Position) => {
      ctx.drawImage(
        images.stone,
        obstacle.x * CELL_SIZE,
        obstacle.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });

    // 绘制食物
    ctx.drawImage(
      images.food,
      gameState.food.x * CELL_SIZE,
      gameState.food.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );

    // 绘制蛇
    gameState.snake.forEach((segment: Position, index: number) => {
      let img: HTMLImageElement;

      if (index === 0) {
        // 蛇头
        img = getHeadImage(gameState.direction);
      } else if (index === gameState.snake.length - 1) {
        // 蛇尾
        img = getTailImage(segment, gameState.snake[index - 1]);
      } else {
        // 蛇身
        img = getBodyImage(segment, gameState.snake[index - 1], gameState.snake[index + 1]);
      }

      ctx.drawImage(
        img,
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });

    // 游戏结束或暂停时的遮罩
    if (gameState.isGameOver || gameState.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, BOARD_SIZE * CELL_SIZE, BOARD_SIZE * CELL_SIZE);
    }
  };

  // 渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = () => {
      drawGame(ctx);
      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }, [gameState, images]);

  // 处理暂停/继续
  const togglePause = () => {
    audioManager.play('pause');
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 阻止方向键和空格键的默认行为
      if (
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight' ||
        e.code === 'Space' ||
        e.code === 'KeyW' ||
        e.code === 'KeyS' ||
        e.code === 'KeyA' ||
        e.code === 'KeyD'
      ) {
        e.preventDefault();
      }

      if (gameState.isGameOver) {
        if (e.code === 'Space') {
          audioManager.play('score');
          handleRestart();
        }
        return;
      }

      if (e.code === 'Space') {
        togglePause();
        return;
      }

      if (!gameState.isPaused) {
        const newDirection = (() => {
          switch (e.code) {
            case 'ArrowUp':
            case 'KeyW':
              return Direction.Up;
            case 'ArrowDown':
            case 'KeyS':
              return Direction.Down;
            case 'ArrowLeft':
            case 'KeyA':
              return Direction.Left;
            case 'ArrowRight':
            case 'KeyD':
              return Direction.Right;
            default:
              return null;
          }
        })();

        if (newDirection !== null) {
          const currentDirection = gameState.direction;
          const isOpposite = (
            (newDirection === Direction.Up && currentDirection === Direction.Down) ||
            (newDirection === Direction.Down && currentDirection === Direction.Up) ||
            (newDirection === Direction.Left && currentDirection === Direction.Right) ||
            (newDirection === Direction.Right && currentDirection === Direction.Left)
          );

          if (!isOpposite && newDirection !== currentDirection) {
            audioManager.play('move');  // 只在方向改变时播放转向音效
            setGameState(prev => ({ ...prev, direction: newDirection }));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isGameOver, gameState.isPaused, gameState.direction]);

  // 处理虚拟摇杆方向改变
  const handleDirectionChange = (direction: Direction | null) => {
    if (!gameState.isPaused && !gameState.isGameOver && direction !== null) {
      const currentDirection = gameState.direction;
      const isOpposite = (
        (direction === Direction.Up && currentDirection === Direction.Down) ||
        (direction === Direction.Down && currentDirection === Direction.Up) ||
        (direction === Direction.Left && currentDirection === Direction.Right) ||
        (direction === Direction.Right && currentDirection === Direction.Left)
      );

      if (!isOpposite && direction !== currentDirection) {
        audioManager.play('move');  // 只在方向改变时播放转向音效
        setGameState(prev => ({ ...prev, direction }));
      }
    }
  };

  // 处理游戏结束
  useEffect(() => {
    if (gameState.isGameOver) {
      setShowNameInput(true);
    }
  }, [gameState.isGameOver]);

  // 根据难度设置游戏速度
  useEffect(() => {
    const speeds = {
      'CASUAL': 100,
      'HARD': 75,
      'HELL': 50,
      'OG': 40
    };
    const gameLoop = setInterval(() => {
      moveSnake();
    }, speeds[difficulty as keyof typeof speeds] || 100);

    return () => clearInterval(gameLoop);
  }, [gameState, difficulty]);

  // 处理碰撞
  const handleCollision = () => {
    if (lives > 1) {
      setLives(prev => prev - 1);
      setGameState(prev => ({
        ...prev,
        snake: [
          { x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) },
          { x: Math.floor(BOARD_SIZE / 2) - 1, y: Math.floor(BOARD_SIZE / 2) },
          { x: Math.floor(BOARD_SIZE / 2) - 2, y: Math.floor(BOARD_SIZE / 2) }
        ],
        direction: Direction.Right
      }));
    } else {
      setGameState(prev => ({ ...prev, isGameOver: true }));
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    if (seconds === Infinity) return '∞';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 背景音乐控制
  useEffect(() => {
    const initAndPlayBGM = async () => {
      try {
        await audioManager.init();
        if (!gameState.isGameOver && !gameState.isPaused) {
          await audioManager.startBGM();
        }
      } catch (err) {
        console.warn('Failed to initialize and play BGM:', err);
      }
    };

    initAndPlayBGM();

    return () => audioManager.stopBGM();
  }, [gameState.isGameOver, gameState.isPaused]);

  // 游戏暂停/继续时的音乐控制
  useEffect(() => {
    if (gameState.isPaused) {
      audioManager.stopBGM();
    } else if (!gameState.isGameOver) {
      audioManager.startBGM();
    }
  }, [gameState.isPaused]);

  // 监听剩余时间，控制背景音乐速度
  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 0) {
      audioManager.setBGMSpeed(2);
    } else {
      audioManager.setBGMSpeed(1);
    }
  }, [timeLeft]);

  // 提交分数到排行榜
  const submitScore = async () => {
    if (!playerName.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // 插入新记录
      const { error } = await supabase
        .from('snake_kings')
        .insert([
          {
            player_name: playerName.trim(),
            score: gameState.score,
            achieved_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      // 删除多余的记录，只保留前10名
      const { data: topScores } = await supabase
        .from('snake_kings')
        .select('id, score')
        .order('score', { ascending: false });

      if (topScores && topScores.length > 10) {
        const idsToDelete = topScores.slice(10).map(score => score.id);
        await supabase
          .from('snake_kings')
          .delete()
          .in('id', idsToDelete);
      }

      audioManager.play('score');
      setShowNameInput(false);
      onGameEnd();
    } catch (err) {
      console.error('提交分数失败:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="game-container flex flex-col items-center w-full max-w-[95vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[1200px]">
        {/* 顶部状态栏 */}
        <div className="w-full flex items-center justify-between gap-4 sm:gap-6 md:gap-8 mb-4 px-2 sm:px-4">
          {/* 左侧状态信息 */}
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 flex items-center gap-2">
              <span className="text-yellow-500 text-base sm:text-lg md:text-xl">🏆</span>
              <span className="text-white font-medium text-base sm:text-lg md:text-xl">{gameState.score}</span>
            </div>
            {timeLeft !== Infinity && (
              <div className={`bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 flex items-center gap-2 ${
                timeLeft <= 10 ? 'text-red-500' : 'text-white'
              }`}>
                <span className="text-base sm:text-lg md:text-xl">⏱️</span>
                <span className="font-medium text-base sm:text-lg md:text-xl">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* 右侧控制按钮 */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => audioManager.toggleMute()}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg px-2 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 text-white transition-colors text-base sm:text-lg md:text-xl"
              title={audioManager.isSoundMuted() ? "开启声音" : "关闭声音"}
            >
              {audioManager.isSoundMuted() ? "🔇" : "🔊"}
            </button>
            <button
              onClick={() => onGameEnd()}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg px-2 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 text-white transition-colors text-base sm:text-lg md:text-xl"
              title="返回首页"
            >
              🏠
            </button>
            <button
              onClick={() => togglePause()}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg px-2 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 text-white transition-colors text-base sm:text-lg md:text-xl"
              title={gameState.isPaused ? "继续游戏" : "暂停游戏"}
            >
              {gameState.isPaused ? "▶️" : "⏸️"}
            </button>
          </div>
        </div>

        {/* 游戏画布容器 */}
        <div className="relative w-full max-w-[90vmin] md:max-w-[80vmin] lg:max-w-[70vmin] aspect-square mx-auto overflow-hidden touch-none"
          style={{ touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            width={BOARD_SIZE * CELL_SIZE}
            height={BOARD_SIZE * CELL_SIZE}
            className="w-full h-full rounded-xl border-4 border-white/10 shadow-lg touch-none"
            style={{ touchAction: 'none' }}
          />

          {/* 游戏结束或暂停遮罩 */}
          {(gameState.isGameOver || gameState.isPaused) && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-black/80 p-4 sm:p-6 md:p-8 rounded-2xl text-white text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">
                  {gameState.isGameOver ? '游戏结束' : '游戏暂停'}
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6">得分: {gameState.score}</p>
                <button
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-base sm:text-lg md:text-xl"
                  onClick={gameState.isGameOver ? handleRestart : () => setGameState(prev => ({ ...prev, isPaused: false }))}
                >
                  {gameState.isGameOver ? '重新开始' : '继续游戏'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 虚拟摇杆 - 放在网格正下方 */}
        <div className="fixed left-1/2 -translate-x-1/2 transform bottom-24 touch-none"
          style={{ touchAction: 'none' }}>
          <VirtualJoystick onDirectionChange={handleDirectionChange} />
        </div>

        {/* 控制说明 - 移动到摇杆下方 */}
        <div className="fixed bottom-4 left-0 right-0 text-xs sm:text-sm md:text-base text-gray-400 text-center">
          <p>使用 WASD 或方向键控制移动</p>
          <p>空格键暂停/继续游戏</p>
        </div>
      </div>

      {/* 名字输入弹窗 - 提高z-index确保在最上层 */}
      {showNameInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">恭喜！请留下大名</h2>
            <p className="text-gray-300 mb-4">您的得分：{gameState.score}</p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="请输入您的名字"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
              maxLength={20}
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowNameInput(false);
                  onGameEnd();
                }}
                className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 focus:outline-none disabled:opacity-50"
                disabled={isSubmitting}
              >
                跳过
              </button>
              <button
                onClick={submitScore}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 focus:outline-none disabled:opacity-50"
                disabled={isSubmitting || !playerName.trim()}
              >
                {isSubmitting ? '提交中...' : '提交'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 