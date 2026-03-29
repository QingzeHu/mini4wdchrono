# Known Quirks

## Native Module Rebuilds
Serialport requires native compilation matching the Electron version. If you see `NODE_MODULE_VERSION` mismatch errors, run:
```bash
npm run postinstall
```
This triggers `electron-rebuild`.

## `nodeIntegration: true`
The app runs with full Node.js access in the renderer process. This is legacy Electron 9 behavior — `require()` works directly in `index.html` and all JS modules.

## `app.allowRendererProcessReuse = false`
Required workaround for serialport to function in the renderer process. Comment in `window.js`.

## `debugMode` in `main.js`
Hardcoded `const debugMode = false` at the top of `main.js`. Set to `true` to bypass Arduino hardware entirely and use keyboard keys 1/2/3 to simulate sensor triggers.

## Time Value 99999
Sentinel value used for disqualified / timed-out / not-started cars. Appears throughout `chrono.js`, `client.js`, and `storage.js`.

## `configuration` Global
`configuration` module is used as a global in `main.js` without explicit require in some modules (attached to window scope via renderer process).
