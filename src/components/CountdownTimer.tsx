import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: string;
  compact?: boolean;
}

export const CountdownTimer = ({ expiresAt, compact = false }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Mark as expiring soon if less than 30 minutes
      setIsExpiringSoon(difference < 30 * 60 * 1000);

      if (compact) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, compact]);

  return (
    <div className={`flex items-center gap-2 ${isExpiringSoon ? 'text-destructive' : 'text-muted-foreground'}`}>
      <Clock className="h-4 w-4" />
      <span className={`text-sm font-mono ${compact ? '' : 'font-medium'}`}>
        {timeLeft}
      </span>
    </div>
  );
};
