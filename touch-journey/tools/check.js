#!/usr/bin/env node
/* tools/check.js — content audit. No dependencies, no browser, no render.
 *
 *   node tools/check.js
 *
 * Catches the failure modes this page has actually hit during authoring.
 * Run it after any edit to a .qmd. Exit code 1 if anything is wrong, so it
 * can go in a pre-commit hook.
 *
 * Rewritten for the Quarto conversion. The prose used to live in journey.js
 * and was loaded with vm; it is markdown now, so this reads the .qmd files
 * directly. Two things improved in the move:
 *
 *   · figure captions are audited. They used to live in page.js, outside
 *     everything this script looked at, which the old README flagged as a
 *     trap ("grep both before an editing pass"). They are in the .qmd now.
 *   · the reference list is citeproc's problem, so the old broken-anchor and
 *     numbering checks are gone. What is left is whether a citation key
 *     resolves to a real entry in refs.bib.
 *
 * What it still does NOT catch (needs a browser — see HANDOFF.md):
 *   · figures whose SVG overflows its viewBox
 *   · helper text that fails to update when its control toggles
 *   · anything about layout
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");

const problems = [];
const notes = [];
const fail = m => problems.push(m);
const note = m => notes.push(m);

/* ── load the sources ─────────────────────────────────────────── */
const QMD = fs.readdirSync(root).filter(f => f.endsWith(".qmd")).sort();
if (!QMD.length) fail("no .qmd files found — is tools/check.js still next to them?");

const pages = QMD.map(f => ({ file: f, text: read(f) }));

/* figure data is still JavaScript, because it is drawn rather than read */
const ctx = vm.createContext({});
vm.runInContext(read("js/figure-data.js"), ctx, { filename: "figure-data.js" });
const { CLAIMS, REVISIONS } = vm.runInContext("({CLAIMS,REVISIONS})", ctx);

/* bibliography keys */
const bib = read("refs.bib");
const bibKeys = new Set([...bib.matchAll(/^@\w+\{([^,\s]+),/gm)].map(m => m[1]));

/* scene names the figure layer knows about */
const scenesSrc = read("js/scenes.js");
const figuresSrc = read("js/figures.js");
const knownScenes = new Set();
(scenesSrc.match(/(\w+)\s*:\s*scene[A-Z]\w*/g) || [])
  .forEach(m => knownScenes.add(m.split(":")[0].trim()));
(figuresSrc.match(/case\s+"(\w+)":/g) || [])
  .forEach(m => knownScenes.add(m.match(/"(\w+)"/)[1]));

/* ── strip fences and front matter, keep what a reader sees ───── */
const proseOf = text => text
  .replace(/^---\n[\s\S]*?\n---\n/, "")      // YAML front matter
  .replace(/^:::+\s*\{[^}]*\}\s*$/gm, "")    // opening div fences
  .replace(/^:::+\s*$/gm, "");               // closing fences

const prose = pages.map(p => [p.file, proseOf(p.text)]);
const allText = prose.map(p => p[1]).join("\n");

/* ── 1. citations resolve ─────────────────────────────────────── */
const cited = new Set();
prose.forEach(([where, s]) => {
  (s.match(/\[@[^\]]+\]/g) || []).forEach(tok => {
    tok.slice(1, -1).split(";").forEach(part => {
      const m = part.trim().match(/^@([A-Za-z][\w:.#$%&+?<>~/-]*)$/);
      if (!m) { fail(`malformed citation ${tok} in ${where}`); return; }
      if (!bibKeys.has(m[1])) fail(`citation @${m[1]} in ${where} has no entry in refs.bib`);
      else cited.add(m[1]);
    });
  });
});
/* An entry can reach a reader two ways: cited in the prose, or linked by URL
   from the further-reading list (which uses direct links so that nocite: @*
   keeps the complete list in journey order rather than reshuffling it). Only
   an entry reachable by neither is dead. */
const bibUrl = {};
[...bib.matchAll(/^@\w+\{([^,\s]+),([\s\S]*?)\n\}/gm)].forEach(m => {
  const u = m[2].match(/url\s*=\s*\{([^}]*)\}/);
  if (u) bibUrl[m[1]] = u[1].trim();
});
[...bibKeys].forEach(k => {
  const linked = bibUrl[k] && allText.includes(bibUrl[k]);
  if (!cited.has(k) && !linked)
    note(`refs.bib has "${k}" but nothing cites or links it — dead entry?`);
});

/* ── 2. the old markup is really gone ─────────────────────────── */
prose.forEach(([where, s]) => {
  if (/\[ref:/.test(s)) fail(`${where}: leftover [ref:] markup — should be [@key] now`);
  if (/\{\{[^}]*\|/.test(s)) fail(`${where}: leftover {{Page|text}} markup — should be a .wiki link now`);
});

/* ── 3. wikipedia links are well formed ───────────────────────── */
prose.forEach(([where, s]) => {
  (s.match(/\[[^\]]*\]\([^)]*\)\{\.wiki\}/g) || []).forEach(tok => {
    const m = tok.match(/^\[([^\]]*)\]\(([^)]*)\)/);
    if (!m[1].trim()) fail(`empty wiki link text in ${where}: ${tok}`);
    if (!/^https:\/\/en\.wikipedia\.org\/wiki\/\S+$/.test(m[2]))
      fail(`${where}: .wiki link does not point at English Wikipedia: ${m[2]}`);
    if (/\s/.test(m[2]))
      fail(`${where}: wiki URL contains a space (use underscores): ${m[2]}`);
  });
});

/* ── 4. every stop has the parts a stop needs ─────────────────── */
const STOP_RE = /^## (.+?) \{#([\w-]+) \.stop data-stop="([\w-]+)"\}\s*$/gm;
const stops = [];
pages.forEach(p => {
  const heads = [...p.text.matchAll(/^## .*$/gm)];
  [...p.text.matchAll(STOP_RE)].forEach(m => {
    const start = m.index;
    const next = heads.find(h => h.index > start);
    stops.push({
      file: p.file, title: m[1], id: m[2], stop: m[3],
      block: p.text.slice(start, next ? next.index : undefined)
    });
  });
});

const seenId = new Set(), seenStop = new Set();
stops.forEach(s => {
  if (s.id !== s.stop)
    note(`stop "${s.stop}" in ${s.file} has heading id "${s.id}" — they usually match`);
  if (seenId.has(s.id)) fail(`duplicate heading id "${s.id}"`);
  seenId.add(s.id);
  if (seenStop.has(s.stop)) fail(`duplicate data-stop "${s.stop}"`);
  seenStop.add(s.stop);

  const need = [
    [/:::+ \{\.year\}/, "a .year eyebrow"],
    [/:::+ \{\.lead\}/, "a .lead"],
    [/:::+ \{\.src\}/, "a .src research block"],
    [/:::+ \{\.journey-figure/, "a figure"],
  ];
  need.forEach(([re, what]) => {
    if (!re.test(s.block)) fail(`stop "${s.stop}" (${s.file}) is missing ${what}`);
  });
  if (!/:::+ \{\.hands\}/.test(s.block))
    note(`stop "${s.stop}" has no "for your hands" takeaway`);

  /* the research block must sit above the figure — a reader should not meet
     a claim before they meet its source. This ordering was a real bug once. */
  const src = s.block.search(/:::+ \{\.src\}/);
  const fig = s.block.search(/:::+ \{\.journey-figure/);
  if (src > -1 && fig > -1 && src > fig)
    fail(`stop "${s.stop}": the .src block sits below the figure — it belongs above it`);
});

/* ── 5. figures name a scene that exists ──────────────────────── */
let figureCount = 0;
/* read the raw page, not the prose: data-scene lives on the fence line, and
   proseOf() strips fence lines. Counting prose here silently reported zero. */
pages.forEach(({ file: where, text: s }) => {
  (s.match(/data-scene="([\w-]+)"/g) || []).forEach(tok => {
    figureCount++;
    const name = tok.match(/"([\w-]+)"/)[1];
    if (!knownScenes.has(name))
      fail(`${where}: figure wants scene "${name}", which the figure layer does not define`);
  });
});
pages.forEach(p => {
  (p.text.match(/:::+ \{\.journey-figure(?![^}]*data-scene)/g) || []).forEach(() =>
    fail(`${p.file}: a .journey-figure has no data-scene`));
});

/* ── 6. claims figure keeps its shape ─────────────────────────── */
const sorted = CLAIMS.every((c, i, a) => i === 0 || a[i - 1].s >= c.s);
if (!sorted) fail("CLAIMS is not in descending order of confidence — the figure reads as a gradient and depends on it");
if (CLAIMS[CLAIMS.length - 1].s > 0.4)
  fail("the weakest claim has drifted above 0.4 — the point of the figure is that the hormone claims sit low");

/* ── 7. counts stated in prose match reality ──────────────────── */
const words = {twelve:12, eleven:11, ten:10, nine:9, eight:8, seven:7, six:6,
               five:5, four:4, three:3, two:2};
const stopClaim = allText.match(/\b(\w+) short stops\b/);
if (stopClaim && words[stopClaim[1].toLowerCase()] !== stops.length)
  fail(`the text says "${stopClaim[1]} short stops" but there are ${stops.length}`);

const ruleItems = (pages.find(p => /\{\.rules\}/.test(p.text)) || {text:""})
  .text.split(/:::+ \{\.rules\}/)[1];
const ruleCount = ruleItems ? (ruleItems.split(/^:::+\s*$/m)[0].match(/^- \*\*/gm) || []).length : 0;
const ruleClaim = allText.match(/\b(\w+) things we came away with\b/);
if (ruleClaim && words[ruleClaim[1].toLowerCase()] !== ruleCount)
  fail(`the closing says "${ruleClaim[1]} things we came away with" but the list has ${ruleCount}`);

const cardClaim = allText.match(/\b(\w+) corrections from the last decade\b/);
if (cardClaim && words[cardClaim[1].toLowerCase()] !== REVISIONS.length)
  fail(`a caption says "${cardClaim[1]} corrections" but REVISIONS has ${REVISIONS.length}`);

/* ── 8. phrasings that have caused trouble before ─────────────── */
const risky = [
  [/\bproves?\b/i, "'proves' — almost nothing here proves anything"],
  [/\bwhat you learned\b/i, "assumes the reader was taught anatomy"],
  [/\bas you know\b/i, "assumes prior knowledge"],
  [/\bobviously\b/i, "'obviously'"],
  [/\bproportional to\b/i, "'proportional to' — check the paper actually says proportional"],
  [/\bcontents rail\b/i, "the contents rail is gone; navigation is Quarto's sidebar now"],
  [/\bis wasted\b/i, "a measurement carrying a practice conclusion — see HANDOFF.md"],
  [/\bglabrous\b/i, "'glabrous' — the page says 'hairless' for a reader with no science background"],
  [/\bneuropathy\b/i, "'neuropathy' — the page says 'nerve disease'"]
];
prose.forEach(([where, s]) => risky.forEach(([re, why]) => {
  if (re.test(s)) fail(`${where}: ${why}`);
}));

/* ── report ───────────────────────────────────────────────────── */
const wikiLinks = (allText.match(/\{\.wiki\}/g) || []).length;
console.log(`pages ${QMD.length} · stops ${stops.length} · figures ${figureCount} · ` +
  `references ${bibKeys.size} · cited ${cited.size} · wiki links ${wikiLinks} · ` +
  `claims ${CLAIMS.length} · rules ${ruleCount}`);
notes.forEach(n => console.log("  note  " + n));
if (problems.length) {
  problems.forEach(p => console.log("  FAIL  " + p));
  console.log(`\n${problems.length} problem${problems.length > 1 ? "s" : ""}.`);
  process.exit(1);
}
console.log("\nall checks pass.");
