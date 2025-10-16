export class TabNotification {
  private static originalTitle = 'Claimed System';
  private static blinkInterval: number | null = null;
  
  // Update tab title with unread count
  static setUnread(count: number) {
    if (count > 0) {
      document.title = `(${count}) 🔴 ${this.originalTitle}`;
    } else {
      document.title = this.originalTitle;
    }
  }
  
  // Blink the tab title for urgent notifications
  static blink() {
    // Clear any existing blink
    this.stopBlinking();
    
    let visible = true;
    this.blinkInterval = window.setInterval(() => {
      document.title = visible ? '🔴 SUA VEZ DE CLAMAR!' : this.originalTitle;
      visible = !visible;
    }, 1000);
    
    // Stop blinking after 30 seconds
    setTimeout(() => this.stopBlinking(), 30000);
    
    // Stop blinking when user focuses the window
    const handleFocus = () => {
      this.stopBlinking();
      window.removeEventListener('focus', handleFocus);
    };
    window.addEventListener('focus', handleFocus);
  }
  
  // Stop blinking and restore original title
  static stopBlinking() {
    if (this.blinkInterval !== null) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
      document.title = this.originalTitle;
    }
  }
  
  // Reset to original title
  static reset() {
    this.stopBlinking();
    document.title = this.originalTitle;
  }
}
