# Coding Rules

## Module System
- CommonJS (`require` / `module.exports`). No ES modules.
- All renderer modules use `'use strict'`.

## UI Patterns
- jQuery for all DOM manipulation and event binding.
- Bulma CSS classes for styling (no custom component framework).
- Tab navigation managed by `ui.gotoTab(tabName)`.
- Modal pattern: `.open-modal` / `.close-modal` classes with `is-active` toggle.

## Hardware Interaction
- johnny-five `Board` for Arduino communication.
- Raw `digitalRead` on sensor pins with 1ms sampling interval.
- Sensor trigger = falling edge detection (value goes from 1 to 0).

## Configuration
- Hardware config (pins, USB port, LED type): `configuration.js` via nconf → `settings.json`
- Race settings (thresholds, laps, mode): `storage.js` via electron-settings → per-race JSON

## i18n
- `data-tn` attributes on HTML elements for automatic translation.
- `i18n.__('key')` for programmatic strings.
- Locale files: `i18n/en.json`, `i18n/it.json`.

## No Linter / No Test Framework
- No linter is configured.
- `test/main.test.js` is a placeholder (no real tests exist).
