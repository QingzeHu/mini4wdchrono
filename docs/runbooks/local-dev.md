# Local Development

## Prerequisites
- Node.js (managed via nodenv, see `.node-version`)
- Arduino IDE (for flashing firmware)
- Arduino board connected via USB

### macOS
```bash
brew install nodenv
# follow nodenv setup instructions
brew cask install arduino
```

### Windows (PowerShell as admin)
```bash
choco install arduino
choco install nodejs
npm install -g windows-build-tools
```

## Setup
```bash
cd mini4wdchrono
nodenv install        # macOS only
npm install           # runs @electron/rebuild + patches firmata/johnny-five for serialport v12
```

## Run
```bash
npm start             # standard launch (requires Arduino USB)
npm run watch         # with hot reload (electron-reload)
```

## Debug Mode
Edit `js/main.js`, set `debugMode = true` at line 4. This bypasses Arduino and lets you simulate sensors with keyboard keys 1/2/3.

## Common Issues

### `NODE_MODULE_VERSION` mismatch
```bash
npm run postinstall   # runs @electron/rebuild and re-patches serialport compatibility
```

### Linux serial port permission
```bash
sudo chmod 666 /dev/ttyACM0
```
