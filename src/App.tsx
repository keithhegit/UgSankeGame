import { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameBoard } from './components/GameBoard';
import { Difficulty } from './types/game';

function App() {
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | null>(null);

  const handleGameStart = (difficulty: Difficulty) => {
    setCurrentDifficulty(difficulty);
  };

  const handleGameEnd = () => {
    setCurrentDifficulty(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden touch-none" style={{ touchAction: 'none' }}>
      <div className="w-full h-full">
        {currentDifficulty ? (
          <GameBoard 
            difficulty={currentDifficulty} 
            onGameEnd={handleGameEnd}
          />
        ) : (
          <StartScreen
            onStart={handleGameStart}
          />
        )}
      </div>
    </div>
  );
}

export default App;