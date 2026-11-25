/**
 * Keyword scoring over the merged catalog.
 *
 * This is the same BM25-lite approach the upstream package uses, reimplemented
 * here because the upstream scorer only accepts Refero-shaped list items and
 * cannot be pointed at the merged catalog.
 *
 * It is deliberately local-only: no embedding API, no network. That keeps the
 * server usable fully offline. If `OPENAI_API_KEY` is set the upstream server
 * would prefer embeddings — that path still exists for the upstream half, but
 * this scorer is the fallback and the only one used by the generic tools.
 */

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from",
  "has", "have", "he", "in", "is", "it", "its", "of", "on", "or", "she",
  "that", "the", "they", "this", "to", "was", "were", "will", "with",
  "i", "you", "we", "our", "your",
]);

export function tokenize(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * The text a design is searchable by. Both sources contribute:
 * name, north star, theme, industry, fonts, colours, and — for OpenDesign —
 * the category and the opening of the design prose.
 */
export function searchText(item) {
  const parts = [
    item.siteName,
    item.northStar,
    item.industry,
    item.source,
    // Theme is a first-class filter, so it should be findable too.
    item.colorScheme,
    ...(item.fonts || []),
    ...(item.colors || []).map((c) => `${c.name || ""} ${c.hex || ""}`),
    ...(item.tags || []),
    ...(item.moods || []),
    ...(item.surfaces || []),
    item.domain,
    item.styleProfile?.siteName,
  ];
  return parts.filter(Boolean).join("\n");
}

/**
 * Score every item against a query using BM25 with IDF weighting.
 * @returns {Array<{id: string, score: number}>}
 */
export function score(query, items) {
  const queryTerms = Array.from(new Set(tokenize(query)));
  if (queryTerms.length === 0) return items.map((item) => ({ id: item.id, score: 0 }));

  const N = items.length;
  const qLen = queryTerms.length;
  const queryIndex = new Map();
  for (let i = 0; i < qLen; i++) queryIndex.set(queryTerms[i], i);

  const df = new Int32Array(qLen);
  const docCounts = new Array(N);

  for (let i = 0; i < N; i++) {
    const item = items[i];
    const terms = item._tokens || (item._tokens = tokenize(item.text ?? ""));
    let counts = null;
    for (let j = 0; j < terms.length; j++) {
      const qi = queryIndex.get(terms[j]);
      if (qi === undefined) continue;
      if (!counts) counts = new Int32Array(qLen);
      if (counts[qi] === 0) df[qi]++;
      counts[qi]++;
    }
    docCounts[i] = counts;
  }

  const idf = new Float64Array(qLen);
  for (let qi = 0; qi < qLen; qi++) {
    const d = df[qi] || 1;
    idf[qi] = Math.log(1 + (N - d + 0.5) / (d + 0.5));
  }

  const out = new Array(N);
  for (let i = 0; i < N; i++) {
    const counts = docCounts[i];
    let totalScore = 0;
    if (counts) {
      for (let qi = 0; qi < qLen; qi++) {
        const f = counts[qi];
        if (f > 0) totalScore += idf[qi] * (f / (f + 1.5));
      }
    }
    out[i] = { id: items[i].id, score: totalScore };
  }
  return out;
}
