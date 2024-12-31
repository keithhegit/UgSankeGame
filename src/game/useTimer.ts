import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialTime: number, onTimeUp: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  const startTimer = useCallback(() => {
    setTimeLeft(initialTime);
    setIsRunning(true);
  }, [initialTime]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(interval);
          stopTimer();
          onTimeUp();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, onTimeUp, stopTimer]);

  return {
    timeLeft,
    startTimer,
    stopTimer,
    isRunning
  };
};