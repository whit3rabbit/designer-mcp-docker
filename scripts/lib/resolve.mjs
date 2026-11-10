/**
 * Resolve a free-form identifier against the merged catalog.
 *
 * Works for both sources:
 *   - Refero entries have UUID ids and a real site URL.
 *   - OpenDesign entries have slug ids and a GitHub tree URL.
 *
 * Match order:
 *   1. exact id (case-insensitive)
 *   2. hostname / URL match
 *   3. exact site name
 *   4. substring, then fuzzy (Levenshtein <= 2) on the site name
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function looksLikeUuid(s) {
  return UUID_RE.test(s);
}

function parseHostname(input) {
  let candidate = input.trim();
  if (!candidate) return null;
  if (!/^https?:\/\//i.test(candidate)) {
    if (/^[\w-]+(\.[\w-]+)+/.test(candidate)) candidate = `https://${candidate}`;
    else return null;
  }
  try {
    return new URL(candidate).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function itemHostname(item) {
  if (!item?.url) return null;
  try {
    return new URL(item.url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function levenshtein(a, b, max) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost,
      );
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > max) return max + 1;
    const t = prev;
    prev = curr;
    curr = t;
  }
  return prev[n] > max ? max + 1 : prev[n];
}

/**
 * @param {string} input        free-form identifier
 * @param {Array}  catalog      merged catalog entries
 * @param {object} [opts]
 * @param {string} [opts.source] restrict the search to one source
 * @returns {object|null} the matching catalog entry
 */
export function resolveDesign(input, catalog, opts = {}) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const pool = opts.source
    ? catalog.filter((s) => (s.source || "refero") === opts.source)
    : catalog;

  // 1. Exact id.
  const lc = trimmed.toLowerCase();
  const byId = pool.find((s) => String(s.id).toLowerCase() === lc);
  if (byId) return byId;

  // 2. Hostname / URL.
  const host = parseHostname(trimmed);
  if (host) {
    const hits = pool.filter((s) => itemHostname(s) === host);
    if (hits.length > 0) {
      // Prefer the entry whose URL path is shortest — the site root rather
      // than a deep link.
      hits.sort((a, b) => {
        try {
          const al = new URL(a.url).pathname.length;
          const bl = new URL(b.url).pathname.length;
          if (al !== bl) return al - bl;
        } catch {
          /* fall through to the name tiebreak */
        }
        return String(a.siteName).localeCompare(String(b.siteName));
      });
      return hits[0];
    }
  }

  // 3. Exact site name (case-insensitive).
  const name = trimmed.toLowerCase();
  const exact = pool.filter((s) => String(s.siteName).toLowerCase() === name);
  if (exact.length > 0) {
    exact.sort((a, b) => String(a.siteName).localeCompare(String(b.siteName)));
    return exact[0];
  }

  // 4. Substring, then fuzzy.
  const candidates = [];
  for (const item of pool) {
    const ln = String(item.siteName).toLowerCase();
    if (ln.includes(name) || name.includes(ln)) {
      candidates.push({ item, distance: 0 });
      continue;
    }
    const d = levenshtein(ln, name, 2);
    if (d <= 2) candidates.push({ item, distance: d });
  }
  if (candidates.length === 0) return null;
  candidates.sort(
    (a, b) =>
      a.distance - b.distance ||
      String(a.item.siteName).localeCompare(String(b.item.siteName)),
  );
  return candidates[0]?.item ?? null;
}
