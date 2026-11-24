/**
 * dashboards-ui.mjs — Dashboards starter templates gallery & setup pages.
 */

import { BASE_CSS, NAV_CSS, nav, mcpButton } from "./ui.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const fmtSize = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

const DASH_CSS = `
  .dash-wrap { max-width: 1280px; margin: 0 auto; padding: 24px 24px 64px; }
  .dash-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
  .dash-head h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -.02em; }
  .dash-head p { margin: 5px 0 0; color: var(--muted); font-size: 13.5px; max-width: 720px; }
  .dash-bar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
    padding: 10px 12px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 10px; margin-bottom: 20px;
  }
  .dash-bar input {
    flex: 1 1 240px; background: var(--panel2); color: var(--fg); border: 1px solid var(--line);
    border-radius: 7px; padding: 7px 10px; font: inherit; font-size: 13px;
  }
  .dash-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
  .dash-card {
    display: flex; flex-direction: column; background: var(--panel); border: 1px solid var(--line);
    border-radius: 12px; overflow: hidden; transition: border-color .15s ease;
  }
  .dash-card:hover { border-color: var(--accent); }
  .dash-cover { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; background: #0a0c0f; border-bottom: 1px solid var(--line); }
  .dash-body { padding: 15px 16px 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
  .dash-title { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .dash-title h2 { margin: 0; font-size: 16px; font-weight: 600; }
  .dash-title h2 a { color: var(--fg); text-decoration: none; }
  .dash-title h2 a:hover { color: var(--accent); }
  .dash-desc { color: var(--muted); font-size: 12.5px; line-height: 1.5; }
  .dash-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .dash-tag {
    font-size: 11px; padding: 2px 8px; border-radius: 999px;
    background: var(--panel2); border: 1px solid var(--line); color: var(--muted);
  }
  .dash-tag.accent { color: var(--accent); border-color: var(--accent-line); background: var(--accent-bg); }
  .dash-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 6px; }
  .dash-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 7px 12px; border-radius: 7px; font: inherit; font-size: 12.5px; font-weight: 500;
    text-decoration: none; cursor: pointer; border: 1px solid var(--line);
    background: var(--panel2); color: var(--fg);
  }
  .dash-btn:hover { border-color: var(--accent); }
  .dash-btn.primary { background: #4c5fd5; border-color: #6375ec; color: #fff; }
  .dash-btn.primary:hover { background: #596ce2; }
  .dash-crumb { font-size: 12px; color: var(--muted); margin-bottom: 10px; }
  .dash-crumb a { color: var(--muted); text-decoration: none; }
  .dash-crumb a:hover { color: var(--fg); }
  .dash-hero {
    display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 22px;
    background: var(--panel); border: 1px solid var(--line); border-radius: 14px;
    padding: 18px; margin-bottom: 22px;
  }
  @media (max-width: 900px) { .dash-hero { grid-template-columns: 1fr; } }
  .dash-hero img { width: 100%; border-radius: 10px; border: 1px solid var(--line); display: block; object-fit: cover; }
  .dash-hero-info { display: flex; flex-direction: column; gap: 12px; }
  .dash-hero-info h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -.02em; }
  .dash-meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .dash-kv { background: var(--panel2); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; }
  .dash-kv small { display: block; font-size: 11px; color: var(--muted); }
  .dash-kv strong { font-size: 12.5px; font-weight: 600; color: var(--fg); }
  .dash-section {
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    padding: 16px 18px; margin-bottom: 18px;
  }
  .dash-section h2 { margin: 0 0 10px; font-size: 15px; font-weight: 600; }
  .dash-cmd {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    background: var(--code-bg); border: 1px solid var(--line); border-radius: 8px;
    padding: 10px 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px;
    overflow-x: auto;
  }
  .dash-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-bottom: 18px; }
  @media (max-width: 820px) { .dash-cols { grid-template-columns: 1fr; } }
  .dash-list { margin: 0; padding-left: 18px; color: var(--muted); font-size: 13px; line-height: 1.7; }
  .dash-list code { color: var(--fg); font-size: 12px; }
  .dash-files { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 12px; }
  @media (max-width: 820px) { .dash-files { grid-template-columns: 1fr; } }
  .dash-file-list {
    max-height: 440px; overflow-y: auto; border: 1px solid var(--line); border-radius: 8px;
    background: var(--code-bg); padding: 6px;
  }
  .dash-file-btn {
    display: block; width: 100%; text-align: left; background: transparent; border: 0;
    color: var(--muted); padding: 5px 8px; border-radius: 5px; font-family: ui-monospace, monospace;
    font-size: 11.5px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dash-file-btn:hover { color: var(--fg); background: var(--panel2); }
  .dash-file-btn.on { color: var(--strong); background: var(--accent-bg); }
  .dash-file-view {
    border: 1px solid var(--line); border-radius: 8px; background: var(--code-bg);
    display: flex; flex-direction: column; min-height: 320px; max-height: 440px;
  }
  .dash-file-head {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 8px 12px; border-bottom: 1px solid var(--line); background: var(--panel2);
    font-family: ui-monospace, monospace; font-size: 12px;
  }
  .dash-file-view pre { margin: 0; padding: 12px; overflow: auto; flex: 1; font-size: 12px; line-height: 1.5; }
`;

export function dashboardsHtml(index) {
  const dashboards = index?.dashboards ?? [];
  const total = index?.total ?? dashboards.length;

  const cards = dashboards
    .map((d) => {
      const search = [
        d.name,
        d.slug,
        d.tagline,
        d.description,
        d.framework,
        d.styling,
        ...(d.features || []),
        ...(d.pages || []).map((p) => p.label),
      ]
        .join(" ")
        .toLowerCase();
      return `<article class="dash-card" data-search="${esc(search)}">
        ${d.hasCover ? `<a href="/dashboard/${encodeURIComponent(d.slug)}"><img class="dash-cover" src="/dashboard/${encodeURIComponent(d.slug)}/cover" alt="${esc(d.name)}" loading="lazy"></a>` : ""}
        <div class="dash-body">
          <div class="dash-title">
            <h2><a href="/dashboard/${encodeURIComponent(d.slug)}">${esc(d.name)}</a></h2>
            <span class="dash-tag">v${esc(d.version || "1.0.0")}</span>
          </div>
          <div class="dash-desc">${esc(d.description || d.tagline || "")}</div>
          <div class="dash-tags">
            <span class="dash-tag accent">Offline Fonts: ${(d.fonts || []).join(", ") || "included"}</span>
            <span class="dash-tag">${esc(d.framework || "")}</span>
            <span class="dash-tag">${esc(d.styling || "")}</span>
            <span class="dash-tag">${d.pages?.length || 0} pages</span>
            <span class="dash-tag">${d.fileCount || 0} files · ${fmtSize(d.zipBytes)}</span>
          </div>
          <div class="dash-actions">
            <a class="dash-btn primary" href="/dashboard/${encodeURIComponent(d.slug)}">View &amp; Setup</a>
            <a class="dash-btn" href="/dashboard/${encodeURIComponent(d.slug)}/download" download="${esc(d.slug)}-offline.zip">⬇ Download ZIP</a>
          </div>
        </div>
      </article>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dashboards · Designer</title>
<style>${BASE_CSS}${NAV_CSS}${DASH_CSS}</style>
</head><body>
${nav("dashboards")}
<main class="dash-wrap">
  <div class="dash-head">
    <div>
      <h1>Dashboards</h1>
      <p>Full-stack &amp; SPA dashboard starter templates packaged with self-hosted offline fonts, patched HTML, and one-command setup scripts.</p>
    </div>
  </div>
  <div class="dash-bar">
    <input id="dash-search" type="search" placeholder="Search dashboard templates, frameworks, pages…" aria-label="Search dashboards">
    <span id="dash-count" style="font-size:12px;color:var(--muted);">${total} ${total === 1 ? "template" : "templates"}</span>
  </div>
  <div class="dash-grid" id="dash-grid">
    ${cards || '<div style="color:var(--muted);padding:40px 0;">No dashboard templates cached. Run: npm run dashboards</div>'}
  </div>
</main>
<script>
const search = document.getElementById('dash-search');
const count = document.getElementById('dash-count');
const cards = [...document.querySelectorAll('.dash-card')];
search?.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  let visible = 0;
  for (const c of cards) {
    const ok = !q || c.dataset.search.includes(q);
    c.style.display = ok ? '' : 'none';
    if (ok) visible++;
  }
  count.textContent = visible + ' ' + (visible === 1 ? 'template' : 'templates');
});
</script>
</body></html>`;
}

export function dashboardDetailHtml(record) {
  const slug = record.slug;
  const setupCmd = `unzip ${slug}-offline.zip -d ${slug} && cd ${slug} && ./setup.sh`;
  const textFiles = (record.files || []).filter(
    (f) => !/\.(png|jpg|jpeg|webp|woff2?|ico|zip)$/i.test(f.path),
  );
  const defaultFile =
    textFiles.find((f) => f.path === "OFFLINE-SETUP.md")?.path ||
    textFiles.find((f) => f.path === "index.html")?.path ||
    textFiles[0]?.path ||
    "";

  const fileBtns = textFiles
    .map(
      (f) =>
        `<button type="button" class="dash-file-btn${f.path === defaultFile ? " on" : ""}" data-path="${esc(f.path)}">${esc(f.path)}</button>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(record.name)} · Dashboards</title>
<style>${BASE_CSS}${NAV_CSS}${DASH_CSS}</style>
</head><body>
${nav("dashboards")}
<main class="dash-wrap">
  <div class="dash-crumb"><a href="/dashboards">Dashboards</a> / ${esc(record.name)}</div>
  <section class="dash-hero">
    ${record.hasCover ? `<img src="/dashboard/${encodeURIComponent(slug)}/cover" alt="${esc(record.name)}">` : ""}
    <div class="dash-hero-info">
      <div>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px">
          <h1>${esc(record.name)}</h1>
          ${mcpButton(`designer:dashboard:${record.slug}`, `Dashboard — ${record.name}`)}
        </div>
        <p style="margin:6px 0 0;color:var(--muted);font-size:13.5px;line-height:1.55;">${esc(record.description || record.tagline || "")}</p>
      </div>
      <div class="dash-meta-grid">
        <div class="dash-kv"><small>Framework</small><strong>${esc(record.framework || "—")}</strong></div>
        <div class="dash-kv"><small>Styling</small><strong>${esc(record.styling || "—")}</strong></div>
        <div class="dash-kv"><small>Offline Fonts</small><strong>${esc((record.fonts || []).join(", ") || "None")}</strong></div>
        <div class="dash-kv"><small>License / Version</small><strong>${esc(record.license || "MIT")} · v${esc(record.version || "1.0.0")}</strong></div>
      </div>
      <div class="dash-actions">
        <a class="dash-btn primary" href="/dashboard/${encodeURIComponent(slug)}/download" download="${esc(slug)}-offline.zip">⬇ Download Offline Template (${fmtSize(record.zipBytes)})</a>
        ${record.fontsZipBytes ? `<a class="dash-btn" href="/dashboard/${encodeURIComponent(slug)}/fonts.zip" download="${esc(slug)}-fonts.zip">⬇ Offline Fonts Only (${fmtSize(record.fontsZipBytes)})</a>` : ""}
      </div>
    </div>
  </section>

  <section class="dash-section">
    <h2>Quick Offline Setup</h2>
    <div class="dash-cmd">
      <code id="setup-cmd">${esc(setupCmd)}</code>
      <button type="button" class="dash-btn" id="copy-cmd">Copy</button>
    </div>
    ${
      record.offlineNotes?.length
        ? `<ul class="dash-list" style="margin-top:12px;">${record.offlineNotes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`
        : ""
    }
  </section>

  <div class="dash-cols">
    <section class="dash-section" style="margin-bottom:0;">
      <h2>Included Pages (${record.pages?.length || 0})</h2>
      <ul class="dash-list">
        ${(record.pages || []).map((p) => `<li><code>${esc(p.path)}</code> — ${esc(p.label)}</li>`).join("")}
      </ul>
    </section>
    <section class="dash-section" style="margin-bottom:0;">
      <h2>Features &amp; Stack</h2>
      <div class="dash-tags" style="margin-bottom:10px;">
        ${(record.features || []).map((f) => `<span class="dash-tag accent">${esc(f)}</span>`).join("")}
      </div>
      <div class="dash-tags">
        ${(record.dependencies || []).slice(0, 18).map((dep) => `<span class="dash-tag">${esc(dep)}</span>`).join("")}
        ${(record.dependencies || []).length > 18 ? `<span class="dash-tag">+${record.dependencies.length - 18} more</span>` : ""}
      </div>
    </section>
  </div>

  <section class="dash-section">
    <h2>Browse Template Files (${textFiles.length} source files)</h2>
    <div class="dash-files">
      <div class="dash-file-list" id="dash-file-list">${fileBtns}</div>
      <div class="dash-file-view">
        <div class="dash-file-head">
          <span id="dash-file-name">${esc(defaultFile)}</span>
          <button type="button" class="dash-btn" id="dash-file-copy">Copy file</button>
        </div>
        <pre><code id="dash-file-code">Loading…</code></pre>
      </div>
    </div>
  </section>
</main>
<script>
const SLUG = ${JSON.stringify(slug)};
const copyCmd = document.getElementById('copy-cmd');
const setupCmd = document.getElementById('setup-cmd');
copyCmd?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(setupCmd.textContent);
    copyCmd.textContent = 'Copied';
    setTimeout(() => { copyCmd.textContent = 'Copy'; }, 1200);
  } catch {}
});

const fileList = document.getElementById('dash-file-list');
const fileName = document.getElementById('dash-file-name');
const fileCode = document.getElementById('dash-file-code');
const fileCopy = document.getElementById('dash-file-copy');

async function loadFile(relPath) {
  if (!relPath) return;
  fileName.textContent = relPath;
  fileCode.textContent = 'Loading…';
  for (const btn of fileList.querySelectorAll('.dash-file-btn')) {
    btn.classList.toggle('on', btn.dataset.path === relPath);
  }
  try {
    const res = await fetch('/api/dashboard/' + encodeURIComponent(SLUG) + '/file?path=' + encodeURIComponent(relPath));
    fileCode.textContent = res.ok ? await res.text() : 'Unable to load file';
  } catch {
    fileCode.textContent = 'Unable to load file';
  }
}

fileList?.addEventListener('click', (e) => {
  const btn = e.target.closest('.dash-file-btn');
  if (btn) loadFile(btn.dataset.path);
});

fileCopy?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(fileCode.textContent);
    fileCopy.textContent = 'Copied';
    setTimeout(() => { fileCopy.textContent = 'Copy file'; }, 1200);
  } catch {}
});

loadFile(${JSON.stringify(defaultFile)});
</script>
</body></html>`;
}
