# Architecture

## Electron Setup

- **`window.js`** — Main process entry point. Creates BrowserWindow with `nodeIntegration: true`, enforces single instance.
- **`index.html`** — Renderer entry point. Single-page app with tab navigation (setup, race, players, manches/rounds, about).

## Core Modules (`js/`)

All modules run in the renderer process.

### `main.js` — Hardware + Event Binding
Wires everything together. Initializes johnny-five board, reads Arduino digital pins for 3 lane sensors, dispatches lap events to `client.addLap(lane)`, binds all UI event handlers (jQuery).

Contains a `debugMode` flag that:
- Bypasses hardware checks
- Enables keyboard input (keys 1/2/3 simulate lane sensors)

### `client.js` — Central Controller / State Machine
Manages race lifecycle (start → running → finished), tournament progression (manches, rounds, finals), free round mode.

Calls into:
- `chrono` for timing logic
- `storage` for persistence
- `ui` for rendering

### `chrono.js` — Race Timing Engine
Pure timing logic. Tracks 3 car objects through laps, calculates positions, delays, speeds. Uses time thresholds (min/max cutoff) to filter false sensor reads.

Key methods: `addLap(lane)`, `checkOutCars()`, `isRaceFinished()`

### `storage.js` — Persistence Layer
Uses `electron-settings`. Race data stored as JSON files in `userData/races/`. Handles save/load of rounds, player data aggregation, sorted player rankings.

### `configuration.js` — Global Settings
App settings (pin assignments, LED type, USB port) via `nconf`, stored in `userData/settings.json`.

### `ui.js` — DOM Rendering
All DOM manipulation via jQuery. Renders race state, player lists, manche tables, settings forms.

### `export.js` — Excel Export
Via `exceljs` library.

### `utils.js` — Time Formatting Helpers

## LED Managers (`js/led_managers/`)

Strategy pattern for different LED hardware:

| Manager                     | Usage                           |
|-----------------------------|---------------------------------|
| `led_manager_lilypad.js`    | Individual LEDs                 |
| `led_manager_rgb_strip.js`  | NeoPixel strip via node-pixel   |
| `led_manager_mock.js`       | No-op for debug mode            |

All extend `led_manager.js` base class.

## Other Directories

- **`i18n/`** — `i18n.js` class with `__()` lookup from JSON locale files (`en.json`, `it.json`)
- **`dev/`** — Sample data files and test settings configs
- **`css/`** — Bulma CSS framework + custom styles

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
