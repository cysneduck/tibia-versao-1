# Electron Desktop App Setup Guide

This guide will help you transform your Claimed System web app into a desktop application.

## Prerequisites

- Node.js 18+ installed
- Your exported Lovable project files
- Basic command line knowledge

## Step 1: Merge Package Dependencies

Since `package.json` is read-only in Lovable, you need to manually merge the dependencies:

1. Open your current `package.json`
2. Open `package.json.electron` (created by Lovable)
3. Add these dependencies to your `package.json`:

```json
"devDependencies": {
  "electron": "^28.0.0",
  "electron-builder": "^24.9.1",
  "electron-devtools-installer": "^3.2.0",
  "concurrently": "^8.2.2",
  "wait-on": "^7.2.0",
  "cross-env": "^7.0.3"
},
"dependencies": {
  "electron-store": "^8.1.0",
  "electron-updater": "^6.1.7"
}
```

4. Add these scripts to `package.json`:

```json
"scripts": {
  "electron:dev": "concurrently \"cross-env BROWSER=none vite\" \"wait-on http://localhost:8080 && cross-env NODE_ENV=development electron .\"",
  "electron:build": "vite build && electron-builder",
  "electron:build:win": "vite build && electron-builder --win",
  "electron:build:mac": "vite build && electron-builder --mac",
  "electron:build:linux": "vite build && electron-builder --linux"
}
```

5. Update the `main` field in `package.json`:

```json
"main": "electron/main.js"
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Add Notification Sounds

Navigate to `electron/sounds/` and add three MP3 files:
- `urgent-claim.mp3` - High priority sound
- `normal-claim.mp3` - Medium priority sound
- `queue-ready.mp3` - Low priority sound

See `electron/sounds/README.md` for details and sources.

## Step 4: Update Vite Configuration

Replace your `vite.config.ts` with `vite.config.electron.ts`:

```bash
# Backup current config
mv vite.config.ts vite.config.web.ts

# Use Electron config
mv vite.config.electron.ts vite.config.ts
```

Or manually update `vite.config.ts` to set `base: './'`.

## Step 5: Integrate Electron into React App

### Update App.tsx

Add Electron detection and conditional features:

```typescript
import { isElectron } from '@/utils/isElectron';
import { ElectronSettings } from '@/components/ElectronSettings';

// In your component:
{!isElectron() && <PWAInstallPrompt />}
{isElectron() && <ElectronSettings />}
```

### Update useNotifications Hook

Integrate Electron notifications in `src/hooks/useNotifications.ts`:

```typescript
import { useElectronNotifications } from './useElectronNotifications';
import { isElectron } from '@/utils/isElectron';

// In your hook:
const electronNotifications = useElectronNotifications();

// When showing notifications:
if (isElectron()) {
  electronNotifications.showNotification(notification);
  electronNotifications.updateBadge(unreadCount);
} else {
  // Use browser notifications
}
```

### Update Sound System

Modify `src/utils/notificationSounds.ts` to use Electron sounds:

```typescript
import { electronSounds } from './electronSounds';
import { isElectron } from './isElectron';

static play(priority) {
  if (isElectron()) {
    electronSounds.playSound('claim_ready', priority);
  } else {
    // Existing Web Audio API code
  }
}
```

## Step 6: Development

Run the app in development mode:

```bash
npm run electron:dev
```

This will:
1. Start Vite dev server
2. Wait for it to be ready
3. Launch Electron window
4. Enable hot-reload

## Step 7: Building for Production

### Windows

```bash
npm run electron:build:win
```

Output: `dist-electron/Claimed System-Setup-1.0.0.exe`

### macOS

```bash
npm run electron:build:mac
```

Output: `dist-electron/Claimed System-1.0.0-arm64.dmg` (Apple Silicon)
        `dist-electron/Claimed System-1.0.0-x64.dmg` (Intel)

### Linux

```bash
npm run electron:build:linux
```

Output: `dist-electron/Claimed System-1.0.0-x86_64.AppImage`
        `dist-electron/claimed-system_1.0.0_amd64.deb`

### All Platforms

```bash
npm run electron:build:all
```

## Step 8: Code Signing (Optional but Recommended)

### Windows

1. Obtain a code signing certificate
2. Add to `electron-builder.json`:

```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "your-password"
}
```

### macOS

1. Join Apple Developer Program ($99/year)
2. Create signing certificate in Xcode
3. Add to `electron-builder.json`:

```json
"mac": {
  "identity": "Developer ID Application: Your Name (TEAM_ID)"
}
```

## Step 9: Auto-Updates Setup (Optional)

1. Create a GitHub repository
2. Update `electron-builder.json`:

```json
"publish": {
  "provider": "github",
  "owner": "your-username",
  "repo": "claimed-system"
}
```

3. Generate GitHub token with repo access
4. Set environment variable:

```bash
export GH_TOKEN="your-github-token"
```

5. Build with auto-update:

```bash
npm run electron:build
```

## Testing Checklist

- [ ] App launches successfully
- [ ] Notifications show in custom windows
- [ ] Sounds play at system volume
- [ ] Taskbar flashes on Windows
- [ ] Dock bounces on macOS
- [ ] System tray icon works
- [ ] Badge count updates
- [ ] Minimize to tray works
- [ ] Auto-launch setting works
- [ ] Urgent claim window appears always-on-top
- [ ] Multi-monitor support works
- [ ] Updates check works (if configured)

## Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Electron window is blank
- Check console for errors
- Verify `base: './'` in `vite.config.ts`
- Ensure build completed successfully

### Notifications don't work
- Check `electron/sounds/` folder has MP3 files
- Verify permissions granted for notifications
- Check developer console in Electron

### Build fails
- Ensure all dependencies installed
- Check Node.js version (18+)
- Review electron-builder logs

## Platform-Specific Notes

### Windows
- First run may trigger Windows Defender warning (normal without code signing)
- App installs to `C:\\Program Files\\Claimed System`
- Uninstaller created automatically

### macOS
- First run requires right-click → Open (normal without notarization)
- App installs to `/Applications/Claimed System.app`
- May need to allow in System Settings → Security & Privacy

### Linux
- AppImage requires FUSE to run
- .deb installs via `sudo dpkg -i claimed-system_1.0.0_amd64.deb`
- Desktop entry created automatically

## Distribution

1. **GitHub Releases**: Upload built files to GitHub releases
2. **Website**: Host installers on your own domain
3. **Auto-Update**: Use GitHub releases for automatic updates

## Support

For issues or questions:
1. Check `electron/main.js` console logs
2. Check browser console in app
3. Review Electron documentation: https://www.electronjs.org/docs

## Next Steps

- Customize window size/position in `electron/main.js`
- Add custom tray menu items in `electron/trayManager.js`
- Implement additional IPC channels for features
- Set up CI/CD for automated builds
- Add analytics/crash reporting
