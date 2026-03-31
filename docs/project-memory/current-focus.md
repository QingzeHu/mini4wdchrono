# Current Focus

## Recent Changes (as of 2026-03-31)

### Serialport v12 postinstall patch fix + export.js bug fix (uncommitted)
- **Root cause found**: johnny-five resolves `require("firmata")` to its nested `johnny-five/node_modules/firmata` (v2.3.0), NOT the top-level `firmata` (v0.19.1). The nested firmata uses `firmata-io` with `bindTransport(com)`, so `com` must be a class (constructor), not an object like `{ SerialPort }`.
- Added patch for `johnny-five/node_modules/firmata/lib/com.js` in `scripts/postinstall.js` — wraps serialport v12's `SerialPort` in a `SerialPortCompat` class that accepts `(path, options)` instead of `({ path, ...options })`
- Also fixed the top-level `firmata/lib/com.js` patch to use `class extends` instead of plain function wrapper (avoids "Transport is not a constructor" errors)
- Three files now patched by postinstall: top-level `firmata/lib/com.js`, nested `johnny-five/node_modules/firmata/lib/com.js`, and `johnny-five/lib/board.js`
- Fixed `export.js` missing `i18n` import — was a latent ReferenceError when generating Excel exports

### i18n: Switch to Chinese + English (a7776cd)
- Removed Italian translation (`i18n/it.json`)
- Added Chinese translation (`i18n/zh.json`) with all 132 keys
- Changed default fallback language from English to Chinese in `i18n/i18n.js`
- Supported languages: `zh` (Chinese, default), `en` (English)

### DevTools disabled (a7776cd)
- Removed `mainWindow.webContents.openDevTools()` from `window.js`

### Dependency Modernization (b5afab9)
- Upgraded Electron 9 → 28, serialport 9 → 12, exceljs 1 → 4, electron-log 3 → 4, nconf 0.10 → 0.12
- Migrated `electron.remote` → `@electron/remote` (separate package) across all modules
- Migrated `serialport` default export → named `{ SerialPort }` export in `ui.js`
- Removed `jsonfile` dependency, replaced with `JSON.parse(fs.readFileSync(...))` in `storage.js`
- Added `contextIsolation: false` and `sandbox: false` to BrowserWindow (required for nodeIntegration in Electron 28)
- Added `@electron/remote` initialization in `window.js` (remoteMain.initialize + enable)
- Added npm `overrides` for firmata/johnny-five to force serialport v12
- Switched from `electron-rebuild` to `@electron/rebuild`

### Prior (v0.18.2)
- Better XLS export with km/h column
- Removed duplicate firmware
- ARM runnable environment setup
