/**
 * Sound Manager
 * Plays notification sounds at system volume using native audio
 */

const path = require('path');
const { app } = require('electron');

class SoundManager {
  constructor() {
    this.soundsPath = path.join(__dirname, 'sounds');
    this.currentlyPlaying = null;
    this.volume = 0.7; // 0.0 to 1.0
    
    // In a real implementation, you'd use a native audio library
    // like node-audio or electron-audio for better control
    // For now, this is a placeholder structure
  }

  playSound(soundType, priority = 'normal') {
    // Map sound types to files
    const soundFiles = {
      claim_ready: 'urgent-claim.mp3',
      claim_expiring: 'normal-claim.mp3',
      queue_update: 'queue-ready.mp3',
      system_alert: 'normal-claim.mp3',
    };

    const soundFile = soundFiles[soundType] || soundFiles.queue_update;
    const soundPath = path.join(this.soundsPath, soundFile);

    try {
      // This is where you'd integrate with a native audio library
      // Example pseudo-code:
      // const audio = new Audio(soundPath);
      // audio.volume = this.volume;
      // audio.play();
      
      console.log(`Playing sound: ${soundPath} at volume ${this.volume}`);
      
      // For Electron, you could use the shell to play audio
      // or integrate with node libraries like 'play-sound' or 'node-wav-player'
      
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

module.exports = SoundManager;
