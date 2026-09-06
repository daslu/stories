#!/usr/bin/env node
/* layout-check.js — the thing check.js cannot do.
 *
 * check.js reads the source and verifies content. It cannot see layout, so
 * every SVG overflow and label collision in this page's history got through
 * it. This renders the built pages in headless Chrome at a range of widths,
 * clicks every control, and asserts that inside each figure:
 *
 *   - no drawable element falls outside its own viewBox
 *   - no two <text> elements meaningfully overlap
 *
 * Geometry comes from getBBox(), which is in SVG user units, so results do
 * not depend on display scale. Exit code 1 on any failure.
 *
 *   node tools/layout-check.js                 # all pages, default widths
 *   node tools/layout-check.js 390 1100        # only these widths
 *   node tools/layout-check.js --page territory
 *
 * Adapted for the Quarto conversion. It used to build one self-contained file
 * with build.sh and probe it; there are six rendered pages now, so it walks
 * the output directory instead. It does NOT render — run `quarto render`
 * first, or it will audit a stale build.
 *
 * Two notes if you extend it: headless Chrome will not size its window below
 * ~500px, so each page is loaded in an exact-width iframe, and that iframe
 * needs --allow-file-access-from-files to be readable over file://. The probe
 * copy is written next to the real page rather than into a temp directory,
 * because the pages reference ../site_libs and js/ relatively.
 */
const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path");

const argv = process.argv.slice(2);
const onlyPage = (() => { const i = argv.indexOf("--page"); return i > -1 ? argv[i + 1] : null; })();
const widths = argv.filter(a => /^\d+$/.test(a)).map(Number);
const WIDTHS = widths.length ? widths : [320, 390, 560, 820, 1100, 1400];

const CHROME = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]
  .find(c => { try { execFileSync("which", [c], { stdio: "pipe" }); return true; } catch { return false; } });
if (!CHROME) { console.error("layout-check: no chrome/chromium on PATH — skipping"); process.exit(0); }

const here = path.resolve(__dirname, "..");
const OUT = path.resolve(here, "..", "docs", path.basename(here));
if (!fs.existsSync(OUT)) {
  console.error(`layout-check: no build at ${OUT} — run 'quarto render' first`);
  process.exit(1);
}

/* only pages that actually carry a figure are worth probing */
const allPages = fs.readdirSync(OUT)
  .filter(f => f.endsWith(".html") && !f.startsWith("_"))
  .filter(f => /journey-figure/.test(fs.readFileSync(path.join(OUT, f), "utf8")))
  .filter(f => !onlyPage || f === onlyPage + ".html")
  .sort();
if (!allPages.length) { console.error("layout-check: no built pages with figures"); process.exit(1); }

const PROBE = `
function audit(tag, out){
  document.querySelectorAll('.journey-figure').forEach(function(fig){
    var svg = fig.querySelector('svg'); if (!svg) return;
    var vb = svg.viewBox.baseVal;
    var sec = fig.closest('section.stop');
    var id = (sec && (sec.getAttribute('data-stop') || sec.id)) || '?';
    var all = [].slice.call(svg.querySelectorAll('text,rect,circle,ellipse,path,line,foreignObject'));
    all.forEach(function(el){
      var b = el.getBBox(); if (!b.width && !b.height) return;
      if (b.x < -2 || b.y < -2 || b.x + b.width > vb.width + 2 || b.y + b.height > vb.height + 2)
        out.push([id + ' outside viewBox: <' + el.tagName + '> '
                  + JSON.stringify((el.textContent || '').trim().slice(0, 24)), tag]);
    });
    var tx = all.filter(function(e){ return e.tagName === 'text' && (e.textContent || '').trim(); })
                .map(function(t){ return {b: t.getBBox(), s: t.textContent.trim().slice(0, 24)}; });
    for (var a = 0; a < tx.length; a++) for (var c = a + 1; c < tx.length; c++) {
      var A = tx[a].b, B = tx[c].b;
      var ox = Math.min(A.x + A.width, B.x + B.width) - Math.max(A.x, B.x);
      var oy = Math.min(A.y + A.height, B.y + B.height) - Math.max(A.y, B.y);
      if (ox > 1.5 && oy > 1.5 &&
          (ox * oy) / Math.min(A.width * A.height, B.width * B.height) > 0.12)
        out.push([id + ' overlap: "' + tx[a].s + '" x "' + tx[c].s + '"', tag]);
    }
  });
}
window.addEventListener('load', function(){ setTimeout(function(){
  var out = [], n = 0;
  audit('rest', out);
  document.querySelectorAll('.controls button[data-stim],.controls button[data-temp],'
    + '.controls button[data-part],.controls button[data-bond2],.controls button[data-ctx],'
    + '#gateBtn,#claimsShow').forEach(function(b){
      b.click(); n++; audit(b.textContent.trim().slice(0, 14), out); });
  [['#vel', 0.3], ['#vel', 30], ['#vel2', 0.3], ['#vel2', 30]].forEach(function(p){
    var e = document.querySelector(p[0]); if (!e) return;
    e.value = p[1]; e.dispatchEvent(new Event('input')); n++; audit(p[0] + '=' + p[1], out); });
  document.querySelectorAll('[data-rec]').forEach(function(g){
    g.dispatchEvent(new MouseEvent('click', {bubbles: true})); n++; audit('receptor', out); });
  document.querySelectorAll('.flip').forEach(function(b){ b.click(); n++; });
  var seen = {}, uniq = [];
  out.forEach(function(pair){
    if (!seen[pair[0]]) { seen[pair[0]] = {n: 0, first: pair[1]}; uniq.push(pair[0]); }
    seen[pair[0]].n++;
  });
  var svg = document.querySelector('.journey-figure svg');
  var t = document.querySelector('.journey-figure svg text.xs');
  var label = t && svg
    ? (parseFloat(getComputedStyle(t).fontSize) * (svg.getBoundingClientRect().width / svg.viewBox.baseVal.width)).toFixed(1)
    : '?';
  var pre = document.createElement('pre'); pre.id = 'RESULT';
  pre.textContent = 'INTERACTIONS ' + n
    + '\\nVIEWBOX ' + (svg ? svg.viewBox.baseVal.width : '?')
    + '\\nLABELPX ' + label
    + '\\nPROBLEMS ' + uniq.length
    + (uniq.length ? '\\n' + uniq.slice(0, 25).map(function(k){
        var h = seen[k];
        return k + (h.n > 1 ? '  (' + h.n + ' states, first: ' + h.first + ')'
                            : '  (state: ' + h.first + ')'); }).join('\\n') : '');
  document.body.appendChild(pre);
}, 1800); });
`;

let failed = 0, checked = 0;
const temps = [];
console.log("page                 width  viewBox  label   problems");

for (const page of allPages) {
  /* the probe copy lives beside the real page so ../site_libs and js/ resolve */
  const probePage = path.join(OUT, "_lc_page.html");
  fs.writeFileSync(probePage,
    fs.readFileSync(path.join(OUT, page), "utf8")
      .replace("</body>", "<script>" + PROBE + "</script>\n</body>"));
  temps.push(probePage);

  for (const w of WIDTHS) {
    const harness = path.join(OUT, `_lc_h${w}.html`);
    temps.push(harness);
    fs.writeFileSync(harness, `<!doctype html><meta charset="utf-8"><body style="margin:0">
<iframe id="f" src="_lc_page.html" style="width:${w}px;height:9000px;border:0"></iframe>
<pre id="OUT">pending</pre>
<script>
var f=document.getElementById('f'), n=0;
var t=setInterval(function(){ n++;
  try { var d=f.contentDocument, r=d && d.getElementById('RESULT');
    if (r) { document.getElementById('OUT').textContent=r.textContent; clearInterval(t); }
    else if (n>90) { document.getElementById('OUT').textContent='TIMEOUT'; clearInterval(t); }
  } catch(e) { document.getElementById('OUT').textContent='ERROR '+e.message; clearInterval(t); }
}, 200);
</script>`);
    const dom = execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-sandbox",
      "--allow-file-access-from-files", "--virtual-time-budget=25000",
      "--window-size=1400,1200", "--dump-dom", "file://" + harness],
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], maxBuffer: 1 << 28 });
    const m = dom.match(/<pre id="OUT">([\s\S]*?)<\/pre>/);
    const text = m ? m[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                         .replace(/&quot;/g, '"').replace(/&amp;/g, "&") : "NO RESULT";
    const g = k => (text.match(new RegExp(k + " (\\S+)")) || [, "?"])[1];
    const problems = +g("PROBLEMS") || 0;
    const label = page.replace(/\.html$/, "");
    if (text.includes("TIMEOUT") || text.includes("ERROR") || text === "NO RESULT") {
      console.log(`${label.padEnd(20)} ${String(w).padStart(5)}  harness failed: ${text.split("\n")[0]}`);
      failed++; continue;
    }
    checked++;
    console.log(`${label.padEnd(20)} ${String(w).padStart(5)}  ${g("VIEWBOX").padStart(7)}  ${g("LABELPX").padStart(5)}px  ${problems || "none"}`);
    if (problems) { failed++; console.log(text.split("\n").slice(4).map(l => "       " + l).join("\n")); }
  }
}
temps.forEach(f => { try { fs.unlinkSync(f); } catch {} });

if (failed) { console.log(`\nlayout-check: ${failed} page/width combination(s) with problems.`); process.exit(1); }
console.log(`\nlayout-check: ${checked} page/width combinations clean.`);
