const fs = require('fs');
const file = 'data/approvals.json';
const idToApprove = 'local-1764766868033-815-deploy';
const raw = fs.readFileSync(file, 'utf8') || '{}';
const p = JSON.parse(raw);
const r = (p.requests || []).find(x => x.id === idToApprove);
if (!r) { console.error('request not found:', idToApprove); process.exit(1); }
r.status = 'approved';
r.resolvedAt = new Date().toISOString();
fs.writeFileSync(file, JSON.stringify(p, null, 2));
console.log('approved', r.id);
