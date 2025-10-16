import { useEffect, useState } from 'react';

interface PriorityTimerProps {
  expiresAt: string;
}

export const PriorityTimer = ({ expiresAt }: PriorityTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const expires = new Date(expiresAt);
      const now = new Date();
      const diffMs = expires.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setTimeRemaining('Expired');
        return;
      }
      
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTime(); // Initial calculation
    const interval = setInterval(calculateTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, [expiresAt]);

  return <span>{timeRemaining} remaining</span>;
};
