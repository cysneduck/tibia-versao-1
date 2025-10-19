# Notification Sounds

This folder should contain the following audio files:

## Required Sound Files

1. **urgent-claim.wav** - High priority notification sound
   - Used for: `claim_ready` notifications
   - Should be attention-grabbing and urgent
   - Recommended: 1-2 seconds, ascending tones

2. **normal-claim.wav** - Medium priority notification sound
   - Used for: `claim_expiring` notifications
   - Should be noticeable but not alarming
   - Recommended: 0.5-1 second, two-tone

3. **queue-ready.wav** - Normal priority notification sound
   - Used for: `queue_update` and `system_alert` notifications
   - Should be gentle and pleasant
   - Recommended: 0.5-1 second, single tone

## How to Add Sounds

1. Create or download appropriate .wav files
2. Place them in this folder with the exact names above
3. Ensure files are:
   - Format: WAV (recommended)
   - Sample rate: 44.1 kHz or 48 kHz
   - Bit depth: 16-bit or higher
   - Duration: 0.5-2 seconds
   - Normalized volume (not too loud or quiet)

## Sound Sources (Suggestions)

- **Free Sources:**
  - [Freesound.org](https://freesound.org/)
  - [Zapsplat.com](https://www.zapsplat.com/)
  - [Notification Sounds](https://notificationsounds.com/)

- **Creating Custom Sounds:**
  - Use tools like Audacity (free) or Adobe Audition
  - Generate tones with specific frequencies:
    - Urgent: 800Hz → 1000Hz → 1200Hz (ascending)
    - Normal: 600Hz → 800Hz (two-tone)
    - Queue: 800Hz (single tone)

## Testing Sounds

After adding sounds, test them in the app:
1. Run `npm run electron:dev`
2. Trigger test notifications from the UI
3. Adjust volume as needed via settings
