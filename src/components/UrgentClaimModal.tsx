import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface UrgentClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  respawnCode: string;
  respawnName: string;
  expiresAt: string;
  onNavigateToRespawn?: () => void;
}

export const UrgentClaimModal = ({
  open,
  onOpenChange,
  respawnCode,
  respawnName,
  expiresAt,
  onNavigateToRespawn,
}: UrgentClaimModalProps) => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!open) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diffMs = expires.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining('Expirado!');
        return;
      }

      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [open, expiresAt]);

  const handleGoToRespawn = () => {
    onOpenChange(false);
    if (onNavigateToRespawn) {
      onNavigateToRespawn();
    } else {
      navigate('/');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-primary/50 bg-gradient-to-b from-primary/10 to-background">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-primary/30 rounded-full" />
              <AlertCircle className="h-16 w-16 text-primary relative z-10" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            🔥 É SUA VEZ DE CLAMAR! 🔥
          </DialogTitle>
          <DialogDescription className="text-center text-lg space-y-4 pt-4">
            <div className="space-y-2">
              <p className="text-foreground font-semibold">
                {respawnCode} - {respawnName}
              </p>
              <p className="text-muted-foreground">
                Está disponível para você agora!
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary">
              <Clock className="h-6 w-6 animate-pulse" />
              <span>{timeRemaining}</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Você tem prioridade por tempo limitado. Clame agora antes que expire!
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button
            onClick={handleGoToRespawn}
            className="w-full text-lg py-6 animate-pulse"
            size="lg"
          >
            🎯 Ir para o Respawn Agora
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="w-full"
          >
            Já vi, obrigado
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
