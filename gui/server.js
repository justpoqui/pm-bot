#!/usr/bin/env node
// Zero-dependency dashboard server for the pm-bot data/ files.
// Reads the markdown tables each subagent maintains and serves them as JSON + a static UI.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3000;

const DEPARTMENTS = [
  { key: 'finance', label: 'Finance', file: 'data/finance/ledger.md' },
  { key: 'sales', label: 'Sales', file: 'data/sales/pipeline.md' },
  { key: 'marketing', label: 'Marketing', file: 'data/marketing/campaigns.md' },
  { key: 'operations', label: 'Operations', file: 'data/operations/tasks.md' },
  { key: 'hr', label: 'HR & Admin', file: 'data/hr/roster.md' },
];

const PLACEHOLDER = /^_\(.*\)_$/;

function splitRow(line) {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

function isSeparatorRow(line) {
  return /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes('-');
}

function parseMarkdown(content) {
  const lines = content.split('\n');
  let title = '';
  const sections = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('# ') && !title) {
      title = line.slice(2).trim();
      continue;
    }

    if (line.startsWith('## ')) {
      current = { heading: line.slice(3).trim(), table: null, notes: [] };
      sections.push(current);
      continue;
    }

    if (!current) continue;

    if (line.trim().startsWith('|')) {
      const headers = splitRow(line);
      const next = lines[i + 1] || '';
      if (isSeparatorRow(next)) {
        i += 1;
        const rows = [];
        let j = i + 1;
        while (j < lines.length && lines[j].trim().startsWith('|')) {
          rows.push(splitRow(lines[j]));
          j += 1;
        }
        i = j - 1;
        const cleanRows = rows.filter(
          (r) => !(r.length && PLACEHOLDER.test(r[0]))
        );
        current.table = { headers, rows: cleanRows };
      }
      continue;
    }

    const trimmed = line.trim();
    if (trimmed && !trimmed.match(PLACEHOLDER)) {
      current.notes.push(trimmed.replace(/^-\s*/, ''));
    }
  }

  return { title, sections };
}

function loadDepartments() {
  return DEPARTMENTS.map((dept) => {
    const full = path.join(ROOT, dept.file);
    let parsed = { title: dept.label, sections: [] };
    let error = null;
    try {
      parsed = parseMarkdown(fs.readFileSync(full, 'utf8'));
    } catch (err) {
      error = `Could not read ${dept.file}: ${err.message}`;
    }
    return { key: dept.key, label: dept.label, file: dept.file, error, ...parsed };
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function serveStatic(req, res) {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(PUBLIC_DIR, urlPath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/data') {
    const body = JSON.stringify({ departments: loadDepartments(), generatedAt: new Date().toISOString() });
    res.writeHead(200, { 'Content-Type': MIME['.json'] });
    res.end(body);
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`pm-bot dashboard running at http://localhost:${PORT}`);
});
