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
  const dfMap = new Map();
  const tokenized = items.map((item) => {
    const terms = item._tokens || tokenize(item.text ?? "");
    item._tokens = terms;
    const unique = new Set(terms);
    for (const t of unique) {
      dfMap.set(t, (dfMap.get(t) || 0) + 1);
    }
    return { id: item.id, terms };
  });

  return tokenized.map(({ id, terms }) => {
    if (terms.length === 0) return { id, score: 0 };
    const tf = new Map();
    for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1);
    let totalScore = 0;
    for (const q of queryTerms) {
      const f = tf.get(q) ?? 0;
      if (f === 0) continue;
      const df = dfMap.get(q) || 1;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      totalScore += idf * (f / (f + 1.5));
    }
    return { id, score: totalScore };
  });
}
