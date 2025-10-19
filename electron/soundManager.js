/**
 * Sound Manager
 * Plays notification sounds at system volume using native audio
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import soundPlay from 'sound-play';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SoundManager {
  constructor() {
    this.soundsPath = path.join(__dirname, 'sounds');
    this.currentlyPlaying = null;
    this.volume = 0.7; // 0.0 to 1.0 (note: sound-play doesn't support volume control directly)
  }

  async playSound(soundType, priority = 'normal') {
    // Map sound types to files
    const soundFiles = {
      claim_ready: 'urgent-claim.mp3',
      claim_expiring: 'normal-claim.mp3',
      queue_update: 'queue-ready.mp3',
      system_alert: 'normal-claim.mp3',
    };

    const soundFile = soundFiles[soundType] || soundFiles.queue_update;
    const soundPath = path.join(this.soundsPath, soundFile);

    // Check if sound file exists
    if (!existsSync(soundPath)) {
      console.warn(`Sound file not found: ${soundPath}`);
      console.warn('Please add sound files to electron/sounds/ directory. See electron/sounds/README.md');
      return;
    }

    try {
      console.log(`Playing sound: ${soundPath} at volume ${this.volume}`);
      await soundPlay.play(soundPath);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  playUrgentSound() {
    this.playSound('claim_ready', 'high');
  }

  playNormalSound() {
    this.playSound('claim_expiring', 'medium');
  }

  playQueueSound() {
    this.playSound('queue_update', 'normal');
  }

  stopAll() {
    // Stop all currently playing sounds
    if (this.currentlyPlaying) {
      // this.currentlyPlaying.stop();
      this.currentlyPlaying = null;
    }
  }

  setVolume(volume) {
    // volume should be 0.0 to 1.0
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume() {
    return this.volume;
  }
}

export default SoundManager;
