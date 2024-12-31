import React, { useRef, useState, useEffect } from 'react';
import { Direction } from '../types/game';

interface Props {
  onDirectionChange: (direction: Direction | null) => void;
}

const JOYSTICK_SIZE = 180;
const STICK_SIZE = JOYSTICK_SIZE / 2;

export const VirtualJoystick: React.FC<Props> = ({ onDirectionChange }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({
    isDragging: false,
    origin: { x: JOYSTICK_SIZE / 2, y: JOYSTICK_SIZE / 2 },
    position: { x: JOYSTICK_SIZE / 2, y: JOYSTICK_SIZE / 2 }
  });

  // 设置触摸事件为非被动模式
  useEffect(() => {
    const element = joystickRef.current;
    if (!element) return;

    element.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    element.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

    return () => {
      element.removeEventListener('touchstart', e => e.preventDefault());
      element.removeEventListener('touchmove', e => e.preventDefault());
    };
  }, []);

  const handleStart = (clientX: number, clientY: number) => {
    const rect = joystickRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setState(prev => ({
      ...prev,
      isDragging: true,
      origin: { x, y }
    }));
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!state.isDragging) return;

    const rect = joystickRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const deltaX = x - state.origin.x;
    const deltaY = y - state.origin.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = JOYSTICK_SIZE / 3;
    const angle = Math.atan2(deltaY, deltaX);

    const clampedDistance = Math.min(distance, maxDistance);
    const clampedX = Math.cos(angle) * clampedDistance;
    const clampedY = Math.sin(angle) * clampedDistance;

    setState(prev => ({
      ...prev,
      position: { 
        x: JOYSTICK_SIZE / 2 + clampedX, 
        y: JOYSTICK_SIZE / 2 + clampedY 
      }
    }));

    // 确定方向
    const threshold = JOYSTICK_SIZE / 6;
    if (Math.abs(clampedX) > Math.abs(clampedY)) {
      onDirectionChange(clampedX > threshold ? Direction.Right : clampedX < -threshold ? Direction.Left : null);
    } else {
      onDirectionChange(clampedY > threshold ? Direction.Down : clampedY < -threshold ? Direction.Up : null);
    }
  };

  const handleEnd = () => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      position: { x: JOYSTICK_SIZE / 2, y: JOYSTICK_SIZE / 2 }
    }));
    onDirectionChange(null);
  };

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMove(e.clientX, e.clientY);
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  return (
    <div
      ref={joystickRef}
      className="relative touch-none select-none"
      style={{
        width: JOYSTICK_SIZE,
        height: JOYSTICK_SIZE,
        touchAction: 'none' // 禁用触摸事件的默认行为
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
    >
      {/* 外圈 */}
      <div
        className="absolute rounded-full border-2 border-blue-500/50"
        style={{
          width: JOYSTICK_SIZE,
          height: JOYSTICK_SIZE,
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }}
      />
      {/* 摇杆 */}
      <div
        className="absolute rounded-full bg-blue-500/50 cursor-pointer"
        style={{
          width: STICK_SIZE,
          height: STICK_SIZE,
          left: state.position.x,
          top: state.position.y,
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
}; 