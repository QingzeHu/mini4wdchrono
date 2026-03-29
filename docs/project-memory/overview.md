# Project Overview

Mini4wdChrono is an Electron 9 desktop app that serves as a **3-lane lap timer** for Mini 4WD Japan Cup races.

It connects to an Arduino board via USB (using johnny-five and serialport) to read IR sensors and control LEDs/buzzer for race timing.

## External Dependencies

- Track data fetched from `mini4wd-track-editor.pimentoso.com`
- Tournament/player data fetched from `mini4wd-tournament.pimentoso.com`

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Runtime      | Electron 28 (nodeIntegration: true, contextIsolation: false) |
| Hardware     | johnny-five + serialport            |
| UI Framework | Bulma CSS + jQuery                  |
| Persistence  | electron-settings (JSON files)      |
| Config       | nconf                               |
| LED Control  | node-pixel (NeoPixel) / direct GPIO |
| Export       | exceljs                             |
| i18n         | Custom (English / Italian)          |
