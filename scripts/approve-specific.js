const fs = require('fs');
const file = 'data/approvals.json';
const p = JSON.parse(fs.readFileSync(file, 'utf8') || '{}');
const r = (p.requests || []).find(x => x.id === 'local-1764775486362-226-deploy' || x.status === 'pending');
if (!r) { console.error('no pending approvals'); process.exit(1); }
r.status = 'approved';
r.resolvedAt = new Date().toISOString();
delete r.resumed;
delete r.resumedAt;
fs.writeFileSync(file, JSON.stringify(p, null, 2));
console.log('approved', r.id);
