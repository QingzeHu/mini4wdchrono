# Glossary

| Term            | Definition |
|-----------------|------------|
| **Manche**      | A set of rounds in tournament mode. Each manche has multiple rounds where 3 players race. |
| **Round**       | A single race of 3 cars on the track. |
| **Free Round**  | Practice mode without tournament tracking. |
| **Lane Order**  | Track layout determines sensor-to-lane mapping (can be 1-2-3 or 1-3-2). Configurable `reverse` flag swaps lanes 1 and 3. |
| **Time Cutoff** | Min/max thresholds based on track length and speed to filter false sensor triggers. Calculated from `timeThreshold` (%) and `speedThreshold` (m/s). |
| **Race Mode 0** | Standard mode — timer starts per car on first sensor pass. |
| **Race Mode 1** | Final mode — all timers start simultaneously. |
| **outOfBounds**   | Car state when it exceeds max time limit or doesn't start within the delay window. Time set to 99999. |
| **Finals**      | Auto-generated final rounds after all regular manches complete. Top players qualify for semifinal and final manches. |
