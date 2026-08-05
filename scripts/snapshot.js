#!/usr/bin/env node
// Local-only snapshot save/list/restore for the data/ files.
// Snapshots live under data/snapshots/ (gitignored) — nothing here ever
// touches git. Usage: node scripts/snapshot.js <save|list|restore> [label|id]

const fs = require('fs');
const path = require('path');
const { ROOT, DEPARTMENTS, ensureLocalData } = require('./data-store');

const SNAPSHOT_DIR = path.join(ROOT, 'data', 'snapshots');

function timestampId() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function save(label) {
  ensureLocalData();
  const safeLabel = label ? label.trim().replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 40) : null;
  const id = safeLabel ? `${timestampId()}__${safeLabel}` : timestampId();
  const dir = path.join(SNAPSHOT_DIR, id);
  fs.mkdirSync(dir, { recursive: true });
  for (const dept of DEPARTMENTS) {
    fs.copyFileSync(path.join(ROOT, dept.file), path.join(dir, `${dept.key}.md`));
  }
  const meta = { id, label: safeLabel, savedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
  return meta;
}

function list() {
  if (!fs.existsSync(SNAPSHOT_DIR)) return [];
  return fs
    .readdirSync(SNAPSHOT_DIR)
    .filter((name) => fs.existsSync(path.join(SNAPSHOT_DIR, name, 'meta.json')))
    .map((name) => JSON.parse(fs.readFileSync(path.join(SNAPSHOT_DIR, name, 'meta.json'), 'utf8')))
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}

function resolveId(id) {
  const all = list();
  if (!all.length) return null;
  if (!id || id === 'latest') return all[0].id;
  return all.find((s) => s.id === id) ? id : null;
}

// Restoring is never destructive: it snapshots the current state first,
// so "undo" is always just restoring the snapshot tagged before-restore.
function restore(id) {
  const resolved = resolveId(id);
  if (!resolved) throw new Error(`No snapshot found for "${id}"`);
  save('before-restore');
  const dir = path.join(SNAPSHOT_DIR, resolved);
  for (const dept of DEPARTMENTS) {
    fs.copyFileSync(path.join(dir, `${dept.key}.md`), path.join(ROOT, dept.file));
  }
  return resolved;
}

module.exports = { save, list, restore, resolveId, SNAPSHOT_DIR };

if (require.main === module) {
  const [, , cmd, arg] = process.argv;
  if (cmd === 'save') {
    const meta = save(arg);
    console.log(`Saved snapshot: ${meta.id}`);
  } else if (cmd === 'list') {
    const all = list();
    if (!all.length) console.log('No snapshots yet.');
    else all.forEach((s) => console.log(`${s.id}${s.label ? ` (${s.label})` : ''} — ${s.savedAt}`));
  } else if (cmd === 'restore') {
    console.log(`Restored from: ${restore(arg)}`);
  } else {
    console.log('Usage: node scripts/snapshot.js <save|list|restore> [label|id]');
    process.exit(1);
  }
}
