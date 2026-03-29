# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mini4wdChrono — Electron 28 desktop app, 3-lane lap timer for Mini 4WD Japan Cup races. Arduino + IR sensors via USB.

## Quick Commands

```bash
npm install           # install + @electron/rebuild + serialport patches
npm start             # launch (requires Arduino USB)
npm run watch         # launch with hot reload
npm run postinstall   # fix native module version mismatch
```

No linter. No real tests (`test/main.test.js` is a placeholder).

## Documentation Index

| Document | Path | Content |
|----------|------|---------|
| Project Overview | [`docs/project-memory/overview.md`](docs/project-memory/overview.md) | Tech stack, external deps |
| Architecture | [`docs/project-memory/architecture.md`](docs/project-memory/architecture.md) | Module structure, data flow |
| Coding Rules | [`docs/project-memory/coding-rules.md`](docs/project-memory/coding-rules.md) | Patterns, conventions |
| Known Quirks | [`docs/project-memory/known-quirks.md`](docs/project-memory/known-quirks.md) | Gotchas, workarounds |
| Glossary | [`docs/project-memory/glossary.md`](docs/project-memory/glossary.md) | Domain terms (manche, lane order, etc.) |
| Current Focus | [`docs/project-memory/current-focus.md`](docs/project-memory/current-focus.md) | Recent changes, priorities |
| Local Dev | [`docs/runbooks/local-dev.md`](docs/runbooks/local-dev.md) | Setup, debug mode |
| Release | [`docs/runbooks/release.md`](docs/runbooks/release.md) | Packaging builds |
| Debugging | [`docs/runbooks/incident-debugging.md`](docs/runbooks/incident-debugging.md) | Logs, sensors, config issues |

## Claude Code Commands

- `/update-memory` — Refresh project memory docs from recent changes
- `/review-architecture` — Compare code against architecture doc
