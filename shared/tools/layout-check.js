#!/usr/bin/env node
/* shared/tools/layout-check.js — the layout audit, for any story.
 *
 *   node shared/tools/layout-check.js pain-journey
 *   node shared/tools/layout-check.js pain-journey 390 1100
 *   node shared/tools/layout-check.js pain-journey --page how-loose
 *
 * check.js cannot see layout: it reads source, never a rendered page. This
 * renders the BUILT pages in headless Chrome at a range of widths, operates
 * every control the figure kit knows how to make, and asserts that inside each
 * figure:
 *
 *   - no drawable element falls outside its own viewBox
 *   - no two <text> elements meaningfully overlap
 *
 * Geometry comes from getBBox(), which is in SVG user units, so results do not
 * depend on display scale. Exit code 1 on any failure.
 *
 * It does NOT render — run `quarto render` first or it audits a stale build.
 *
 * WHAT IT CANNOT CATCH, and you have to look for yourself: an opaque shape
 * drawn over a label. The overlap test compares <text> with <text>; a <path>
 * or a <foreignObject> covering one is invisible to it. That has happened
 * twice in this repository. After moving anything in a scene, look at it.
 *
 * How it works, and why it looks roundabout. Headless Chrome will not size its
 * window below about 500px, so each page is loaded inside an exact-width
 * iframe. The probe cannot be injected after load — the listener would never
 * fire — so it is written into a copy of the page before it is opened, and
 * that copy lives beside the real page because the pages reference ../shared
 * and js/ relatively. The probe leaves its result in a <pre> that the outer
 * harness polls for and copies out, which --dump-dom can then read.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const args = process.argv.slice(2);
const pageArg = args.includes("--page") ? args[args.indexOf("--page") + 1] : null;
const story = args.find((a, i) =>
  !a.startsWith("-") && !/^\d+$/.test(a) && args[i - 1] !== "--page");
if (!story) {
  console.error("usage: node shared/tools/layout-check.js <story-dir> [widths…] [--page name]");
  process.exit(2);
}
const widths = args.filter(a => /^\d+$/.test(a)).map(Number);
const WIDTHS = widths.length ? widths : [320, 390, 560, 820, 1100, 1400];

const repo = path.resolve(__dirname, "..", "..");
const OUT = path.join(repo, "docs", story);
if (!fs.existsSync(OUT)) {
  console.error(`layout-check: docs/${story} does not exist — run \`quarto render\` first`);
  process.exit(1);
}

const CHROME = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]
  .find(c => { try { execFileSync("which", [c], { stdio: "pipe" }); return true; } catch { return false; } });
if (!CHROME) { console.error("layout-check: no chrome/chromium on PATH — skipping"); process.exit(0); }

const pages = fs.readdirSync(OUT)
  .filter(f => f.endsWith(".html") && !f.startsWith("_"))
  .filter(f => !pageArg || f === `${pageArg}.html`)
  .sort();

const PROBE = `
function boxes(){
  var out = [];
  document.querySelectorAll('.journey-figure[data-scene] svg').forEach(function(svg){
    var vb = svg.viewBox.baseVal; if(!vb || !vb.width) return;
    var host = svg.closest('.journey-figure');
    var id = host.dataset.scene;
    svg.querySelectorAll('text,rect,circle,line,path,foreignObject,image,polygon,polyline,ellipse')
      .forEach(function(el){
        var b = el.getBBox();                 /* let a throw surface */
        out.push({id:id, tag:el.tagName, s:(el.textContent||'').trim().slice(0,26),
                  x:b.x, y:b.y, w:b.width, h:b.height, vw:vb.width, vh:vb.height});
      });
  });
  return out;
}
function audit(tag, out){
  var all = boxes();
  all.forEach(function(b){
    if(b.w === 0 && b.h === 0) return;
    var slack = 0.6;
    if(b.x < -slack || b.y < -slack || b.x + b.w > b.vw + slack || b.y + b.h > b.vh + slack)
      out.push([b.id + ' outside viewBox: <' + b.tag + '> "' + b.s + '"', tag]);
  });
  var byFig = {};
  all.filter(function(b){ return b.tag === 'text' && b.w > 0 && b.s; })
     .forEach(function(b){ (byFig[b.id] = byFig[b.id] || []).push(b); });
  Object.keys(byFig).forEach(function(id){
    var tx = byFig[id];
    for(var a = 0; a < tx.length; a++) for(var c = a + 1; c < tx.length; c++){
      var A = tx[a], B = tx[c];
      var ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x);
      var oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
      if(ox > 1.5 && oy > 1.5 && (ox * oy) / Math.min(A.w * A.h, B.w * B.h) > 0.12)
        out.push([id + ' overlap: "' + A.s + '" x "' + B.s + '"', tag]);
    }
  });
}
window.addEventListener('load', function(){ setTimeout(function(){
  var out = [], n = 0;
  audit('rest', out);
  /* every control the kit can render, operated */
  document.querySelectorAll('[data-fig-set],[data-fig-toggle],[data-fig-act]')
    .forEach(function(b){ b.click(); n++; audit(b.textContent.trim().slice(0,16), out); });
  document.querySelectorAll('[data-fig-range]').forEach(function(e){
    [e.min, e.max, (+e.min + +e.max) / 2].forEach(function(v){
      e.value = v; e.dispatchEvent(new Event('input')); n++;
      audit(e.dataset.figRange + '=' + v, out);
    });
  });
  var seen = {}, uniq = [];
  out.forEach(function(p){
    if(!seen[p[0]]){ seen[p[0]] = {n:0, first:p[1]}; uniq.push(p[0]); }
    seen[p[0]].n++;
  });
  /* smallest rendered label, in real pixels — the readability floor */
  var small = 999;
  document.querySelectorAll('.journey-figure[data-scene] svg').forEach(function(svg){
    var vb = svg.viewBox.baseVal, px = svg.getBoundingClientRect().width;
    if(!vb.width || !px) return;
    svg.querySelectorAll('text').forEach(function(t){
      if(!(t.textContent||'').trim()) return;
      small = Math.min(small, parseFloat(getComputedStyle(t).fontSize) * (px / vb.width));
    });
  });
  var svg0 = document.querySelector('.journey-figure[data-scene] svg');
  var pre = document.createElement('pre'); pre.id = 'RESULT';
  pre.textContent = 'INTERACTIONS ' + n
    + '\\nVIEWBOX ' + (svg0 ? svg0.viewBox.baseVal.width : '?')
    + '\\nLABELPX ' + (small < 900 ? small.toFixed(1) : '?')
    + '\\nPROBLEMS ' + uniq.length
    + (uniq.length ? '\\n' + uniq.slice(0, 25).map(function(k){
        var h = seen[k];
        return k + '  (' + h.n + ' state' + (h.n > 1 ? 's' : '') + ', first: ' + h.first + ')';
      }).join('\\n') : '');
  document.body.appendChild(pre);
}, 1500); });
`;

let failed = 0, totalClicks = 0, sawFigures = false;
const temps = [];
console.log(story);
console.log("page".padEnd(22) + "width".padStart(6) + "viewBox".padStart(9) +
            "label".padStart(8) + "clicks".padStart(8) + "  problems");

try {
  for (const page of pages) {
    /* the probe copy lives beside the real page so ../shared and js/ resolve */
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
      const text = m ? m[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : "NO OUTPUT";
      const grab = k => (text.match(new RegExp(k + " (\\S+)")) || [, "?"])[1];
      const nProb = +grab("PROBLEMS") || 0;
      const name = page.replace(/\.html$/, "");
      const clicks = +grab("INTERACTIONS") || 0;
      totalClicks += clicks;
      console.log(name.padEnd(22) + String(w).padStart(6) + grab("VIEWBOX").padStart(9) +
        (grab("LABELPX") + "px").padStart(8) + String(clicks).padStart(8) +
        "  " + (nProb ? nProb : "none"));
      if (nProb) {
        text.split("\n").slice(4).filter(Boolean).forEach(l => console.log("       " + l.trim()));
        failed += nProb;
      }
      if (grab("VIEWBOX") !== "?") sawFigures = true;
      if (/TIMEOUT|ERROR|NO OUTPUT/.test(text)) {
        console.log("       could not read the page: " + text.trim().slice(0, 120));
        failed++;
      }
    }
  }
} finally {
  temps.forEach(f => { try { fs.unlinkSync(f); } catch {} });
}

/* A checker that under-reports is worse than no checker. This one operates
   controls by the figure kit's own attributes, so pointed at a story that
   predates the kit — touch-journey hand-wires its own — it would find nothing
   to click and cheerfully report "clean". Refuse to do that quietly. */
if (sawFigures && totalClicks === 0) {
  console.log(`\nlayout-check: this story's figures have no controls this checker can`);
  console.log(`operate. If it uses the shared figure kit that is a real problem; if it`);
  console.log(`predates the kit — touch-journey does — use its own checker instead:`);
  console.log(`  node ${story}/tools/layout-check.js`);
  process.exit(1);
}

console.log(failed
  ? `\nlayout-check: ${failed} problem(s).`
  : `\nlayout-check: ${pages.length * WIDTHS.length} page/width combinations clean, ` +
    `${totalClicks} control interactions.`);
process.exit(failed ? 1 : 0);
