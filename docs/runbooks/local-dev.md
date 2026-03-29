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
choco install python2
choco install arduino
choco install nodejs --version=10.16.3
npm install -g windows-build-tools
```

## Setup
```bash
cd mini4wdchrono
nodenv install        # macOS only
npm install           # also runs electron-rebuild via postinstall
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
npm run postinstall   # runs electron-rebuild
```

### Linux serial port permission
```bash
sudo chmod 666 /dev/ttyACM0
```
