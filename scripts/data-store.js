// Single source of truth for where each department's local-only data file
// lives, and how to bootstrap it from the tracked template on first run.
// Used by gui/server.js and scripts/snapshot.js so both agree on paths.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const DEPARTMENTS = [
  { key: 'finance', label: 'Finance', file: 'data/finance/ledger.md', template: 'data/templates/finance/ledger.md' },
  { key: 'sales', label: 'Sales', file: 'data/sales/pipeline.md', template: 'data/templates/sales/pipeline.md' },
  { key: 'marketing', label: 'Marketing', file: 'data/marketing/campaigns.md', template: 'data/templates/marketing/campaigns.md' },
  { key: 'operations', label: 'Operations', file: 'data/operations/tasks.md', template: 'data/templates/operations/tasks.md' },
  { key: 'hr', label: 'HR & Admin', file: 'data/hr/roster.md', template: 'data/templates/hr/roster.md' },
];

// Creates data/<dept>/... from data/templates/<dept>/... wherever the
// local (gitignored) file doesn't exist yet — e.g. right after a fresh
// clone, since data/finance/, data/sales/, etc. are never in git.
function ensureLocalData() {
  for (const dept of DEPARTMENTS) {
    const full = path.join(ROOT, dept.file);
    if (!fs.existsSync(full)) {
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.copyFileSync(path.join(ROOT, dept.template), full);
    }
  }
}

module.exports = { ROOT, DEPARTMENTS, ensureLocalData };
