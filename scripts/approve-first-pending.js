const fs = require('fs');
const file = 'data/approvals.json';
const raw = fs.readFileSync(file, 'utf8') || '{}';
const p = JSON.parse(raw);
const pending = (p.requests || []).find(r => r.status === 'pending');
if (!pending) {
  console.error('no pending approvals found');
  process.exit(1);
}
pending.status = 'approved';
pending.resolvedAt = new Date().toISOString();
fs.writeFileSync(file, JSON.stringify(p, null, 2));
console.log('approved', pending.id);
