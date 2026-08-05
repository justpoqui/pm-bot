#!/usr/bin/env node
// Zero-dependency dashboard server for the pm-bot data/ files.
// Reads the markdown tables each subagent maintains and serves them as JSON + a static UI.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { ROOT, DEPARTMENTS, ensureLocalData } = require('../scripts/data-store');
const snapshots = require('../scripts/snapshot');

const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3000;

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

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': MIME['.json'] });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  ensureLocalData();

  if (req.url === '/api/data' && req.method === 'GET') {
    sendJson(res, 200, { departments: loadDepartments(), generatedAt: new Date().toISOString() });
    return;
  }

  if (req.url === '/api/snapshots' && req.method === 'GET') {
    sendJson(res, 200, { snapshots: snapshots.list() });
    return;
  }

  if (req.url === '/api/snapshots' && req.method === 'POST') {
    try {
      const { label } = await readJsonBody(req);
      const meta = snapshots.save(label);
      sendJson(res, 200, { saved: meta });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  if (req.url === '/api/snapshots/restore' && req.method === 'POST') {
    try {
      const { id } = await readJsonBody(req);
      const restoredId = snapshots.restore(id);
      sendJson(res, 200, { restored: restoredId });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  serveStatic(req, res);
});

ensureLocalData();
server.listen(PORT, () => {
  console.log(`pm-bot dashboard running at http://localhost:${PORT}`);
  console.log('Data is read from and written to your local disk only — nothing here is ever committed to git.');
});
