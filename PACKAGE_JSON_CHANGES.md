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

## Important: ES Module Compatibility

All Electron files have been written using **ES module syntax** (`import`/`export`) to be compatible with modern React projects that use `"type": "module"` in package.json.

If your package.json already contains `"type": "module"` (which is common in Vite/React projects), no additional changes are needed - the Electron files will work as-is.

If for some reason you need CommonJS format instead, you would need to:
1. Either remove `"type": "module"` from package.json
2. Or rename all Electron .js files to .cjs
3. Or convert the import/export statements back to require/module.exports

## After Making Changes

1. Run `npm install` to install new dependencies
2. Follow the setup guide in `ELECTRON_SETUP.md`
