# Beginner's Guide — every piece of software in pm-bot, explained simply

This repo uses a handful of different tools together. None of them are complicated on their own, but nobody tells you what each one actually *is* before handing you a README full of commands. This guide fixes that — one section per piece of software, in plain language, before you're expected to touch it.

For each one you'll get the same six things:
- **What it is**
- **What it does**
- **Why it's needed**
- **How it works with the rest of the system**
- **When you'll actually use it**
- **A real-world analogy**

Read this once, top to bottom, before following the README or START-HERE.md — everything there will make more sense afterward.

---

## Claude Code — the AI that runs the agents

**What it is:** Claude Code is Anthropic's AI assistant, made to work inside a project folder on your computer (or in a browser session like this one) rather than just chatting in a box. It can read your files, write to them, and follow instructions you leave for it in `.claude/agents/*.md`.

**What it does:** In this repo, Claude Code is what actually *is* `chief-of-staff`, `finance-manager`, `sales-manager`, `marketing-director`, `operations-manager`, and `hr-admin`. Each of those "agents" is really the same AI, given a different job description and told which one file it's allowed to touch.

**Why it's needed:** Everything else in this repo — the Markdown files, the dashboard, the snapshots — is just storage and display. Nothing writes new information into `data/` or answers "what should I focus on this week?" unless Claude Code is running the conversation. It's the only piece here that understands English.

**How it works with the rest of the system:** You type a sentence ("log a $500 payment from Acme Co"). Claude Code figures out which agent that belongs to, reads that agent's current data file, decides what row to add, and edits the file directly. The dashboard and snapshot tool never know or care that this happened until they next read the file off disk.

**When you'll use it:** Every time you're telling the business something new, or asking a question about it — logging a lead, checking your cash balance, asking `chief-of-staff` for priorities. If you're typing a full sentence to get an answer, you're using Claude Code.

**Analogy:** Claude Code is the staff. The `data/` files are the filing cabinet. The dashboard is a window into the filing cabinet. You don't ask the window to do your bookkeeping — you ask the staff, and the window just shows you what they wrote down.

---

## The six agents — one AI, six job descriptions

**What it is:** Each file in `.claude/agents/` (`chief-of-staff.md`, `finance-manager.md`, etc.) is a plain-text instruction sheet — not a separate program, not a separate AI. It's closer to a job description pinned to a specific employee.

**What it does:** It tells Claude Code, for that conversation: which one file you own, what your job is, what tone to use, and — critically — what you're *not* allowed to do (e.g. "never fabricate a number," "never make the final call on spending").

**Why it's needed:** Without a job description, one AI trying to do finance, sales, marketing, HR, and operations at once would blur its own rules together — a finance question might get a marketing-style answer, or vice versa. Splitting it into named roles keeps each one narrow and predictable, and keeps each department's data file owned by exactly one "person."

**How it works with the rest of the system:** `chief-of-staff` is the only one that reads across *all* the data files; the five specialists each read and write exactly one (`data/finance/ledger.md`, `data/sales/pipeline.md`, and so on).

**When you'll use it:** You pick the agent that matches what you're doing — or just default to `chief-of-staff` if you're not sure, and it'll point you the right way.

**Analogy:** One actor, six costumes. Same person underneath, but the costume (and the script that comes with it) determines what they say and do in that scene.

---

## Node.js — the engine the local tools run on

**What it is:** Node.js is a small program installed on a computer that lets JavaScript — normally a language that only runs inside web browsers — run directly on your machine, outside a browser, as its own standalone program.

**What it does:** It's the thing that actually executes `gui/server.js` and `scripts/snapshot.js` when you type `node gui/server.js` in a terminal. Without Node.js installed, typing that command does nothing — there's no engine to run the JavaScript file.

**Why it's needed:** The dashboard and snapshot tool are both written in JavaScript because it's a common, free, dependency-light language for small local tools. Node.js is the one thing you need installed on your computer for either of them to work at all.

**How it works with the rest of the system:** Node.js has no idea what pm-bot is. It's a generic engine — you point it at a `.js` file, it runs that file's code. In this repo, the files it runs happen to read and write your `data/` folder and serve a webpage.

**When you'll use it:** You don't interact with Node.js directly, ever. You interact with the *commands* that use it — `node gui/server.js` to start the dashboard, `node scripts/snapshot.js save` to save a snapshot. If those commands say "command not found," that means Node.js isn't installed on your machine yet.

**Analogy:** Node.js is the DVD player. `gui/server.js` is the DVD. You don't do anything to the DVD player itself — you put a disc in and press play. No player, no movie, regardless of how good the disc is.

---

## The terminal — where you type commands

**What it is:** The terminal (also called "command line" or "shell") is a plain black-and-white (or dark) text window where you type commands instead of clicking icons. On Windows it might be called Command Prompt or PowerShell; on Mac, Terminal; the ideas are the same everywhere.

**What it does:** It lets you tell your computer to do something precise, like "run this specific file with Node.js," without needing a graphical button for every possible action.

**Why it's needed:** Two things in this repo — the dashboard (`node gui/server.js`) and the snapshot tool (`node scripts/snapshot.js`) — are started by typing a command, not by double-clicking an icon. If you never touch either of those, you never need the terminal at all — talking to the agents and using `tools/ops-desk.html` require zero terminal use.

**How it works with the rest of the system:** The terminal doesn't know anything about pm-bot. It's just the doorway you use to hand a command to Node.js.

**When you'll use it:** Only if you want the local dashboard or a data snapshot. If you're happy just talking to the agents and occasionally opening `tools/ops-desk.html` in a browser, you can ignore the terminal entirely.

**Analogy:** The terminal is a walkie-talkie. You speak a short, exact phrase into it, and whatever's listening on the other end (Node.js, git, etc.) does exactly what you said — no more, no less, and it won't guess what you meant if you say it wrong.

---

## Markdown — the format the data is stored in

**What it is:** Markdown is a way of writing plain text files so that headings, tables, and lists look like headings, tables, and lists — without needing a heavyweight program like Microsoft Word to open them. A file ending in `.md` is a Markdown file.

**What it does:** Every piece of your business data — `data/finance/ledger.md`, `data/sales/pipeline.md`, and so on — is a Markdown file. Tables are written using `|` characters; headings start with `#`.

**Why it's needed:** Markdown files are just text, so they're small, they open in literally any text editor on any computer, they're easy for an AI to read and edit precisely, and they're easy for `git` (see below) to track changes to line-by-line. A database or spreadsheet file would make all of that harder for no real benefit at this scale.

**How it works with the rest of the system:** Claude Code writes rows into these files; `gui/server.js` reads them and turns the tables into a webpage; `scripts/snapshot.js` copies them wholesale into a backup folder.

**When you'll use it:** You almost never need to open one of these files yourself — the agents do it for you. But you *can* open `data/finance/ledger.md` in any text editor and read (or even hand-edit) it, since it's just text.

**Analogy:** Markdown is like writing a grocery list with dashes and a title, instead of typing it into a fancy spreadsheet program. Anyone — human or computer — can read a dash-list at a glance, no special software required.

---

## The GUI dashboard (`gui/server.js`) — a live window into your data

**What it is:** A small Node.js program in this repo that starts a tiny local website, viewable at `http://localhost:3000` in your browser, once you run `node gui/server.js`.

**What it does:** It reads every file in `data/<dept>/*.md`, turns each Markdown table into a nicer-looking webpage table, and lets you save/restore point-in-time snapshots of your data from a button on that page.

**Why it's needed:** Talking to agents is great for adding and asking about information, but sometimes you just want to glance at everything at once — all five departments, side by side — without asking a question. This dashboard is that glance.

**How it works with the rest of the system:** It only *reads* your `data/` files (plus running snapshot save/restore) — it never edits them the way the agents do. Refresh the page (or click "Refresh") any time an agent has just written something new, and the dashboard will show it.

**When you'll use it:** Whenever you want a full-picture view, or you want to save a snapshot before trying something risky.

**Analogy:** It's a security-camera monitor for your filing cabinet — you can watch what's in every drawer at once, but you still have to ask the staff (the agents) to actually file something new.

**Important:** this program never sends anything over the internet. It reads files already sitting on your computer's disk and shows them on a webpage that only your own computer can see (`localhost` means "this machine, not the internet").

---

## Snapshots (`scripts/snapshot.js`) — save points for your data

**What it is:** A second small Node.js program, run from the terminal with commands like `node scripts/snapshot.js save`, `list`, or `restore`.

**What it does:** `save` copies the current state of every `data/<dept>/*.md` file into a timestamped folder under `data/snapshots/`. `list` shows you every snapshot you've taken. `restore` copies an old snapshot's files back over your current ones — and automatically takes a fresh "before-restore" snapshot first, so restoring is never a one-way door.

**Why it's needed:** If an agent (or you, hand-editing a file) makes a mistake, snapshots let you undo it — like a save point in a video game, but for your business data.

**How it works with the rest of the system:** It shares its underlying code (`scripts/data-store.js`) with the dashboard, so both agree on exactly where each department's file lives and what the empty starting template looks like.

**When you'll use it:** Before trying something you're not sure about, at the end of a week, or any time you want a clean rollback point. The dashboard's "Local snapshots" panel does the exact same thing with buttons, if you'd rather not type commands.

**Analogy:** It's the "Save Game" and "Load Game" buttons — take a snapshot before a risky change, and if it goes wrong, load the last good one instead of starting over.

---

## Ops Desk (`tools/ops-desk.html`) — the no-terminal option

**What it is:** A single self-contained HTML file. You can open it by double-clicking it, no terminal, no Node.js, no installation — your web browser is the only thing required.

**What it does:** Gives you the same kind of table-editing view as the main dashboard, but it keeps its own private copy of the data inside your browser's storage rather than reading `data/` directly. An **Export** button turns your entries into Markdown text you can hand to an agent, or a JSON file for backup.

**Why it's needed:** For someone who doesn't want to open a terminal at all, this is the lowest-friction way to get numbers typed in somewhere, before ever talking to an agent.

**How it works with the rest of the system:** It's deliberately disconnected — it never touches your `data/` folder. It won't see what an agent just wrote, and an agent won't see what you typed into it, until you use Export and paste the result into the conversation.

**When you'll use it:** If you'd rather fill in a form-like table first and hand it off afterward, instead of dictating numbers in a sentence.

**Analogy:** It's a paper intake form you fill out at home before mailing it in — separate from the office's actual filing system until someone (you, via Export) hands it over.

There's also a Windows version, `tools/ops-desk-windows/dist/OpsDesk.exe` — same tool, packaged so double-clicking it opens a browser tab automatically instead of you opening the `.html` file yourself. Under the hood it's still the identical Ops Desk code, just launched slightly differently.

---

## Git — the history/undo system for the project's code

**What it is:** Git is a version-control tool: it keeps a complete history of every change ever made to the files it's tracking, and lets you go back to any earlier point.

**What it does:** In this repo, git tracks the *code* — the agent instruction files, the dashboard code, the README — not your real business numbers. Your actual `data/finance/ledger.md` and friends are deliberately excluded from git (see `.gitignore`) so your real numbers never accidentally get uploaded anywhere.

**Why it's needed:** It's what lets this whole project be shared, copied, and improved over time without losing track of what changed and when — and it's how the "empty schema" (`data/templates/`) stays separate from your private, local-only real data.

**How it works with the rest of the system:** When Claude Code (or a person) changes a code file and wants to save that as an official step, git records a "commit" — a snapshot of exactly what changed, with a short message explaining why. This is a different, separate mechanism from `scripts/snapshot.js`, which only backs up your *data*, not the project's code.

**When you'll use it:** You mostly won't need to touch git directly for day-to-day use of pm-bot — the agents and dashboard don't require it. You'd only interact with it if you're customizing the code itself and want to save that work formally, or fetching updates.

**Analogy:** Git is "track changes" in a word processor, but for an entire folder of files at once, with the ability to jump back to any previous saved version, not just undo one step at a time.

---

## How it all fits together

```
You (typing a sentence, or filling a form)
        │
        ├── talk to Claude Code ──► reads/writes exactly one data/<dept>/*.md file
        │                                     │
        │                                     ▼
        ├── open the GUI dashboard ──► reads all data/<dept>/*.md files, shows them
        │        (node gui/server.js)         │
        │                                     ▼
        ├── run a snapshot ──► copies data/<dept>/*.md into data/snapshots/<timestamp>/
        │        (node scripts/snapshot.js)
        │
        └── open Ops Desk (no terminal) ──► own private copy, Export to hand off
                 (tools/ops-desk.html)

Underneath all of it:
  Node.js  = the engine that runs gui/server.js and scripts/snapshot.js
  Markdown = the plain-text format every data file is written in
  git      = tracks changes to the project's code (not your real data)
```

Nothing here needs the internet except the one moment Claude Code is actually thinking about your sentence — every other piece (the dashboard, snapshots, Ops Desk, the files themselves) works completely offline, on your own machine.
