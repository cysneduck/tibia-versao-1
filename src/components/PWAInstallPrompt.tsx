import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-card border rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Instalar Aplicativo</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Adicione Resonance Remain à sua tela inicial para acesso rápido e experiência offline
          </p>
          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Instalar
            </Button>
            <Button onClick={() => setShowPrompt(false)} variant="ghost" size="sm">
              Agora não
            </Button>
          </div>
        </div>
        <Button
          onClick={() => setShowPrompt(false)}
          variant="ghost"
          size="icon"
          className="h-6 w-6"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
