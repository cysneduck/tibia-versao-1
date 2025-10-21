import { electronSounds } from './electronSounds';

// Check if running in Electron
const isElectron = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf(' electron/') > -1;
};

export class NotificationSound {
  private static audioContext: AudioContext | null = null;
  
  // Initialize Web Audio API
  static init() {
    if (!this.audioContext && typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  // Play notification sound with different priorities
  static play(priority: 'high' | 'medium' | 'normal' = 'normal') {
    // Use Electron native sounds if available
    if (isElectron()) {
      const soundTypeMap: Record<string, string> = {
        high: 'claim_ready',
        medium: 'claim_expiring',
        normal: 'queue_update',
      };
      electronSounds.playSound(soundTypeMap[priority] as any, priority);
      return;
    }

    // Use actual audio files in browser
    const soundFiles = {
      high: '/sounds/urgent-claim.wav',
      medium: '/sounds/normal-claim.wav',
      normal: '/sounds/normal-claim.wav',
    };

    const audio = new Audio(soundFiles[priority]);
    audio.volume = 0.7;
    
    audio.play().catch((error) => {
      console.warn('Failed to play notification sound:', error);
      // Fallback to Web Audio API synthetic tones
      this.playFallbackSound(priority);
    });
  }

  // Fallback synthetic sound using Web Audio API
  private static playFallbackSound(priority: 'high' | 'medium' | 'normal') {
    this.init();
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    const frequencies = {
      high: [800, 1000, 1200],
      medium: [600, 800],
      normal: [800]
    };
    
    const tones = frequencies[priority];
    let currentTime = this.audioContext.currentTime;
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
    
    oscillator.start(currentTime);
    
    tones.forEach((freq) => {
      oscillator.frequency.setValueAtTime(freq, currentTime);
      currentTime += 0.15;
    });
    
    gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.1);
    oscillator.stop(currentTime + 0.1);
  }
}
