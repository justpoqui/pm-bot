# 👉 Start here

You have a personal management team sitting in this repo and no numbers in it yet. This is the short version of what to do about that — everything else in the README is reference material for later.

## The 30-second version

Six Claude Code agents (`chief-of-staff` + five specialists) read and write plain Markdown files under `data/` to track your business. Talk to them like coworkers. Nothing here requires you to know git, Markdown, or a terminal — pick whichever of the three paths below matches how you'd rather work.

## Pick one way to get your first numbers in

You don't need all three. Pick one, use it for real, switch later if it stops fitting.

**A — Talk to the agents directly** (fastest if you're already in Claude Code)
Say what's true and let the right agent log it:
- *"My starting cash balance is $[X]"* → `finance-manager`
- *"I've got a lead from [name], they want [thing]"* → `sales-manager`
- *"My top 3 things to do this week are..."* → `operations-manager`

**B — Fill out the spreadsheet, then hand it off**
Use the Excel template you already have. Fill in whatever you know — leave the rest blank. When ready, tell `finance-manager`/`sales-manager`/etc. what you entered, or paste rows straight into the matching `data/<dept>/*.md` file.

**C — Use Ops Desk (no terminal at all)**
Open **[Ops Desk](https://claude.ai/code/artifact/11da6753-1bc3-40f1-9cd3-35500bad718a)** in a browser and fill in tables directly — it's built for exactly this. It keeps its own copy (not synced to `data/`), so when you want the agents to see what you entered, use its **Export** button and hand the Markdown output to the matching agent. *(A copy also lives at `tools/ops-desk.html` in this repo — same tool, no hosting required.)*

## Then what

Once anything is in — even just one number — ask `chief-of-staff`:

> "What should I focus on this week?"

It reads across every department and gives you a short, ranked list instead of a wall of status. Come back to that question weekly; that's the intended rhythm, not a one-time setup step.

## Map of this repo, if you get lost

| Where | What it is |
|---|---|
| `.claude/agents/` | The six agents' instructions — how each one thinks and what it owns |
| `data/templates/` | The empty schema, tracked in git — safe to look at, never has your real numbers |
| `data/<dept>/*.md` | Your real numbers — gitignored, local to whichever machine/session wrote them |
| `data/snapshots/` | Save points for your real data (`node scripts/snapshot.js save/list/restore`) |
| `gui/` | Local dashboard reading `data/` live — run with `node gui/server.js` |
| `tools/ops-desk.html` | No-shell browser dashboard, own local storage, Export to hand data to the agents |

## If something feels off

- **"My data disappeared."** Real data is gitignored on purpose (see `data/templates/` above) — it never leaves the machine/session it was entered on. If you're switching machines or sessions, use a snapshot (`gui/`) or Export (Ops Desk) to carry it over.
- **"I don't know which agent to ask."** Default to `chief-of-staff` — it'll route you or answer directly.
- **"I want this for another business too."** This whole repo was copied once already for a second business (a separate repo, same structure) — ask and it can happen again.
