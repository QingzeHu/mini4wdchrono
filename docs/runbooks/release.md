# Release

## Package Builds

### macOS
```bash
./utils/build-darwin.sh
# or manually:
electron-packager . Mini4wdChrono --overwrite --icon=images/ic_launcher_web.icns --prune=true --out=release-builds
```

### Windows (PowerShell)
```bash
./utils/build-win64.ps1
# or manually:
electron-packager . Mini4wdChrono --overwrite --asar --icon=images/ic_launcher_web.ico --prune=true --out=release-builds
```

### Linux (x64)
```bash
./utils/build-linux-x64.sh
```

## Output
Packaged builds are placed in `release-builds/`.

## Release Distribution
Releases are published on GitHub: https://github.com/Pimentoso/mini4wdchrono/releases
