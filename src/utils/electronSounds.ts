/**
 * Electron Sound Utilities
 * Handles sound playback via Electron IPC
 */

import { electronBridge } from './electronBridge';
import { isElectron } from './isElectron';

export type SoundType = 'claim_ready' | 'claim_expiring' | 'queue_update' | 'system_alert';
export type SoundPriority = 'high' | 'medium' | 'normal';

class ElectronSoundManager {
  playSound(type: SoundType, priority: SoundPriority = 'normal'): void {
    if (!isElectron()) {
      console.log('Not in Electron, skipping native sound');
      return;
    }

    electronBridge.playSound(type, priority);
  }

  playUrgentSound(): void {
    this.playSound('claim_ready', 'high');
  }

  playExpiringSound(): void {
    this.playSound('claim_expiring', 'medium');
  }

  playQueueSound(): void {
    this.playSound('queue_update', 'normal');
  }

  playSystemSound(): void {
    this.playSound('system_alert', 'normal');
  }

  stopAll(): void {
    if (!isElectron()) return;
    electronBridge.stopSound();
  }

  setVolume(volume: number): void {
    if (!isElectron()) return;
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    electronBridge.setSoundVolume(clampedVolume);
  }
}

export const electronSounds = new ElectronSoundManager();
