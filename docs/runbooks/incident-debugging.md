# Incident Debugging

## Log Files
The app uses `electron-log`. Click the "Log file" button in the About tab, or find logs at:
- **macOS**: `~/Library/Logs/Mini4wdChrono/log.log`
- **Windows**: `%USERPROFILE%\AppData\Roaming\Mini4wdChrono\logs\log.log`

## Board Connection Issues
Check the log for `Board FAIL` or `Board ERROR` events. Common causes:
- Arduino not connected via USB
- Wrong USB port configured (check `configuration.js` → `usbPort`)
- Serial port permission denied (Linux: `chmod 666 /dev/ttyACM0`)

## Sensor False Reads
Time cutoff thresholds filter invalid signals. If sensors trigger incorrectly:
- Check `timeThreshold` (percentage, default 40%) and `speedThreshold` (m/s, default 5) in race settings
- Calculated cutoffs: `rTimeCutoffMin` and `rTimeCutoffMax` in `chrono.js`
- Minimum cutoff floor: 1000ms

## Configuration Corruption
If `settings.json` becomes corrupt, the app auto-resets it and saves a backup as `settings.json.bak`. A dialog notifies the user.

## Race Data
Race files stored in `userData/races/*.json`. Each file contains all rounds, tournament data, and settings for one race session.
