/**
 * Local weekly review form (P3-1, human-in-the-loop step).
 *
 * Run with:  npm run review
 *
 * Opens a localhost form where Dr. Bruschi reviews the week's draft articles
 * before publishing: edit the editorial title, tweak the AI takeaways / "why
 * it matters", and add his own clinical note (clinicalNoteIt). On save the
 * edits are written back to content/review-draft.json, which the weekly
 * pipeline then merges into articles.json before push + newsletter.
 *
 * No server framework, no auth, no network exposure — localhost only, runs on
 * the Mac. If content/review-draft.json does not exist, it is seeded from the
 * most recent articles so the form is always testable.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ARTICLES_PATH = path.join(ROOT, "content", "articles.json");
const DRAFT_PATH = path.join(ROOT, "content", "review-draft.json");
const PORT = 4317;
const SEED_COUNT = 5;

type Draft = {
  pmid: string;
  slug: string;
  paperTitle: string;
  journal: string;
  doi?: string;
  pmidUrl: string;
  summaryIt: string;
  editorialTitleIt: string;
  editorialTitleEn: string;
  takeawaysIt: string[];
  takeawaysEn: string[];
  whyItMattersIt: string;
  whyItMattersEn: string;
  clinicalNoteIt: string;
};

function loadArticles(): any[] {
  const store = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));
  return store.articles || [];
}

function seedDraftFromArticle(a: any): Draft {
  return {
    pmid: a.pmid,
    slug: a.slug,
    paperTitle: (a.title || "").replace(/<[^>]+>/g, ""),
    journal: a.journal,
    doi: a.doi || undefined,
    pmidUrl: `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`,
    summaryIt: a.summaryIt || "",
    editorialTitleIt: a.editorialTitleIt || "",
    editorialTitleEn: a.editorialTitleEn || "",
    takeawaysIt: a.takeawaysIt || [],
    takeawaysEn: a.takeawaysEn || [],
    whyItMattersIt: a.whyItMattersIt || "",
    whyItMattersEn: a.whyItMattersEn || "",
    clinicalNoteIt: a.clinicalNoteIt || "",
  };
}

function getDraft(): Draft[] {
  if (fs.existsSync(DRAFT_PATH)) {
    return JSON.parse(fs.readFileSync(DRAFT_PATH, "utf-8"));
  }
  // Seed from the most recent articles so the form is testable standalone.
  const seed = loadArticles().slice(0, SEED_COUNT).map(seedDraftFromArticle);
  fs.writeFileSync(DRAFT_PATH, JSON.stringify(seed, null, 2), "utf-8");
  console.log(`[review] Seeded ${DRAFT_PATH} from the ${seed.length} most recent articles.`);
  return seed;
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function page(draft: Draft[]): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Revisione settimanale — Osteoperionews</title>
<style>
  :root { --accent:#2c5545; --ink:#1c1c1c; --muted:#767676; --border:#e8e8e6; --bg:#f7f7f5; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; line-height:1.5; }
  header { position:sticky; top:0; background:#e8f4f2; border-bottom:1px solid #c8ddd9; padding:14px 24px; display:flex; align-items:center; justify-content:space-between; z-index:10; }
  header h1 { margin:0; font-size:18px; }
  header .count { font-size:13px; color:var(--muted); }
  main { max-width:820px; margin:0 auto; padding:24px 16px 120px; }
  .card { background:#fff; border:1px solid var(--border); border-radius:8px; padding:20px; margin-bottom:22px; }
  .src { font-size:12px; color:var(--muted); margin:0 0 4px; text-transform:uppercase; letter-spacing:.5px; }
  .paper { font-size:13px; color:var(--muted); font-style:italic; margin:0 0 10px; }
  .paper a { color:var(--accent); }
  details { margin:0 0 14px; }
  details summary { cursor:pointer; font-size:13px; color:var(--accent); }
  details p { font-size:13px; color:#4a4a4a; white-space:pre-wrap; margin:8px 0 0; }
  label { display:block; font-size:12px; font-weight:600; color:var(--accent); text-transform:uppercase; letter-spacing:.4px; margin:14px 0 4px; }
  input[type=text], textarea { width:100%; font:inherit; font-size:14px; padding:8px 10px; border:1px solid var(--border); border-radius:6px; background:#fff; }
  input[type=text]:focus, textarea:focus { outline:2px solid var(--accent); border-color:var(--accent); }
  textarea { resize:vertical; }
  .note { border:1px solid var(--accent); background:rgba(44,85,69,.04); border-radius:6px; padding:10px; }
  .hint { font-size:11px; color:var(--muted); font-weight:400; text-transform:none; letter-spacing:0; }
  .bar { position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid var(--border); padding:12px 24px; display:flex; align-items:center; justify-content:flex-end; gap:14px; }
  .bar #status { font-size:13px; color:var(--muted); margin-right:auto; }
  button { font:inherit; font-weight:600; font-size:14px; padding:10px 20px; border:none; border-radius:6px; background:var(--accent); color:#fff; cursor:pointer; }
  button:disabled { opacity:.5; cursor:default; }
  .two { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width:680px){ .two{ grid-template-columns:1fr; } }
</style>
</head>
<body>
<header>
  <h1>Revisione settimanale</h1>
  <span class="count">${draft.length} articoli</span>
</header>
<main id="app"></main>
<div class="bar">
  <span id="status">Modifica titolo, takeaway e aggiungi la tua nota clinica.</span>
  <button id="save">Salva e approva</button>
</div>
<script>
  const DRAFT = ${JSON.stringify(draft)};
  const app = document.getElementById('app');
  function field(pmid, key, label, value, hint) {
    return '<label>'+label+(hint?' <span class="hint">'+hint+'</span>':'')+'</label>'+
      '<input type="text" data-pmid="'+pmid+'" data-key="'+key+'" value="'+(value||'').replace(/"/g,'&quot;')+'">';
  }
  function area(pmid, key, label, value, hint, cls) {
    return '<label>'+label+(hint?' <span class="hint">'+hint+'</span>':'')+'</label>'+
      '<textarea rows="3" class="'+(cls||'')+'" data-pmid="'+pmid+'" data-key="'+key+'">'+(value||'')+'</textarea>';
  }
  app.innerHTML = DRAFT.map(function(d){
    return '<div class="card">'+
      '<p class="src">'+d.journal+'</p>'+
      '<p class="paper">Studio originale: '+d.paperTitle+
        (d.doi?' · <a href="https://doi.org/'+d.doi+'" target="_blank">DOI</a>':'')+
        ' · <a href="'+d.pmidUrl+'" target="_blank">PubMed</a></p>'+
      '<details><summary>Riassunto IT (riferimento)</summary><p>'+d.summaryIt+'</p></details>'+
      '<div class="two">'+
        '<div>'+field(d.pmid,'editorialTitleIt','Titolo editoriale (IT)',d.editorialTitleIt)+'</div>'+
        '<div>'+field(d.pmid,'editorialTitleEn','Editorial title (EN)',d.editorialTitleEn)+'</div>'+
      '</div>'+
      '<div class="two">'+
        '<div>'+area(d.pmid,'takeawaysIt','In breve (IT)',(d.takeawaysIt||[]).join('\\n'),'una per riga')+'</div>'+
        '<div>'+area(d.pmid,'takeawaysEn','In brief (EN)',(d.takeawaysEn||[]).join('\\n'),'one per line')+'</div>'+
      '</div>'+
      '<div class="two">'+
        '<div>'+area(d.pmid,'whyItMattersIt','Perché conta (IT)',d.whyItMattersIt)+'</div>'+
        '<div>'+area(d.pmid,'whyItMattersEn','Why it matters (EN)',d.whyItMattersEn)+'</div>'+
      '</div>'+
      area(d.pmid,'clinicalNoteIt','Nota del parodontologo (IT)',d.clinicalNoteIt,'la tua interpretazione clinica — 1-2 frasi','note')+
    '</div>';
  }).join('');

  function collect() {
    const byPmid = {};
    DRAFT.forEach(function(d){ byPmid[d.pmid] = Object.assign({}, d); });
    document.querySelectorAll('[data-pmid]').forEach(function(el){
      const d = byPmid[el.dataset.pmid]; const k = el.dataset.key;
      if (k === 'takeawaysIt' || k === 'takeawaysEn') {
        d[k] = el.value.split('\\n').map(function(s){return s.trim();}).filter(Boolean);
      } else { d[k] = el.value; }
    });
    return DRAFT.map(function(d){ return byPmid[d.pmid]; });
  }

  const btn = document.getElementById('save'), status = document.getElementById('status');
  btn.onclick = function(){
    btn.disabled = true; status.textContent = 'Salvataggio…';
    fetch('/save', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(collect()) })
      .then(function(r){ return r.ok ? r.text() : Promise.reject(); })
      .then(function(){ status.textContent = '✓ Salvato in content/review-draft.json — puoi chiudere e dirmi di pubblicare.'; btn.disabled = false; })
      .catch(function(){ status.textContent = '✗ Errore nel salvataggio.'; btn.disabled = false; });
  };
</script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/save") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        fs.writeFileSync(DRAFT_PATH, JSON.stringify(data, null, 2), "utf-8");
        console.log(`[review] Saved ${data.length} reviewed articles to ${DRAFT_PATH}`);
        res.writeHead(200).end("ok");
      } catch (e) {
        res.writeHead(400).end("bad request");
      }
    });
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(page(getDraft()));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n  Revisione settimanale → http://localhost:${PORT}\n  (Ctrl+C per chiudere)\n`);
});
