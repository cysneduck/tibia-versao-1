# Package.json Changes for Electron

Since `package.json` is read-only in Lovable, you need to manually add these dependencies and scripts after exporting your project.

## 1. Add to devDependencies

```json
"devDependencies": {
  "electron": "^28.0.0",
  "electron-builder": "^24.9.1",
  "electron-devtools-installer": "^3.2.0",
  "concurrently": "^8.2.2",
  "wait-on": "^7.2.0",
  "cross-env": "^7.0.3"
}
```

## 2. Add to dependencies

```json
"dependencies": {
  "electron-store": "^8.1.0",
  "electron-updater": "^6.1.7"
}
```

## 3. Add to scripts

```json
"scripts": {
  "electron:dev": "concurrently \"cross-env BROWSER=none vite\" \"wait-on http://localhost:8080 && cross-env NODE_ENV=development electron .\"",
  "electron:build": "vite build && electron-builder",
  "electron:build:win": "vite build && electron-builder --win",
  "electron:build:mac": "vite build && electron-builder --mac",
  "electron:build:linux": "vite build && electron-builder --linux",
  "electron:build:all": "vite build && electron-builder --win --mac --linux"
}
```

## 4. Update main field

```json
"main": "electron/main.js"
```

## Complete Example

Your package.json should look like this (showing only Electron-related parts):

```json
{
  "name": "claimed-system",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "concurrently \"cross-env BROWSER=none vite\" \"wait-on http://localhost:8080 && cross-env NODE_ENV=development electron .\"",
    "electron:build": "vite build && electron-builder",
    "electron:build:win": "vite build && electron-builder --win",
    "electron:build:mac": "vite build && electron-builder --mac",
    "electron:build:linux": "vite build && electron-builder --linux",
    "electron:build:all": "vite build && electron-builder --win --mac --linux"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1",
    "electron-devtools-installer": "^3.2.0",
    "concurrently": "^8.2.2",
    "wait-on": "^7.2.0",
    "cross-env": "^7.0.3",
    // ... your existing devDependencies
  },
  "dependencies": {
    "electron-store": "^8.1.0",
    "electron-updater": "^6.1.7",
    // ... your existing dependencies
  }
}
```

## After Making Changes

1. Run `npm install` to install new dependencies
2. Follow the setup guide in `ELECTRON_SETUP.md`
