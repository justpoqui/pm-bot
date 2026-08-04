# pm-bot — Personal Management Team

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

## Getting started

The `data/` files start empty (all placeholder rows). To get real value fast:

1. Tell `finance-manager` your actual starting cash balance.
2. Tell `sales-manager` about any leads/deals currently in progress.
3. Tell `operations-manager` your top 3-5 open tasks and any vendors you rely on.
4. Ask `chief-of-staff` for a first-week priority list once the above is seeded.

## Design notes

- Data is stored as plain Markdown tables — human-readable, diffable in git, no database required.
- Agents stay in their lane: each owns one data file, `chief-of-staff` reads across all of them but doesn't duplicate their record-keeping.
- Legal, tax, and compliance questions are explicitly out of scope for `finance-manager` and `hr-admin` — they'll flag those for a real accountant/lawyer rather than guessing.
