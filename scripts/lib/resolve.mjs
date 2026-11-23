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
 *   4. site name contains the identifier, then a close misspelling
 *      (bounded: see MIN_GUESS_LENGTH and fuzzyBudget)
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

// Steps 1 to 3 are exact. Step 4 guesses, so it is bounded: a one- or
// two-character identifier is a substring of most site names.
const MIN_GUESS_LENGTH = 3;
const MAX_CANDIDATES = 5;

/** Edit budget for a fuzzy guess: short names get none, since two edits turn any three-letter name into another. */
function fuzzyBudget(length) {
  if (length >= 6) return 2;
  if (length >= 4) return 1;
  return 0;
}

/**
 * @param {string} input        free-form identifier
 * @param {Array}  catalog      merged catalog entries
 * @param {object} [opts]
 * @param {string} [opts.source] restrict the search to one source
 * @returns {object|null} the matching catalog entry
 */
export function resolveDesign(input, catalog, opts = {}) {
  return resolveDesignDetailed(input, catalog, opts).item;
}

/**
 * As `resolveDesign`, plus how the entry was found.
 *
 * `matchedBy` is "id", "hostname", "name", "substring" or "fuzzy". The last
 * two are guesses: `candidates` then lists the other entries that also
 * matched, so a caller can tell the user which design it picked and why.
 *
 * @returns {{ item: object|null, matchedBy: string|null, candidates: Array<{id: string, siteName: string, source: string}> }}
 */
export function resolveDesignDetailed(input, catalog, opts = {}) {
  const miss = { item: null, matchedBy: null, candidates: [] };
  const hit = (item, matchedBy) => ({ item, matchedBy, candidates: [] });
  if (!input || typeof input !== "string") return miss;
  const trimmed = input.trim();
  if (!trimmed) return miss;

  const pool = opts.source
    ? catalog.filter((s) => (s.source || "refero") === opts.source)
    : catalog;

  // 1. Exact id.
  const lc = trimmed.toLowerCase();
  const byId = pool.find((s) => String(s.id).toLowerCase() === lc);
  if (byId) return hit(byId, "id");

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
      return hit(hits[0], "hostname");
    }
  }

  // 3. Exact site name (case-insensitive).
  const name = trimmed.toLowerCase();
  const exact = pool.filter((s) => String(s.siteName).toLowerCase() === name);
  if (exact.length > 0) {
    exact.sort((a, b) => String(a.siteName).localeCompare(String(b.siteName)));
    return hit(exact[0], "name");
  }

  // 4. Substring, then fuzzy.
  //
  // Only "site name contains the identifier" counts as a substring match.
  // The reverse test was dropped: it resolved "not-a-real-design-xyz" to a
  // site called "Design", and the caller had no way to tell.
  if (name.length < MIN_GUESS_LENGTH) return miss;
  const budget = fuzzyBudget(name.length);
  const candidates = [];
  for (const item of pool) {
    const ln = String(item.siteName).toLowerCase();
    if (ln.includes(name)) {
      candidates.push({ item, distance: 0, extra: ln.length - name.length });
      continue;
    }
    if (budget === 0) continue;
    const d = levenshtein(ln, name, budget);
    if (d <= budget) candidates.push({ item, distance: d, extra: Math.abs(ln.length - name.length) });
  }
  if (candidates.length === 0) return miss;
  // Closest first: fewest edits, then the name with the least text around
  // the identifier ("Stripe" before "Stripe Press" for "strip").
  candidates.sort(
    (a, b) =>
      a.distance - b.distance ||
      a.extra - b.extra ||
      String(a.item.siteName).localeCompare(String(b.item.siteName)),
  );
  return {
    item: candidates[0].item,
    matchedBy: candidates[0].distance === 0 ? "substring" : "fuzzy",
    // id + source, not just the name: two sources can carry the same site.
    candidates: candidates.slice(1, MAX_CANDIDATES + 1).map((c) => ({
      id: c.item.id,
      siteName: String(c.item.siteName),
      source: c.item.source || "refero",
    })),
  };
}
