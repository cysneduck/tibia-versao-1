import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface CountdownTimerProps {
  expiresAt: string;
  compact?: boolean;
}

export const CountdownTimer = ({ expiresAt, compact = false }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState<"normal" | "warning" | "critical">("normal");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft("Expired");
        setUrgencyLevel("critical");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Set urgency level
      if (difference < 15 * 60 * 1000) {
        setUrgencyLevel("critical"); // Less than 15 minutes
      } else if (difference < 30 * 60 * 1000) {
        setUrgencyLevel("warning"); // Less than 30 minutes
      } else {
        setUrgencyLevel("normal");
      }

      if (compact) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        // Show countdown with absolute time
        const expiryDate = format(new Date(expiresAt), "MMM dd, HH:mm");
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s (${expiryDate})`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, compact]);

  const getColorClass = () => {
    switch (urgencyLevel) {
      case "critical":
        return "text-destructive";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  const shouldPulse = urgencyLevel === "critical";

  return (
    <div className={`flex items-center gap-2 ${getColorClass()}`}>
      <AlertCircle className={`h-4 w-4 ${shouldPulse ? 'animate-pulse' : ''}`} />
      <span className={`text-sm font-mono ${compact ? '' : 'font-medium'}`}>
        {timeLeft}
      </span>
    </div>
  );
};
