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
`scripts/postinstall.js` monkey-patches two files at install time:
- `firmata/lib/com.js` — wraps `SerialPort` constructor to accept `(path, options)` instead of `({ path, ...options })`
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

## DevTools Open by Default
`window.js` currently opens DevTools on launch (line for development). Should be removed or conditioned for production builds.
