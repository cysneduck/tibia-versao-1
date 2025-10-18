/**
 * Electron Settings Component
 * Settings panel for desktop-specific features
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { electronBridge } from '@/utils/electronBridge';
import { useToast } from '@/hooks/use-toast';
import { Power, Volume2, Bell, Download } from 'lucide-react';

export const ElectronSettings = () => {
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [soundVolume, setSoundVolume] = useState(70);
  const [appVersion, setAppVersion] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const autoLaunchStatus = await electronBridge.getAutoLaunchStatus();
    setAutoLaunch(autoLaunchStatus);

    const version = await electronBridge.getAppVersion();
    setAppVersion(version);
  };

  const handleAutoLaunchToggle = async (enabled: boolean) => {
    setAutoLaunch(enabled);
    
    if (enabled) {
      const success = await electronBridge.enableAutoLaunch();
      if (success) {
        toast({
          title: 'Auto-launch enabled',
          description: 'App will start automatically when you log in',
        });
      }
    } else {
      const success = await electronBridge.disableAutoLaunch();
      if (success) {
        toast({
          title: 'Auto-launch disabled',
          description: 'App will not start automatically',
        });
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const volume = value[0];
    setSoundVolume(volume);
    electronBridge.setSoundVolume(volume / 100);
  };

  const handleCheckUpdates = () => {
    electronBridge.checkForUpdates();
    toast({
      title: 'Checking for updates',
      description: 'Looking for new versions...',
    });
  };

  const handleMinimizeToTray = () => {
    electronBridge.closeWindow();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Power className="w-5 h-5" />
          Desktop Settings
        </h3>
        
        <div className="space-y-6">
          {/* Auto Launch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-launch">Start on System Boot</Label>
              <p className="text-sm text-muted-foreground">
                Launch app automatically when you log in
              </p>
            </div>
            <Switch
              id="auto-launch"
              checked={autoLaunch}
              onCheckedChange={handleAutoLaunchToggle}
            />
          </div>

          {/* Sound Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Notification Sound Volume
              </Label>
              <span className="text-sm text-muted-foreground">{soundVolume}%</span>
            </div>
            <Slider
              value={[soundVolume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Minimize to Tray */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Window Behavior</Label>
              <p className="text-sm text-muted-foreground">
                Close button minimizes to system tray
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMinimizeToTray}
            >
              <Bell className="w-4 h-4 mr-2" />
              Minimize Now
            </Button>
          </div>
        </div>
      </Card>

      {/* Updates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Updates
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Version</p>
              <p className="text-sm text-muted-foreground">{appVersion || 'Loading...'}</p>
            </div>
            <Button onClick={handleCheckUpdates} variant="outline">
              Check for Updates
            </Button>
          </div>
        </div>
      </Card>

      {/* Platform Info */}
      <Card className="p-6 bg-muted/50">
        <p className="text-sm text-muted-foreground text-center">
          Running on: <span className="font-medium">{electronBridge.getPlatform()}</span>
        </p>
      </Card>
    </div>
  );
};
