# Ops Desk for Windows

A standalone `.exe` version of [Ops Desk](../ops-desk.html) — same dashboard, same tables, same everything. Double-click it, it opens in your default browser, and it works fully offline (no claude.ai link needed).

## What it actually is

A tiny local web server bundled into a single executable (via [`pkg`](https://github.com/vercel/pkg)). Double-clicking `OpsDesk.exe`:
1. Starts a server on `http://127.0.0.1:47821` (a fixed port, always the same).
2. Opens your default browser to that address.
3. Ops Desk runs exactly as it does in the browser/hosted version — same code, unmodified.

Your data is stored in that browser's local storage for `http://127.0.0.1:47821` — because the port never changes between runs, your data is still there the next time you launch it. A console window stays open while it's running; closing that window stops Ops Desk. Launching it again while it's already running just reopens your browser to it instead of erroring.

**Known limitation:** local storage is per-browser. If you use a different browser as your default, or clear that browser's site data, your entries won't carry over. Use Ops Desk's own **Export** button (Markdown + JSON) to back things up independent of the browser.

**About the console window:** this is expected — it's how you know the server is running, and there's no way around it with this lightweight approach without moving to a heavier packaging method (Electron). Windows may also show an "unrecognized publisher" warning on first run since this isn't code-signed — that's normal for an unsigned personal tool, not a sign of a problem.

## Rebuilding it

```
npm install -g pkg   # once
bash build.sh
```

Produces `dist/OpsDesk.exe`. The build script copies the current `../ops-desk.html` in fresh each time, so this never drifts out of sync with the browser version — there is exactly one copy of the actual app; this folder only adds the Windows launcher around it.
