// src/lib/simpleSearch.ts
// Zero-dependency TF-IDF + cosine similarity for small local indexes.
// Exports: buildIndex(docs) and queryIndex(index, query, topK)

export type Doc = { id: string; text: string; meta?: Record<string, any> };

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[\W_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function termFreq(tokens: string[]) {
  const tf: Record<string, number> = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  const len = tokens.length || 1;
  for (const k of Object.keys(tf)) tf[k] = tf[k] / len;
  return tf;
}

function idf(docsTokens: string[][]) {
  const N = docsTokens.length || 1;
  const df: Record<string, number> = {};
  for (const tokens of docsTokens) {
    const seen = new Set<string>();
    for (const t of tokens) {
      if (!seen.has(t)) {
        df[t] = (df[t] || 0) + 1;
        seen.add(t);
      }
    }
  }
  const idfMap: Record<string, number> = {};
  for (const term of Object.keys(df)) {
    idfMap[term] = Math.log(1 + N / (df[term] || 1));
  }
  return idfMap;
}

function dot(a: Record<string, number>, b: Record<string, number>) {
  let s = 0;
  for (const k of Object.keys(a)) {
    if (b[k]) s += a[k] * b[k];
  }
  return s;
}

function norm(v: Record<string, number>) {
  let s = 0;
  for (const k of Object.keys(v)) s += v[k] * v[k];
  return Math.sqrt(s) || 1;
}

export function buildIndex(docs: Doc[]) {
  const docsTokens = docs.map((d) => tokenize(d.text));
  const idfMap = idf(docsTokens);
  const docsTfIdf = docsTokens.map((tokens) => {
    const tf = termFreq(tokens);
    const tfidf: Record<string, number> = {};
    for (const t of Object.keys(tf)) {
      tfidf[t] = tf[t] * (idfMap[t] || 0);
    }
    return tfidf;
  });
  const norms = docsTfIdf.map((v) => norm(v));
  return { docs, docsTfIdf, idfMap, norms };
}

export function queryIndex(index: ReturnType<typeof buildIndex>, q: string, topK = 5) {
  const qTokens = tokenize(q);
  const qTf = termFreq(qTokens);
  const qTfidf: Record<string, number> = {};
  for (const t of Object.keys(qTf)) {
    qTfidf[t] = qTf[t] * (index.idfMap[t] || Math.log(1 + index.docs.length));
  }
  const qNorm = norm(qTfidf);

  const scores: { id: string; score: number; doc: Doc }[] = [];
  for (let i = 0; i < index.docs.length; i++) {
    const docVec = index.docsTfIdf[i];
    const score = dot(qTfidf, docVec) / (qNorm * (index.norms[i] || 1));
    scores.push({ id: index.docs[i].id, score: Number.isFinite(score) ? score : 0, doc: index.docs[i] });
  }
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK).map((s) => s.doc);
}
