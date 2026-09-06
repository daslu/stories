/* figures.js — mounts the interactive figures into the pages.
 *
 * Was page.js, which assembled the whole single-file document: prose,
 * citations, reference list and figures. Quarto now does everything except
 * the figures, so the prose assembly, the [ref:] expander and the citation
 * numberer are all gone. What is left is the part a static site generator
 * genuinely cannot do.
 *
 * A figure in a .qmd looks like this:
 *
 *     ::: {.journey-figure data-scene="roads"}
 *     The caption, as markdown.
 *     :::
 *
 * The div arrives holding only its caption. mountAll() puts the controls and
 * the drawing above it and leaves the caption underneath, so caption text
 * stays in the document where an editor — and tools/check.js — can see it.
 *
 * Load order: figure-data.js, scenes.js, then this. */

const $ = s => document.querySelector(s);

/* Every control the reader has touched keeps its value across a redraw,
   because this is module-level and render() does not reset it. */
const ST = {vel:3, vel2:3, temp:32, rec:"ct", part:"finger", gateTouch:true, bond:"stranger",
  stim:"brush", claimsShown:false, claimGuess:.7, ctx:{consent:true,known:true,warned:true},
  belief:"woman"};

/* ── the controls each figure needs, and the host the scene draws into ──
   No <figure> wrapper and no caption here: the .qmd owns both. */
function shell(scene){
  switch(scene){
    case "roads": return `
      <div class="controls">
        <button class="pill" id="sendBtn">send a touch →</button>
        <span id="sendOut" style="color:var(--ink3)">both signals leave the skin at the same instant</span>
      </div>
      <div id="roadsFig">${SCENES.roads(ST)}</div>`;
    case "micro": return `
      <div class="controls"><span>touch the skin with</span>
        <button class="pill" data-stim="brush" aria-pressed="${ST.stim==="brush"}">a soft brush</button>
        <button class="pill" data-stim="sharp" aria-pressed="${ST.stim==="sharp"}">a sharp point</button></div>
      <div id="microFig">${SCENES.micro(ST)}</div>`;
    case "speed": return `
      <div class="controls">
        <label>how fast you stroke
          <input type="range" id="vel" min="0.3" max="30" step="0.1" value="${ST.vel}"
            aria-label="Stroking speed"></label>
        <b id="velv">${ST.vel.toFixed(1)} cm/s</b>
      </div>
      <div id="speedFig">${SCENES.speed(ST)}</div>`;
    case "warmth": return `
      <div class="controls">
        <label>speed
          <input type="range" id="vel2" min="0.3" max="30" step="0.1" value="${ST.vel2}"
            aria-label="Stroking speed"></label>
        <b id="vel2v">${ST.vel2.toFixed(1)} cm/s</b>
        <span style="display:flex;gap:8px">
          ${[18,32,42].map(t=>`<button class="pill" data-temp="${t}"
            aria-pressed="${ST.temp===t}">${t}°</button>`).join("")}
        </span>
      </div>
      <div id="warmFig">${SCENES.warmth(ST)}</div>`;
    case "acuity": return `
      <div class="controls"><span>where on the body</span>
        ${PARTS.map(q=>`<button class="pill" data-part="${q.id}"
          aria-pressed="${ST.part===q.id}">${esc(q.n)}</button>`).join("")}</div>
      <div id="acuFig">${SCENES.acuity(ST)}</div>`;
    case "gate": return `
      <div class="controls">
        <button class="pill" id="gateBtn" aria-pressed="${ST.gateTouch}">${ST.gateTouch?"hand on the skin":"no touch"}</button>
        <span id="gateHint" style="color:var(--ink3)">${ST.gateTouch?"tap to take the hand away":"tap to put the hand back"}</span></div>
      <div id="gateFig">${SCENES.gate(ST)}</div>`;
    case "topography": return `
      <div class="controls"><span>who is touching you</span>
        ${BONDS.map(z=>`<button class="pill" data-bond2="${z.id}"
          aria-pressed="${ST.bond===z.id}">${esc(z.n)}</button>`).join("")}</div>
      <div id="topoFig">${SCENES.topography(ST)}</div>`;
    case "claims": return `
      <div id="claimsCtl">${claimsControls()}</div>
      <div id="claimsFig">${SCENES.claims(ST)}</div>`;
    case "context": return `
      <div class="controls"><span>everything physical stays the same — change only:</span>
        ${CTX.map(c=>`<button class="pill" data-ctx="${c.id}"
          aria-pressed="${ST.ctx[c.id]}">${esc(c.n)}</button>`).join("")}</div>
      <div class="controls"><span>and, in the measured study, who they believed it came from</span>
        ${BELIEF.map(b=>`<button class="pill" data-belief="${b.id}"
          aria-pressed="${ST.belief===b.id}">${esc(b.n)}</button>`).join("")}</div>
      <div id="ctxFig">${SCENES.context(ST)}</div>`;
    case "revisions": return `
      <div class="cards" id="cards">${REVISIONS.map((r,i)=>`
        <button class="flip" data-i="${i}" aria-pressed="false">
          <div class="side"><span>what we said</span>${esc(r.old)}</div>
          <div class="tap">tap for the correction</div>
        </button>`).join("")}</div>`;
    default:
      return `<div id="${scene}Fig">${SCENES[scene](ST)}</div>`;
  }
}

const claimsControls = () => ST.claimsShown
  ? `<div class="controls"><button class="pill" id="claimsHide">hide the answers again</button></div>`
  : `<div class="controls">
      <span>before you look — how well supported is <b style="font-family:Fraunces,serif">“touch measurably raises oxytocin”</b>?</span>
      <input type="range" id="claimGuess" min="0" max="1" step=".01" value="${ST.claimGuess}"
        aria-label="Your estimate">
      <button class="pill" id="claimsShow">show the answers</button></div>`;

/* ── mounting ──────────────────────────────────────────────────
   The caption is whatever the .qmd put inside the div. It is captured once
   and put back on every redraw, so a viewport flip does not eat it. */
const CAPTIONS = new WeakMap();

function mountAll(){
  document.querySelectorAll(".journey-figure").forEach(el => {
    const scene = el.dataset.scene;
    if(!scene) return;
    if(!SCENES[scene] && scene !== "revisions"){
      console.warn(`figures.js: no scene named "${scene}"`);
      return;
    }
    if(!CAPTIONS.has(el)) CAPTIONS.set(el, el.innerHTML.trim());
    const cap = CAPTIONS.get(el);
    el.innerHTML = shell(scene) + (cap ? `<div class="cap">${cap}</div>` : "");
  });
}

/* ── wiring ────────────────────────────────────────────────────── */
function wire(){
  const v=$("#vel");
  if(v) v.oninput=()=>{ ST.vel=+v.value; $("#velv").textContent=ST.vel.toFixed(1)+" cm/s";
    $("#speedFig").innerHTML=SCENES.speed(ST); stroke(); };
  const v2=$("#vel2");
  if(v2) v2.oninput=()=>{ ST.vel2=+v2.value; $("#vel2v").textContent=ST.vel2.toFixed(1)+" cm/s";
    $("#warmFig").innerHTML=SCENES.warmth(ST); };
  document.querySelectorAll("[data-temp]").forEach(b=>b.onclick=()=>{
    ST.temp=+b.dataset.temp;
    document.querySelectorAll("[data-temp]").forEach(z=>
      z.setAttribute("aria-pressed", +z.dataset.temp===ST.temp));
    $("#warmFig").innerHTML=SCENES.warmth(ST); });
  const sb=$("#sendBtn");
  if(sb) sb.onclick=()=>sendTouch();
  document.querySelectorAll("[data-stim]").forEach(b=>b.onclick=()=>{
    ST.stim=b.dataset.stim;
    document.querySelectorAll("[data-stim]").forEach(z=>
      z.setAttribute("aria-pressed", z.dataset.stim===ST.stim));
    $("#microFig").innerHTML=SCENES.micro(ST); });
  const cg=$("#claimGuess");
  if(cg) cg.oninput=()=>{ ST.claimGuess=+cg.value; $("#claimsFig").innerHTML=SCENES.claims(ST); };
  const swapClaims=v=>{
    ST.claimsShown=v;
    $("#claimsCtl").innerHTML = claimsControls();
    $("#claimsFig").innerHTML=SCENES.claims(ST);
    wire();
  };
  const cs=$("#claimsShow"); if(cs) cs.onclick=()=>swapClaims(true);
  const ch=$("#claimsHide"); if(ch) ch.onclick=()=>swapClaims(false);
  document.querySelectorAll("[data-ctx]").forEach(b=>b.onclick=()=>{
    ST.ctx[b.dataset.ctx]=!ST.ctx[b.dataset.ctx];
    b.setAttribute("aria-pressed", ST.ctx[b.dataset.ctx]);
    const c=CTX.find(z=>z.id===b.dataset.ctx);
    b.textContent = ST.ctx[b.dataset.ctx] ? c.n : c.off;
    $("#ctxFig").innerHTML=SCENES.context(ST); });
  document.querySelectorAll("[data-belief]").forEach(b=>b.onclick=()=>{
    ST.belief=b.dataset.belief;
    document.querySelectorAll("[data-belief]").forEach(z=>
      z.setAttribute("aria-pressed", z.dataset.belief===ST.belief));
    $("#ctxFig").innerHTML=SCENES.context(ST); });
  document.querySelectorAll("[data-rec]").forEach(g=>g.onclick=()=>{
    ST.rec=g.dataset.rec; $("#skinFig").innerHTML=SCENES.skin(ST); wire(); });
  document.querySelectorAll("[data-part]").forEach(b=>b.onclick=()=>{
    ST.part=b.dataset.part;
    document.querySelectorAll("[data-part]").forEach(z=>
      z.setAttribute("aria-pressed", z.dataset.part===ST.part));
    $("#acuFig").innerHTML=SCENES.acuity(ST); });
  const gb=$("#gateBtn");
  if(gb) gb.onclick=()=>{ ST.gateTouch=!ST.gateTouch;
    gb.setAttribute("aria-pressed",ST.gateTouch);
    gb.textContent = ST.gateTouch ? "hand on the skin" : "no touch";
    const gh=$("#gateHint");
    if(gh) gh.textContent = ST.gateTouch ? "tap to take the hand away" : "tap to put the hand back";
    $("#gateFig").innerHTML=SCENES.gate(ST); };
  const setBond=id=>{ ST.bond=id;
    document.querySelectorAll("[data-bond2]").forEach(z=>
      z.setAttribute("aria-pressed", z.dataset.bond2===ST.bond));
    $("#topoFig").innerHTML=SCENES.topography(ST); wire(); };
  document.querySelectorAll("[data-bond2]").forEach(b=>b.onclick=()=>setBond(b.dataset.bond2));
  document.querySelectorAll("[data-bond]").forEach(r=>r.onclick=()=>setBond(r.dataset.bond));
  document.querySelectorAll(".flip").forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i, r=REVISIONS[i], on=b.getAttribute("aria-pressed")==="true";
    b.setAttribute("aria-pressed", !on);
    b.innerHTML = on
      ? `<div class="side"><span>what we said</span>${esc(r.old)}</div>
         <div class="tap">tap for the correction</div>`
      : `<div class="side"><span>what we say now</span>${esc(r.neu)}</div>
         <div class="tap">${esc(r.src)}</div>`;
  });
}

/* Send one touch up both roads, in real time. A fast fibre crosses a forearm
   in a few hundredths of a second; the slow one takes about a second. Nothing
   here is sped up or slowed down — the gap is the point. */
let sendRaf=null;
function sendTouch(){
  const fp=document.getElementById("fastPath"), sp=document.getElementById("slowPath");
  const fd=document.getElementById("fastDot"), sd=document.getElementById("slowDot");
  const fl=document.getElementById("fastLand"), sl=document.getElementById("slowLand");
  const out=$("#sendOut");
  if(!fp||!sp||!fd||!sd) return;
  if(sendRaf) cancelAnimationFrame(sendRaf);
  if(matchMedia("(prefers-reduced-motion:reduce)").matches){
    [fd,sd,fl,sl].forEach(el=>el&&el.setAttribute("opacity","1"));
    if(out) out.textContent="the slow signal lands about a second after the fast one";
    return;
  }
  const FL=fp.getTotalLength(), SL=sp.getTotalLength();
  const FAST=0.06, SLOW=1.0;                       // seconds, as in a real forearm
  [fl,sl].forEach(el=>el&&el.setAttribute("opacity","0"));
  const t0=performance.now();
  const step=now=>{
    const t=(now-t0)/1000;
    const f=Math.min(t/FAST,1), s=Math.min(t/SLOW,1);
    const pf=fp.getPointAtLength(FL*f), ps=sp.getPointAtLength(SL*s);
    fd.setAttribute("opacity", f<1?"1":"0.3"); fd.setAttribute("cx",pf.x); fd.setAttribute("cy",pf.y);
    sd.setAttribute("opacity", s<1?"1":"0.3"); sd.setAttribute("cx",ps.x); sd.setAttribute("cy",ps.y);
    if(f>=1&&fl) fl.setAttribute("opacity","1");
    if(s>=1&&sl) sl.setAttribute("opacity","1");
    if(out) out.textContent = s<1
      ? `fast signal arrived · the slow one is still travelling — ${(SLOW-t).toFixed(1)}s to go`
      : "the slow signal landed about a second after the fast one";
    if(f<1||s<1) sendRaf=requestAnimationFrame(step); else sendRaf=null;
  };
  sendRaf=requestAnimationFrame(step);
}

/* the dot travels at the true speed — 15 cm of forearm */
let raf=null;
function stroke(){
  if(raf) cancelAnimationFrame(raf);
  if(matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const step=ts=>{
    const el=document.getElementById("stroker");
    if(!el){ raf=null; return; }
    /* geometry comes from the scene, because it differs by layout */
    const secs=15/ST.vel, g=STROKE_GEOM;
    const u=((ts/1000)/secs)%2, f=u<1?u:2-u;
    el.setAttribute("cx", g.x+f*g.span);
    raf=requestAnimationFrame(step);
  };
  raf=requestAnimationFrame(step);
}

/* ── choosing the layout from the box, not the viewport ────────
   A label is drawn at `fontsize x (box px / W)`. At W=860 a 13u label needs
   about 600px of box to clear 9px, below which it stops being readable. The
   single-file original could infer that from the viewport because the page
   was the whole width; with a sidebar and a margin TOC it cannot, so measure
   the figure itself. */
const WIDE_MIN = 640;

function boxWidth(){
  const f = document.querySelector(".journey-figure");
  if(!f) return window.innerWidth;
  const cs = getComputedStyle(f);
  return f.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
}

/* One full redraw. Called once at load, and again whenever the drawing box
   crosses the narrow/wide boundary, because the scenes are drawn at a
   different width on each side of it. */
let lastNarrow = null;
function render(){
  const narrow = boxWidth() < WIDE_MIN;
  lastNarrow = narrow;
  layout(narrow);
  mountAll();
  document.querySelectorAll(".journey-figure")
    .forEach(el => el.classList.toggle("is-narrow", narrow));
  wire();
  stroke();
}

render();

/* Re-render only when the decision actually flips, not on every resize tick. */
const recheck = () => { if((boxWidth() < WIDE_MIN) !== lastNarrow) render(); };
if(typeof ResizeObserver === "function"){
  const target = document.querySelector(".journey-figure");
  if(target) new ResizeObserver(recheck).observe(target);
}
window.addEventListener("resize", recheck);
