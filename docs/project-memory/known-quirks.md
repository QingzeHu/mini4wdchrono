# Known Quirks

## Native Module Rebuilds
Serialport requires native compilation matching the Electron version. If you see `NODE_MODULE_VERSION` mismatch errors, run:
```bash
npm run postinstall
```
This triggers `@electron/rebuild` and also patches firmata/johnny-five for serialport v12 compatibility.

## `nodeIntegration: true` + `contextIsolation: false`
The app runs with full Node.js access in the renderer process. `require()` works directly in `index.html` and all JS modules. As of Electron 28, this also requires `contextIsolation: false` and `sandbox: false` in `webPreferences`.

## Serialport v12 Compatibility Patches
`scripts/postinstall.js` monkey-patches three files at install time:
- `firmata/lib/com.js` — wraps `SerialPort` in a `SerialPortCompat` class for node-pixel's firmata v0.19.1
- `johnny-five/node_modules/firmata/lib/com.js` — wraps `SerialPort` in a `SerialPortCompat` class for johnny-five's firmata v2.3.0 (the critical one used at runtime)
- `johnny-five/lib/board.js` — adapts `serialport.list()` to `serialport.SerialPort.list()`

These patches are required because johnny-five/firmata expect serialport v9 API. The patches are re-applied on every `npm install`.

## `@electron/remote`
Migrated from built-in `electron.remote` (removed in Electron 14) to `@electron/remote` package. Requires `remoteMain.initialize()` and `remoteMain.enable(webContents)` in `window.js`.

## `debugMode` in `main.js`
Hardcoded `const debugMode = false` at the top of `main.js`. Set to `true` to bypass Arduino hardware entirely and use keyboard keys 1/2/3 to simulate sensor triggers.

## Time Value 99999
Sentinel value used for disqualified / timed-out / not-started cars. Appears throughout `chrono.js`, `client.js`, and `storage.js`.

## `configuration` Not Imported in `client.js`
`client.js` uses `configuration.get()` on lines 25 and 206 without importing the module. This is a latent bug — likely worked in older versions where it may have been attached to window scope or was never reached in certain code paths.

## DevTools (resolved)
Previously `window.js` opened DevTools on launch. This has been removed.

## Nested Firmata Module Resolution
johnny-five bundles its own `firmata` v2.3.0 at `johnny-five/node_modules/firmata/`, separate from the top-level `firmata` v0.19.1. The nested version uses `firmata-io` with a `bindTransport(com)` pattern — `com` is passed directly as a constructor, not accessed as `com.SerialPort`. This means serialport v12 compatibility patches must target **both** `firmata/lib/com.js` files. The nested one is the critical one — it's the only path actually used at runtime. The postinstall script patches all three files.

## `i18n` not imported in `export.js` (resolved)
Fixed by adding `const i18n = new (require('../i18n/i18n'))();` to `export.js`.
