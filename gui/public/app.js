const DEPT_META = {
  finance:    { icon: '\u{1F4B0}', slotVar: '--slot-finance' },
  sales:      { icon: '\u{1F91D}', slotVar: '--slot-sales' },
  marketing:  { icon: '\u{1F4E3}', slotVar: '--slot-marketing' },
  operations: { icon: '\u{1F5C2}️', slotVar: '--slot-operations' },
  hr:         { icon: '\u{1F465}', slotVar: '--slot-hr' },
};

const STATUS_WORDS = {
  good: ['won', 'paid', 'done', 'completed'],
  warning: ['pending', 'due', 'in progress'],
  critical: ['lost', 'overdue', 'cancelled', 'canceled'],
};

function statusClass(value) {
  const v = (value || '').trim().toLowerCase();
  for (const [cls, words] of Object.entries(STATUS_WORDS)) {
    if (words.includes(v)) return cls;
  }
  return null;
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'text') node.textContent = val;
    else node.setAttribute(key, val);
  }
  for (const child of [].concat(children)) {
    if (child) node.appendChild(child);
  }
  return node;
}

function renderCell(colName, value) {
  const isStatusCol = /status|stage|outcome/i.test(colName);
  if (isStatusCol) {
    const cls = statusClass(value);
    if (cls) {
      return el('span', { class: `badge ${cls}`, text: value });
    }
  }
  return document.createTextNode(value || '');
}

function renderTable(section) {
  const { table } = section;
  if (!table) return null;
  if (!table.rows.length) {
    return el('p', { class: 'empty-state', text: 'No data yet.' });
  }
  const thead = el('thead', {}, el('tr', {}, table.headers.map((h) => el('th', { text: h }))));
  const tbody = el(
    'tbody',
    {},
    table.rows.map((row) =>
      el(
        'tr',
        {},
        row.map((cell, i) => el('td', {}, renderCell(table.headers[i], cell)))
      )
    )
  );
  const wrap = el('div', { class: 'table-wrap' });
  wrap.appendChild(el('table', {}, [thead, tbody]));
  return wrap;
}

function renderSection(section) {
  const wrap = el('div', { class: 'dept-section' });
  wrap.appendChild(el('h3', { text: section.heading }));
  const tableEl = renderTable(section);
  if (tableEl) wrap.appendChild(tableEl);
  if (section.notes.length) {
    wrap.appendChild(
      el('ul', { class: 'notes-list' }, section.notes.map((n) => el('li', { text: n })))
    );
  }
  if (!tableEl && !section.notes.length) {
    wrap.appendChild(el('p', { class: 'empty-state', text: 'No data yet.' }));
  }
  return wrap;
}

function renderDept(dept) {
  const meta = DEPT_META[dept.key] || {};
  const card = el('section', { class: 'dept-card' });
  card.style.setProperty('--dot-color', `var(${meta.slotVar || '--slot-finance'})`);
  card.appendChild(
    el('h2', {}, [
      el('span', { class: 'dept-dot' }),
      document.createTextNode(`${meta.icon || ''} ${dept.label}`.trim()),
    ])
  );
  if (dept.error) {
    card.appendChild(el('p', { class: 'dept-error', text: dept.error }));
    return card;
  }
  dept.sections.forEach((section) => card.appendChild(renderSection(section)));
  return card;
}

function countDataRows(dept, headingMatch) {
  const section = dept.sections.find((s) => headingMatch.test(s.heading));
  if (!section || !section.table) return 0;
  return section.table.rows.length;
}

function financeBalance(dept) {
  const section = dept.sections.find((s) => /transactions/i.test(s.heading));
  if (!section || !section.table || !section.table.rows.length) return '$0.00';
  const last = section.table.rows[section.table.rows.length - 1];
  const balanceIdx = section.table.headers.findIndex((h) => /balance/i.test(h));
  const val = balanceIdx >= 0 ? last[balanceIdx] : '';
  return val || '$0.00';
}

function renderStatTiles(departments) {
  const byKey = Object.fromEntries(departments.map((d) => [d.key, d]));
  const tiles = [
    { label: 'Cash balance', value: byKey.finance ? financeBalance(byKey.finance) : '—', slotVar: '--slot-finance' },
    { label: 'Open leads', value: byKey.sales ? countDataRows(byKey.sales, /open leads/i) : 0, slotVar: '--slot-sales' },
    { label: 'Active campaigns', value: byKey.marketing ? countDataRows(byKey.marketing, /active campaigns/i) : 0, slotVar: '--slot-marketing' },
    { label: 'Open tasks', value: byKey.operations ? countDataRows(byKey.operations, /open tasks/i) : 0, slotVar: '--slot-operations' },
    { label: 'Support items open', value: byKey.hr ? countDataRows(byKey.hr, /customer support/i) : 0, slotVar: '--slot-hr' },
  ];
  const row = document.getElementById('stat-tiles');
  row.innerHTML = '';
  tiles.forEach((t) => {
    const tile = el('div', { class: 'stat-tile' });
    tile.style.setProperty('--tile-accent', `var(${t.slotVar})`);
    tile.appendChild(el('p', { class: 'label', text: t.label }));
    tile.appendChild(el('p', { class: 'value', text: String(t.value) }));
    row.appendChild(tile);
  });
}

async function load() {
  const res = await fetch('/api/data');
  const data = await res.json();

  document.getElementById('generated-at').textContent =
    `Reading data/ directly — last loaded ${new Date(data.generatedAt).toLocaleTimeString()}`;

  renderStatTiles(data.departments);

  const container = document.getElementById('departments');
  container.innerHTML = '';
  data.departments.forEach((dept) => container.appendChild(renderDept(dept)));
}

document.getElementById('refresh').addEventListener('click', load);
load();
