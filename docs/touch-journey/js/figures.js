/* figures.js — what each figure is called, what it can be operated with, and
 * what it draws. The machinery is in ../shared/figure-kit.js; the drawings are
 * in scenes.js; this file is the join between them.
 *
 * This story was written before the kit and hand-wired every control. The
 * migration happened because the shared layout checker operates controls by
 * the kit's own attributes — so pointed here it could not click anything, and
 * reported "clean" without exercising a single control. A checker that
 * under-reports is worse than no checker; this file is what fixed it.
 *
 * Nothing about the drawings changed. Controls are declared now rather than
 * wired, which closes the two error classes HANDOFF §5 records: a control that
 * was never connected at all, and a hint that went on saying "tap to take the
 * hand away" after the hand was already away. The kit renders a toggle's label
 * from its value, so neither mistake is available any more.
 *
 * Four figures need more than a declaration and use the `after` hook, which
 * runs after every draw, the first one included. Redrawing replaces the
 * drawing and takes its event listeners with it, so anything attached to part
 * of a drawing has to be re-attached there — and must be safe to run twice.
 */

/* ── the two animations ────────────────────────────────────────────────
   Unchanged, apart from reading Fig.state instead of a private ST object. */

/* Send one touch up both roads, in real time. A fast fibre crosses a forearm
   in a few hundredths of a second; the slow one takes about a second. Nothing
   here is sped up or slowed down — the gap is the point. */
let sendRaf = null;
function sendTouch(){
  const fp = document.getElementById("fastPath"), sp = document.getElementById("slowPath");
  const fd = document.getElementById("fastDot"),  sd = document.getElementById("slowDot");
  const fl = document.getElementById("fastLand"), sl = document.getElementById("slowLand");
  const out = document.querySelector('[data-fig-note="send"]');
  if(!fp || !sp || !fd || !sd) return;
  if(sendRaf) cancelAnimationFrame(sendRaf);
  if(matchMedia("(prefers-reduced-motion:reduce)").matches){
    [fd, sd, fl, sl].forEach(el => el && el.setAttribute("opacity", "1"));
    if(out) out.textContent = "the slow signal lands about a second after the fast one";
    return;
  }
  const FL = fp.getTotalLength(), SL = sp.getTotalLength();
  const FAST = 0.06, SLOW = 1.0;                   // seconds, as in a real forearm
  [fl, sl].forEach(el => el && el.setAttribute("opacity", "0"));
  const t0 = performance.now();
  const step = now => {
    const t = (now - t0) / 1000;
    const f = Math.min(t / FAST, 1), sv = Math.min(t / SLOW, 1);
    const pf = fp.getPointAtLength(FL * f), ps = sp.getPointAtLength(SL * sv);
    fd.setAttribute("opacity", f < 1 ? "1" : "0.3");
    fd.setAttribute("cx", pf.x); fd.setAttribute("cy", pf.y);
    sd.setAttribute("opacity", sv < 1 ? "1" : "0.3");
    sd.setAttribute("cx", ps.x); sd.setAttribute("cy", ps.y);
    if(f >= 1 && fl) fl.setAttribute("opacity", "1");
    if(sv >= 1 && sl) sl.setAttribute("opacity", "1");
    if(out) out.textContent = sv < 1
      ? `fast signal arrived · the slow one is still travelling — ${(SLOW - t).toFixed(1)}s to go`
      : "the slow signal landed about a second after the fast one";
    if(f < 1 || sv < 1) sendRaf = requestAnimationFrame(step); else sendRaf = null;
  };
  sendRaf = requestAnimationFrame(step);
}

/* The stroking dot travels at the true speed, over 15 cm of forearm. Its
   travel span comes from STROKE_GEOM, which sceneSpeed sets as it draws,
   because the arm sits in a different place in each layout. */
let raf = null;
function stroke(){
  if(raf) cancelAnimationFrame(raf);
  if(matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const step = ts => {
    const el = document.getElementById("stroker");
    if(!el){ raf = null; return; }
    const secs = 15 / Fig.state.vel, g = STROKE_GEOM;
    const u = ((ts / 1000) / secs) % 2, f = u < 1 ? u : 2 - u;
    el.setAttribute("cx", g.x + f * g.span);
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

/* ── the figures ───────────────────────────────────────────────────────── */

Fig
  .add("roads", {
    controls: [
      {type:"action", key:"send", n:"send a touch →",
       note:"both signals leave the skin at the same instant",
       run:() => sendTouch()}
    ],
    draw: SCENES.roads
  })

  .add("micro", {
    controls: [
      {type:"pills", key:"stim", label:"touch the skin with",
       options:[{id:"brush", n:"a soft brush"}, {id:"sharp", n:"a sharp point"}]}
    ],
    draw: SCENES.micro
  })

  .add("patient", {draw: SCENES.patient})

  .add("speed", {
    controls: [
      {type:"range", key:"vel", label:"how fast you stroke", min:0.3, max:30, step:0.1,
       aria:"Stroking speed", fmt:v => `${v.toFixed(1)} cm/s`}
    ],
    draw: SCENES.speed,
    /* the dot has to be set going again after every redraw */
    after: () => stroke()
  })

  .add("warmth", {
    controls: [
      {type:"range", key:"vel2", label:"speed", min:0.3, max:30, step:0.1,
       aria:"Stroking speed", fmt:v => `${v.toFixed(1)} cm/s`},
      /* the scene compares these with === against numbers */
      {type:"pills", key:"temp", coerce:"number",
       options:[{id:18, n:"18°"}, {id:32, n:"32°"}, {id:42, n:"42°"}]}
    ],
    draw: SCENES.warmth
  })

  .add("skin", {
    draw: SCENES.skin,
    /* the receptors are clickable inside the drawing itself */
    after: (st, api) => {
      document.querySelectorAll("[data-rec]").forEach(g => g.onclick = () => {
        st.rec = g.dataset.rec; api.redraw();
      });
    }
  })

  .add("acuity", {
    controls: [
      {type:"pills", key:"part", label:"where on the body",
       options:PARTS.map(q => ({id:q.id, n:q.n}))}
    ],
    draw: SCENES.acuity
  })

  .add("gate", {
    controls: [
      {type:"toggle", key:"gateTouch", on:"hand on the skin", off:"no touch",
       hint:{on:"tap to take the hand away", off:"tap to put the hand back"}}
    ],
    draw: SCENES.gate
  })

  .add("topography", {
    controls: [
      {type:"pills", key:"bond", label:"who is touching you",
       options:BONDS.map(z => ({id:z.id, n:z.n}))}
    ],
    draw: SCENES.topography,
    /* the bars in the drawing select the same thing the buttons do */
    after: (st, api) => {
      document.querySelectorAll("[data-bond]").forEach(r => r.onclick = () => {
        st.bond = r.dataset.bond;
        document.querySelectorAll('[data-fig-set="bond"]').forEach(z =>
          z.setAttribute("aria-pressed", z.dataset.figVal === st.bond));
        api.redraw();
      });
    }
  })

  /* The one predict-then-reveal on the page, and the only figure whose control
     row changes shape: before the reveal it is a question and a slider, after
     it is a way back. That is what declaring `controls` as a function of state
     is for, and the reveal calls refresh() rather than redraw() so the row is
     rebuilt along with the drawing. */
  .add("claims", {
    controls: st => st.claimsShown
      ? [{type:"action", key:"claimsHide", n:"hide the answers again",
          run:(s, api) => { s.claimsShown = false; api.refresh(); }}]
      : [{type:"text", key:"claimsAsk",
          html:`before you look — how well supported is
                <b style="font-family:Fraunces,serif">&ldquo;touch measurably raises oxytocin&rdquo;</b>?`},
         {type:"range", key:"claimGuess", min:0, max:1, step:0.01,
          aria:"Your estimate"},
         {type:"action", key:"claimsShow", n:"show the answers",
          run:(s, api) => { s.claimsShown = true; api.refresh(); }}],
    draw: SCENES.claims
  })

  .add("context", {
    controls: [
      [{type:"text", key:"ctxAsk",
        html:"everything physical stays the same — change only:"},
       ...CTX.map(c => ({type:"toggle", key:`ctx.${c.id}`, on:c.n, off:c.off}))],
      [{type:"text", key:"beliefAsk",
        html:"and, in the measured study, who they believed it came from"},
       {type:"pills", key:"belief", options:BELIEF.map(b => ({id:b.id, n:b.n}))}]
    ],
    draw: SCENES.context
  })

  /* Not an SVG at all: four cards that turn over. `draw` may return any
     markup, so the kit needs no special case for it. */
  .add("revisions", {
    draw: () => `<div class="cards">${REVISIONS.map((r, i) => `
      <button class="flip" data-i="${i}" data-fig-click="flip-${i}" aria-pressed="false">
        <div class="side"><span>what we said</span>${esc(r.old)}</div>
        <div class="tap">tap for the correction</div>
      </button>`).join("")}</div>`,
    after: () => {
      document.querySelectorAll(".flip").forEach(b => b.onclick = () => {
        const r = REVISIONS[+b.dataset.i], on = b.getAttribute("aria-pressed") === "true";
        b.setAttribute("aria-pressed", !on);
        b.innerHTML = on
          ? `<div class="side"><span>what we said</span>${esc(r.old)}</div>
             <div class="tap">tap for the correction</div>`
          : `<div class="side"><span>what we say now</span>${esc(r.neu)}</div>
             <div class="tap">${esc(r.src)}</div>`;
      });
    }
  });

Fig.start({
  vel: 3, vel2: 3, temp: 32, rec: "ct", part: "finger", gateTouch: true,
  bond: "stranger", stim: "brush", claimsShown: false, claimGuess: 0.7,
  ctx: {consent: true, known: true, warned: true}, belief: "woman"
});
