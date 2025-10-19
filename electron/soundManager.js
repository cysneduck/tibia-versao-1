/**
 * Sound Manager
 * Plays notification sounds at system volume using native audio
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SoundManager {
  constructor() {
    this.soundsPath = path.join(__dirname, 'sounds');
    this.currentlyPlaying = null;
    this.volume = 0.7; // 0.0 to 1.0
    this.platform = process.platform;
  }

  playSound(soundType, priority = 'normal') {
    // Map sound types to files
    const soundFiles = {
      claim_ready: 'urgent-claim.wav',
      claim_expiring: 'normal-claim.wav',
      queue_update: 'queue-ready.wav',
      system_alert: 'normal-claim.wav',
    };

    const soundFile = soundFiles[soundType] || soundFiles.queue_update;
    const soundPath = path.join(this.soundsPath, soundFile);

    console.log('[SoundManager] ========================================');
    console.log('[SoundManager] Attempting to play sound at:', new Date().toISOString());
    console.log('[SoundManager] - Sound type:', soundType);
    console.log('[SoundManager] - Priority:', priority);
    console.log('[SoundManager] - Sound file:', soundFile);
    console.log('[SoundManager] - Full path:', soundPath);
    console.log('[SoundManager] - Platform:', this.platform);

    // Check if sound file exists
    if (!existsSync(soundPath)) {
      console.error('[SoundManager] ❌ Sound file NOT FOUND:', soundPath);
      console.error('[SoundManager] Files in sounds directory:');
      
      // List what files ARE in the directory
      const fs = require('fs');
      try {
        const files = fs.readdirSync(this.soundsPath);
        console.error('[SoundManager] Available files:', files);
      } catch (err) {
        console.error('[SoundManager] Could not read sounds directory:', err);
      }
      console.error('[SoundManager] Falling back to system beep...');
      
      // Fallback: Play system beep
      this.playSystemBeep(priority);
      console.log('[SoundManager] ========================================');
      return;
    }

    console.log('[SoundManager] ✅ Sound file exists, attempting to play...');

    try {
      // Use platform-specific command to play audio
      let command;
      if (this.platform === 'win32') {
        // Windows: Use PowerShell with .PlaySync() for reliable playback
        // Escape backslashes and quotes in path for PowerShell
        const escapedPath = soundPath.replace(/\\/g, '\\\\').replace(/'/g, "''");
        
        // Use PlaySync() to ensure sound plays completely
        command = `powershell -c "(New-Object Media.SoundPlayer '${escapedPath}').PlaySync()"`;
        
        console.log('[SoundManager] Windows command:', command);
      } else if (this.platform === 'darwin') {
        // macOS: use afplay
        command = `afplay "${soundPath}"`;
        console.log('[SoundManager] Executing command:', command);
      } else {
        // Linux: try multiple players
        command = `paplay "${soundPath}" || aplay "${soundPath}" || mpg123 "${soundPath}"`;
        console.log('[SoundManager] Executing command:', command);
      }

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('[SoundManager] ❌ Error executing command:', error);
          console.error('[SoundManager] Error code:', error.code);
          console.error('[SoundManager] Error message:', error.message);
          console.error('[SoundManager] Falling back to system beep...');
          this.playSystemBeep(priority);
        }
        if (stdout) {
          console.log('[SoundManager] stdout:', stdout);
        }
        if (stderr) {
          console.error('[SoundManager] stderr:', stderr);
        }
        if (!error && !stderr) {
          console.log('[SoundManager] ✅ Sound played successfully');
        }
        console.log('[SoundManager] ========================================');
      });
    } catch (error) {
      console.error('[SoundManager] ❌ Exception playing sound:', error);
      console.error('[SoundManager] Falling back to system beep...');
      this.playSystemBeep(priority);
      console.log('[SoundManager] ========================================');
    }
  }

  playSystemBeep(priority = 'normal') {
    // Fallback: Use system beep/alert sound
    console.log('[SoundManager] Playing system beep for priority:', priority);
    
    try {
      const beepCount = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;
      
      if (this.platform === 'win32') {
        // Windows: Use console beep
        for (let i = 0; i < beepCount; i++) {
          exec('rundll32 user32.dll,MessageBeep', (error) => {
            if (error) {
              console.error('[SoundManager] Beep error:', error);
            }
          });
        }
      } else if (this.platform === 'darwin') {
        // macOS: Use system alert sound
        for (let i = 0; i < beepCount; i++) {
          exec('afplay /System/Library/Sounds/Glass.aiff', (error) => {
            if (error) {
              console.error('[SoundManager] Beep error:', error);
            }
          });
        }
      } else {
        // Linux: Try different beep methods
        for (let i = 0; i < beepCount; i++) {
          exec('paplay /usr/share/sounds/freedesktop/stereo/message.oga || beep', (error) => {
            if (error) {
              console.error('[SoundManager] Beep error:', error);
            }
          });
        }
      }
      
      console.log('[SoundManager] ✅ System beep triggered');
    } catch (error) {
      console.error('[SoundManager] ❌ Could not play system beep:', error);
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
