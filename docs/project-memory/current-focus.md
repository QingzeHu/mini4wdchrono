# Current Focus

## Recent Changes (as of 2026-03-29)

### Dependency Modernization (b5afab9)
- Upgraded Electron 9 → 28, serialport 9 → 12, exceljs 1 → 4, electron-log 3 → 4, nconf 0.10 → 0.12
- Migrated `electron.remote` → `@electron/remote` (separate package) across all modules
- Migrated `serialport` default export → named `{ SerialPort }` export in `ui.js`
- Removed `jsonfile` dependency, replaced with `JSON.parse(fs.readFileSync(...))` in `storage.js`
- Removed `app.allowRendererProcessReuse = false` workaround (no longer needed)
- Added `contextIsolation: false` and `sandbox: false` to BrowserWindow (required for nodeIntegration in Electron 28)
- Added `@electron/remote` initialization in `window.js` (remoteMain.initialize + enable)
- Added npm `overrides` for firmata/johnny-five to force serialport v12
- Rewrote `scripts/postinstall.js` to patch firmata `com.js` and johnny-five `board.js` for serialport v12 API compatibility
- Switched from `electron-rebuild` to `@electron/rebuild`

### Documentation (f7ba344)
- Added `docs/project-memory/` files (architecture, coding rules, glossary, known quirks, overview, current focus)
- Added `docs/runbooks/` (local dev, release, incident debugging)
- Added CLAUDE.md with project guidance

### Prior (v0.18.2)
- Better XLS export with km/h column
- Removed duplicate firmware
- ARM runnable environment setup
