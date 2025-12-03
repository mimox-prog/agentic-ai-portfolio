const fs = require('fs');
const file = 'data/approvals.json';
const p = JSON.parse(fs.readFileSync(file, 'utf8') || '{}');
const map = new Map();
(p.requests || []).forEach(r => {
  const key = (r.projectId || '') + '|' + (r.step && r.step.action ? r.step.action : '');
  const prev = map.get(key);
  if (!prev || new Date(r.createdAt || 0) > new Date(prev.createdAt || 0)) map.set(key, r);
});
p.requests = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
fs.writeFileSync(file, JSON.stringify(p, null, 2));
console.log('deduped approvals, remaining:', p.requests.length);
