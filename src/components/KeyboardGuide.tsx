import React, { useState, useEffect } from 'react';

interface KeyProps {
  label: string;
  isPressed?: boolean;
  isSpace?: boolean;
}

const Key: React.FC<KeyProps> = ({ label, isPressed = false, isSpace = false }) => (
  <div
    className={`
      ${isSpace ? 'w-24' : 'w-10'} 
      h-10 
      flex 
      items-center 
      justify-center 
      rounded-lg 
      border-2 
      ${isPressed 
        ? 'bg-blue-600 border-blue-400 text-white transform scale-95' 
        : 'bg-gray-800 border-gray-700 text-gray-400'
      }
      transition-all duration-100
      font-medium
      select-none
    `}
  >
    {label}
  </div>
);

interface KeyboardGuideProps {
  isPaused: boolean;
}

export const KeyboardGuide: React.FC<KeyboardGuideProps> = ({ isPaused }) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys(prev => new Set([...prev, e.key.toLowerCase()]));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const next = new Set([...prev]);
        next.delete(e.key.toLowerCase());
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="fixed bottom-8 right-8 bg-black bg-opacity-80 p-4 rounded-lg shadow-lg">
      {/* WASD 按键组 */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-1">
          <div className="col-start-2">
            <Key label="W" isPressed={pressedKeys.has('w')} />
          </div>
          <div className="col-start-1 col-end-4 grid grid-cols-3 gap-1">
            <Key label="A" isPressed={pressedKeys.has('a')} />
            <Key label="S" isPressed={pressedKeys.has('s')} />
            <Key label="D" isPressed={pressedKeys.has('d')} />
          </div>
        </div>
      </div>

      {/* 方向键组 */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-1">
          <div className="col-start-2">
            <Key label="↑" isPressed={pressedKeys.has('arrowup')} />
          </div>
          <div className="col-start-1 col-end-4 grid grid-cols-3 gap-1">
            <Key label="←" isPressed={pressedKeys.has('arrowleft')} />
            <Key label="↓" isPressed={pressedKeys.has('arrowdown')} />
            <Key label="→" isPressed={pressedKeys.has('arrowright')} />
          </div>
        </div>
      </div>

      {/* 空格键 */}
      <div className="text-center">
        <Key 
          label={isPaused ? "继续" : "暂停"} 
          isPressed={pressedKeys.has(' ')} 
          isSpace={true}
        />
      </div>

      {/* 按键说明 */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        使用WASD或方向键控制移动<br />
        空格键{isPaused ? "继续" : "暂停"}游戏
      </div>
    </div>
  );
}; 