# Architecture

## Electron Setup

- **`window.js`** — Main process entry point. Creates BrowserWindow with `nodeIntegration: true`, `contextIsolation: false`, `sandbox: false`. Enforces single instance via `requestSingleInstanceLock()`. Initializes `@electron/remote`.
- **`index.html`** — Renderer entry point (687 lines). Single-page app with tab navigation (setup, race, players, manches/rounds, config, about). Uses Bulma CSS framework. Loads `js/main.js` as renderer entry.

## Core Modules (`js/`)

All modules run in the renderer process.

### `main.js` — Hardware + Event Binding (~470 lines)
Wires everything together. Initializes johnny-five board, reads Arduino digital pins for 3 lane sensors, dispatches lap events to `client.addLap(lane)`, binds all UI event handlers (jQuery), manages modal dialogs, and handles LED manager instantiation.

Dependencies: `configuration`, `storage`, `client`, `ui`, `export`, `i18n`, `johnny-five`, `jquery`, `underscore`, `@electron/remote`, `electron-log`, LED managers.

Contains a `debugMode` flag that:
- Bypasses hardware checks
- Enables keyboard input (keys 1/2/3 simulate lane sensors)
- Uses `LedManagerMock` instead of hardware LED manager

**Note:** This file has god-object tendencies — mixes hardware init, UI wiring, modal management, and event handling. Both `main.js` and `client.js` manipulate DOM directly.

### `client.js` — Central Controller / State Machine
Manages race lifecycle (start → running → finished), tournament progression (manches, rounds, finals), free round mode. Also handles finals generation logic.

Dependencies: `ui`, `utils`, `storage`, `chrono`, `export`, `i18n`, `clone`, `@electron/remote`.

Calls into:
- `chrono` for timing logic
- `storage` for persistence
- `ui` for rendering
- `export` for Excel generation

**Known issue:** Uses `configuration.get()` (lines 25, 206) without importing `configuration` — latent ReferenceError.

State managed via module-scope variables: `currTrack`, `currTournament`, `mancheList`, `currManche`, `currRound`, `raceStarting`, `raceRunning`, `freeRound`.

### `chrono.js` — Race Timing Engine
Pure timing logic. Tracks 3 car objects through laps, calculates positions, delays, speeds. Uses time thresholds (min/max cutoff) to filter false sensor reads. Hard-coded to 3 lanes.

Dependencies: `storage` (for threshold settings), `clone`.

Key methods: `addLap(lane)`, `checkOutCars()`, `checkNotStartedCars()`, `isRaceFinished()`

### `storage.js` — Persistence Layer
Uses `electron-settings` with dynamic `setPath()` to switch between race files. Race data stored as JSON files in `userData/races/`. Handles save/load of rounds, player data aggregation, sorted player rankings.

Dependencies: `@electron/remote`, `fs`, `path`, `electron-settings`, `configuration`.

Contains tournament ranking logic (`getSortedPlayerList`) that could belong in a tournament module.

### `configuration.js` — Global Settings
App settings (pin assignments, LED type, USB port) via `nconf`, stored in `userData/settings.json`. Has `reset()` method that backs up corrupted settings before reinitializing.

Dependencies: `@electron/remote`, `fs`, `path`, `nconf`.

### `ui.js` — DOM Rendering (~631 lines)
All DOM manipulation via jQuery. Renders race state, player lists, manche tables, settings forms, serial port listings.

Dependencies: `serialport` (destructured `{ SerialPort }`), `strftime`, `utils`, `configuration`, `storage`, `i18n`. Note: `jquery` and `underscore` are accessed via `window.$`/`window._` set by `main.js`, not imported directly. Calls `configuration.init()` at module scope (line 8).

### `export.js` — Excel Export
Generates XLSX workbook with player standings via `exceljs`. Exports to `~/Mini4wdChrono/` directory.

Dependencies: `exceljs`, `utils`, `@electron/remote`, `fs`, `path`, `storage`, `strftime`, `i18n`.

### `utils.js` — Time Formatting Helpers
`prettyTime()` (ms → locale string), `safeTime()` (string → ms), `delay()` (chainable timeout).

Dependencies: `@electron/remote` (for locale).

## LED Managers (`js/led_managers/`)

Strategy pattern for different LED hardware. All use singleton `getInstance()` pattern.

| Manager                     | Usage                           |
|-----------------------------|---------------------------------|
| `led_manager_lilypad.js`    | 3 individual LEDs via johnny-five |
| `led_manager_rgb_strip.js`  | 9-pixel WS2812b strip via node-pixel |
| `led_manager_mock.js`       | No-op for debug mode            |

All extend `led_manager.js` base class, which provides buzzer control, lane index reversal, and abstract method stubs (`roundStart`, `roundFinish`, `lap`).

## Other Directories

- **`i18n/`** — `i18n.js` constructor function (not a class) with `__()` prototype method for lookup from JSON locale files (`en.json`, `zh.json`). Locale detected from system at startup (defaults to Chinese if locale not found), no dynamic switching.
- **`dev/`** — Sample data files and test settings configs
- **`css/`** — Bulma CSS framework + custom styles

## Dependency Graph

```
window.js (Electron main)
    └── index.html (renderer)
        └── js/main.js (entry point)
            ├── configuration
            ├── storage ──── configuration
            ├── client
            │   ├── chrono ── storage
            │   ├── storage
            │   ├── ui ────── storage, configuration, utils
            │   └── export ── storage, utils, i18n
            ├── ui
            ├── led_managers/* ── utils, storage
            └── johnny-five (hardware)
```

No circular dependencies detected. However, `main.js` and `client.js` both perform DOM manipulation, creating implicit coupling through shared DOM state.

### Firmata Module Resolution (important)
johnny-five `require("firmata")` resolves to its **nested** `johnny-five/node_modules/firmata` (v2.3.0), NOT the top-level `firmata` (v0.19.1). The nested firmata does `require("firmata-io")(require("./com"))`, passing `com` as the Transport constructor. This is the critical path for serialport v12 compatibility patches.

## Data Flow

```
Arduino Sensors
  │  (digital pin falling edge 1→0)
  ▼
main.js
  │  client.addLap(lane)
  ▼
client.js
  │  chrono.addLap(lane)
  ▼
chrono.js
  │  match signal to car via lane order + time thresholds
  │  update lap count / position / speed
  ▼
client.updateRace()
  │  ui.drawRace(cars)
  ▼
ui.js → DOM
  │
  │  (on race finish)
  ▼
storage.saveRound() → JSON file
```

## Known Architectural Concerns

1. **`main.js` bloat** — ~470 lines mixing hardware init, UI event binding, modal management, and LED setup. Could be split into hardware, ui-bindings, and modal modules.
2. **Scattered DOM manipulation** — Both `main.js` and `client.js` use jQuery selectors directly instead of delegating all rendering to `ui.js`.
3. **Tournament logic fragmentation** — Finals generation lives in `client.js`, ranking in `storage.js`, rendering in `ui.js`. No cohesive tournament module.
4. **Hard-coded 3 lanes** — Lane count baked into `chrono.js`, LED managers, and HTML structure. Not easily extensible.
5. **No event bus** — All module communication via direct function calls, creating tight coupling.
6. **`configuration` not imported in `client.js`** — Used at lines 25, 206 but never required; would throw ReferenceError at runtime.
7. ~~**`i18n` not imported in `export.js`**~~ — **Resolved.** Added `i18n` import to `export.js`.
8. **Serialport v12 compatibility** — Requires postinstall patches to three `com.js` files: top-level `firmata/lib/com.js`, nested `johnny-five/node_modules/firmata/lib/com.js` (the one actually used at runtime via firmata-io), and `johnny-five/lib/board.js`. The nested firmata (v2.3.0) uses `firmata-io` which expects a Transport class passed via `bindTransport()`, not a `com.SerialPort` property.
