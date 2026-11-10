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
  ];
  return parts.filter(Boolean).join("\n");
}

/**
 * Score every item against a query.
 * @returns {Array<{id: string, score: number}>}
 */
export function score(query, items) {
  const queryTerms = Array.from(new Set(tokenize(query)));
  if (queryTerms.length === 0) return items.map((item) => ({ id: item.id, score: 0 }));

  return items.map((item) => {
    const itemTerms = tokenize(item.text ?? "");
    if (itemTerms.length === 0) return { id: item.id, score: 0 };
    const tf = new Map();
    for (const t of itemTerms) tf.set(t, (tf.get(t) ?? 0) + 1);
    let score = 0;
    for (const q of queryTerms) {
      const f = tf.get(q) ?? 0;
      if (f === 0) continue;
      // BM25-lite: f / (f + k1), k1 = 1.5.
      score += f / (f + 1.5);
    }
    return { id: item.id, score };
  });
}
