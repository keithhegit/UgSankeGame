export const BASE_SCORE = 10;
export const INITIAL_SNAKE_LENGTH = 3;
export const BASE_GRID_SIZE = 17;

// Game settings
export const OBSTACLE_INTERVAL = 10000;
export const MAX_OBSTACLES = 3;

// Responsive dimensions calculation
export const calculateGameDimensions = () => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 32; // 2rem padding
  
  // Calculate the maximum available space
  const maxWidth = viewportWidth - padding * 2;
  const maxHeight = viewportHeight - padding * 2;
  
  // Use the smaller dimension to ensure square cells
  const maxDimension = Math.min(maxWidth, maxHeight);
  
  // Calculate cell size based on grid size
  const cellSize = Math.floor(maxDimension / BASE_GRID_SIZE);
  
  return {
    GRID_SIZE: BASE_GRID_SIZE,
    CELL_SIZE: cellSize
  };
};