# pm-bot — Personal Management Team

> **New here?** 👉 **[START-HERE.md](./START-HERE.md)** — the short version. Everything below is reference material for once you're up and running.

A small team of Claude Code subagents that act as the management team for a solo/small business owner. Each agent is a specialist role; a chief of staff coordinates them and keeps you focused on what matters this week.

Marketing and sales are the priority focus for this business — those two roles are tuned to push for action, not just advice.

## The team

| Agent | Role | Data file |
|-------|------|-----------|
| `chief-of-staff` | Entry point. Prioritizes across departments, delegates, synthesizes updates. | reads all |
| `marketing-director` | Campaigns, content, brand, social/SEO, promotions. | `data/marketing/campaigns.md` |
| `sales-manager` | Lead pipeline, follow-ups, deals, outreach. | `data/sales/pipeline.md` |
| `finance-manager` | Income/expenses, invoicing, cash flow, budgeting. | `data/finance/ledger.md` |
| `operations-manager` | Scheduling, tasks, vendors, inventory. | `data/operations/tasks.md` |
| `hr-admin` | Hiring, policies, admin paperwork, customer support triage. | `data/hr/roster.md` |

## How to use it

This repo is meant to be opened in Claude Code (CLI or web). Once it's your working directory, the agents in `.claude/agents/` are available automatically.

- **Not sure where to start?** Talk to `chief-of-staff` — e.g. "what should I focus on this week?"
- **Know exactly what you need?** Go straight to the specialist — e.g. ask `sales-manager` to log a new lead, or `finance-manager` whether you can afford a purchase.
- Each agent reads its `data/` file before answering and updates it as things change, so the team's memory persists across sessions — the `data/` folder is the actual state of your business, not just notes.

## Local-only data & snapshots

**Your real numbers never go into git — only the file structure does.**

| What | Where | In git? |
|---|---|---|
| Schema / starting point (empty tables) | `data/templates/<dept>/*.md` | ✅ tracked |
| Your actual data | `data/<dept>/*.md` (e.g. `data/finance/ledger.md`) | 🚫 gitignored |
| Point-in-time backups | `data/snapshots/<timestamp>/` | 🚫 gitignored |

- **Where it lives:** the same `data/finance/ledger.md`-style paths as before — agents and the GUI both read/write these directly. What changed is that `.gitignore` now excludes everything under `data/` except `data/templates/`, so `git add`/`git commit`/`git push` can never pick up real business data, even by accident.
- **How data gets added:** the same way as before — talk to the agents (e.g. "log a $500 payment from Acme Co" to `finance-manager`) and they edit the relevant `data/<dept>/*.md` file in place. You can also hand-edit the markdown files yourself.
- **How it's tabled/saved:** plain Markdown tables, one file per department, written straight to your local disk — no database, nothing sent anywhere.
- **First run / fresh clone:** `data/<dept>/` folders don't exist yet (they're gitignored, so a fresh `git clone` won't have them). The first time you run `node gui/server.js` or `node scripts/snapshot.js <cmd>`, they're auto-created from `data/templates/`.

### Snapshots (save & restore local state)

A snapshot copies the current `data/<dept>/*.md` files into a timestamped folder under `data/snapshots/` — a save point you can get back to. Restoring is non-destructive: it auto-snapshots your current state first (tagged `before-restore`), so you can always undo an undo.

Via the dashboard: open the **Local snapshots** panel at the top of the page — save with an optional label, or restore any past one.

Via CLI:
```
node scripts/snapshot.js save "end-of-week"   # save a labeled snapshot
node scripts/snapshot.js list                 # list snapshots, newest first
node scripts/snapshot.js restore latest        # restore the most recent snapshot
node scripts/snapshot.js restore <id>          # restore a specific one
```

> **Running this on Claude Code on the web?** This "local-only" guarantee means data lives in that session's container disk, not in git — which also means it does **not** survive the container being recycled between sessions. For data that's genuinely picked back up next time, run `pm-bot` locally (clone the repo, run `claude`/the GUI on your own machine) where the filesystem is actually persistent.

## Dashboard GUI

A web dashboard lives in `gui/` — it reads the `data/` markdown files directly and renders them as stat tiles and tables (plus the snapshot panel above), so you can see the business state at a glance without opening each file.

```
node gui/server.js
```

Then open http://localhost:3000. No dependencies to install (Node's built-in `http` module only). Refresh the page (or click "Refresh") to pick up changes an agent just made to `data/`.

## Getting started

The `data/` files start empty (all placeholder rows). To get real value fast:

1. Tell `finance-manager` your actual starting cash balance.
2. Tell `sales-manager` about any leads/deals currently in progress.
3. Tell `operations-manager` your top 3-5 open tasks and any vendors you rely on.
4. Ask `chief-of-staff` for a first-week priority list once the above is seeded.

## Design notes

- Data is stored as plain Markdown tables — human-readable, no database required. Only the empty schema (`data/templates/`) is diffable in git; real data stays local-only (see above).
- Agents stay in their lane: each owns one data file, `chief-of-staff` reads across all of them but doesn't duplicate their record-keeping.
- Legal, tax, and compliance questions are explicitly out of scope for `finance-manager` and `hr-admin` — they'll flag those for a real accountant/lawyer rather than guessing.
