export class NotificationSound {
  private static audioContext: AudioContext | null = null;
  
  // Initialize Web Audio API
  static init() {
    if (!this.audioContext && typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  // Play notification sound with different frequencies for different priorities
  static play(priority: 'high' | 'medium' | 'normal' = 'normal') {
    this.init();
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Different frequencies for different priorities
    const frequencies = {
      high: [800, 1000, 1200], // Ascending tones (urgent)
      medium: [600, 800], // Two-tone
      normal: [800] // Single tone
    };
    
    const tones = frequencies[priority];
    let currentTime = this.audioContext.currentTime;
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Configure sound
    oscillator.type = 'sine'; // Smooth, pleasant tone
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01); // Fade in
    
    oscillator.start(currentTime);
    
    // Play sequence of tones
    tones.forEach((freq, index) => {
      oscillator.frequency.setValueAtTime(freq, currentTime);
      currentTime += 0.15; // 150ms per tone
    });
    
    // Fade out
    gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.1);
    oscillator.stop(currentTime + 0.1);
  }
}
