/* scenes.js — the illustrations for the breathing journey.
 *
 * Same rules as the rest of the family: no gridlines, rounded caps, soft
 * fills, and every scene branches on NARROW. A coloured label uses
 * style="fill:…" and never the fill attribute, because the text classes set
 * fill and a presentation attribute loses to a class. A foreignObject's
 * declared height is what getBBox reports, so reserve enough for the text.
 * And after moving anything, look at the figure — the layout checker compares
 * text with text and cannot see a shape covering a label.
 */

/* ══ 1. what an ordinary rate looks like ═══════════════════════════════
   Two named bands on one rate axis, with the reader's chosen rate on it and
   the same rate expressed as a breath length, which is the number anyone
   actually uses when they pace their breathing. */
function sceneRates(st){
  const rate = st.rate;
  const PAD = NARROW ? 14 : 70;
  const X0 = PAD, X1 = W - PAD;
  const x = v => X0 + ((v - RATES.min) / (RATES.max - RATES.min)) * (X1 - X0);
  const AY = NARROW ? 210 : 168;
  const noteH = NARROW ? 122 : 84;
  const H = AY + 100 + noteH + 12;

  let s = svgOpen(H, `Breathing at ${rate.toFixed(1)} breaths a minute`);

  const band = (b, y, colour, dy) => {
    let t = `<rect x="${r2(x(b.lo))}" y="${y}" width="${r2(x(b.hi) - x(b.lo))}" height="26" rx="13"
      fill="var(${colour})" opacity=".18"/>`;
    t += `<text class="xs" x="${r2(x(b.lo))}" y="${y + dy}">${esc(b.n)}</text>`;
    t += `<text class="xs" x="${r2(x(b.lo))}" y="${y + 18}" style="fill:var(${colour})">${b.lo}</text>`;
    t += `<text class="xs" x="${r2(x(b.hi))}" y="${y + 18}" text-anchor="end"
      style="fill:var(${colour})">${b.hi}</text>`;
    return t;
  };
  s += band(RATES.slow,     NARROW ?  84 :  62, "--sage", -8);
  s += band(RATES.ordinary, NARROW ? 146 : 118, "--blue", -8);

  /* the axis the reader moves along */
  s += track(X0, X1, AY, {left: `${RATES.min} a minute`, right: `${RATES.max} a minute`});
  s += `<circle cx="${r2(x(rate))}" cy="${AY}" r="9" fill="var(--clay)"/>`;

  /* the same rate as a breath length, which is how anyone actually paces it */
  const secs = 60 / rate;
  s += `<text class="big" x="${X0}" y="${AY + 66}" style="font-size:30px;fill:var(--clay)">${
    secs.toFixed(1)} seconds a breath</text>`;
  const where = rate <= RATES.slow.hi && rate >= RATES.slow.lo
    ? "inside what the literature calls slow breathing"
    : rate > RATES.ordinary.hi ? "faster than an ordinary resting rate"
    : rate < RATES.slow.lo ? "slower than the studied range"
    : "an ordinary resting rate";
  s += `<text class="sm" x="${X0}" y="${AY + 88}" style="fill:var(--ink2)">${esc(where)}</text>`;

  s += prose(X0, AY + 100, X1 - X0, noteH,
    `The two bands overlap at ten, which is where most people expect a gap. "Slow
     breathing" in the research does not begin somewhere exotic — it begins one
     breath below an ordinary resting rate, and the rate everything else on this
     page is about is <b>${RATES.best} a minute</b>, a ${(60 / RATES.best).toFixed(0)}-second breath.`);
  return s + "</svg>";
}

/* ══ 2. the oxygen curve ═══════════════════════════════════════════════
   The shape of the oxygen–haemoglobin dissociation curve, drawn from the Hill
   equation rather than from data, and the Bohr shift as a direction. The
   surprise is at the tissue end, not the lung end. */
function sceneOxygen(st){
  const co2 = st.co2;                    /* -1 blown off, 0 normal, +1 built up */
  const p50 = OXY.p50 + co2 * OXY.shift;
  const sat = (p, half) => 100 * Math.pow(p, OXY.hill) /
    (Math.pow(p, OXY.hill) + Math.pow(half, OXY.hill));

  const PAD = NARROW ? 40 : 90;
  const X0 = PAD, X1 = W - PAD;
  const BY = 286, TY = 56;
  const PMAX = 110;
  const px = p => X0 + (p / PMAX) * (X1 - X0);
  const py = v => BY - (v / 100) * (BY - TY);
  const noteH = NARROW ? 152 : 104;
  const H = BY + 58 + noteH + 14;

  let s = svgOpen(H, "How tightly haemoglobin holds oxygen, and what carbon dioxide does to it");

  s += `<line x1="${X0}" y1="${BY}" x2="${X1}" y2="${BY}" stroke="var(--rule)" stroke-width="1.5"/>`;
  s += `<line x1="${X0}" y1="${TY}" x2="${X0}" y2="${BY}" stroke="var(--rule)" stroke-width="1.5"/>`;
  s += `<text class="xs" x="${X0}" y="${TY - 12}">how much oxygen the blood is carrying, 0 to 100%</text>`;
  /* No axis-end labels: they said the same thing as the two dot labels sitting
     directly under them, which reads as two scales rather than one. */

  const curve = half => {
    let d = "";
    for(let i = 1; i <= 70; i++){
      const p = (i / 70) * PMAX;
      d += `${i === 1 ? "M" : "L"}${r2(px(p))} ${r2(py(sat(p, half)))}`;
    }
    return d;
  };
  const moved = Math.abs(co2) > 0.05;
  if(moved)
    s += `<path d="${curve(OXY.p50)}" fill="none" stroke="var(--ink3)" stroke-width="2"
      stroke-dasharray="5 4" opacity=".5"/>`;
  s += `<path d="${curve(p50)}" fill="none" stroke="var(--clay)" stroke-width="3.5"
    stroke-linecap="round"/>`;

  /* the two ends that matter */
  [[OXY.arterial, "--blue", "leaving the lungs"], [OXY.venous, "--clay", "reaching the tissue"]]
    .forEach(([p, col, label], i) => {
      const v = sat(p, p50);
      s += `<line x1="${r2(px(p))}" y1="${BY}" x2="${r2(px(p))}" y2="${r2(py(v))}"
        stroke="var(--rule)" stroke-width="1.5"/>`;
      s += `<circle cx="${r2(px(p))}" cy="${r2(py(v))}" r="7" fill="var(${col})"/>`;
      s += `<text class="sm" x="${r2(px(p))}" y="${r2(py(v)) - 14}" text-anchor="${i ? "start" : "end"}"
        style="fill:var(${col});font-weight:600">${v.toFixed(0)}%</text>`;
      s += `<text class="xs" x="${r2(px(p))}" y="${BY + 26}" text-anchor="middle">${esc(label)}</text>`;
    });

  const delivered = sat(OXY.arterial, p50) - sat(OXY.venous, p50);
  const base = sat(OXY.arterial, OXY.p50) - sat(OXY.venous, OXY.p50);
  s += prose(X0, BY + 58, X1 - X0, noteH,
    `The gap between the two dots is what actually gets handed over: <b>${
      delivered.toFixed(0)} points</b> of the blood's load${
      Math.abs(delivered - base) < 0.5 ? "" :
      `, against ${base.toFixed(0)} at normal carbon dioxide`}.
     <div style="margin-top:5px">The lung end of this curve is nearly flat, which is why
     breathing harder cannot load much more on — it is already close to full. The tissue
     end is the steep part, and that is the end carbon dioxide moves. Blow off too much
     and the curve shifts <b>left</b>: haemoglobin holds tighter and hands over
     <b>less</b>. A <b>shape</b> from the standard equation, not measured data.</div>`);
  return s + "</svg>";
}

/* ══ 3. what over-breathing does ═══════════════════════════════════════
   A chain of directions, not magnitudes. The evidence for it is deliberate
   hyperventilation in intensive care, which establishes the direction and the
   size of the lever, and says nothing about a dose on a yoga mat. */
function sceneOver(st){
  const on = !!st.over;
  const PAD = NARROW ? 14 : 90;
  const ROW = NARROW ? 74 : 62;
  const noteH = NARROW ? 128 : 92;
  const H = 56 + OVERBREATHE.length * ROW + noteH + 16;

  let s = svgOpen(H, on ? "The chain that follows breathing off too much carbon dioxide"
                        : "Breathing at rest, with nothing following from it");

  s += `<text class="xs" x="${PAD}" y="30">${
    on ? "what follows, in order" : "turn it on to follow the chain"}</text>`;

  OVERBREATHE.forEach((step, i) => {
    const y = 56 + i * ROW + 20;
    const live = on;
    const col = !live ? "--ink3" : step.dir > 0 ? "--clay" : "--blue";
    /* an arrow down the chain, drawn between the rows rather than through them */
    if(i)
      s += `<line x1="${PAD + 9}" y1="${y - ROW + 14}" x2="${PAD + 9}" y2="${y - 22}"
        stroke="var(${live ? "--rule" : "--rule"})" stroke-width="2"/>`;
    s += `<circle cx="${PAD + 9}" cy="${y - 5}" r="9" fill="var(${col})"
      opacity="${live ? .85 : .3}"/>`;
    s += `<text class="xs" x="${PAD + 9}" y="${y - 1}" text-anchor="middle"
      style="fill:var(--card)">${step.dir > 0 ? "↑" : "↓"}</text>`;
    s += `<text class="sm" x="${PAD + 30}" y="${y}"
      style="fill:var(${live ? "--ink" : "--ink3"})">${esc(step.n)}</text>`;
  });

  s += prose(PAD, 56 + OVERBREATHE.length * ROW + 6, W - PAD * 2, noteH,
    `Directions only — there is no dose on this figure, deliberately. The clearest
     evidence that the lever is real and large comes from intensive care, where
     hyperventilation is used <b>on purpose</b> to reduce pressure inside the skull,
     and where its known danger is cutting blood flow too far. That establishes the
     direction. It says nothing about how much of it a person gets from breathing
     hard on a mat, and anyone who gives you a number for that is guessing.`);
  return s + "</svg>";
}

/* ══ 4. the heart already breathes with you ════════════════════════════
   Heart rate through one breath cycle. The direction is the finding; the
   amplitude drawn is illustrative and the caption says so. */
function sceneRsa(st){
  const phase = st.phase;                  /* 0..1 through one breath */
  const PAD = NARROW ? 20 : 80;
  const X0 = PAD, X1 = W - PAD;
  const BY = 250, TY = 78;
  const hr = t => RSA.mean + RSA.swing * Math.sin(2 * Math.PI * t);
  const px = t => X0 + t * (X1 - X0);
  const py = v => BY - ((v - (RSA.mean - RSA.swing * 1.6)) /
    (RSA.swing * 3.2)) * (BY - TY);
  const noteH = NARROW ? 126 : 88;
  const H = BY + 76 + noteH;

  let s = svgOpen(H, `Heart rate part way through a breath: ${hr(phase).toFixed(0)} beats a minute`);

  /* which half of the breath we are in, drawn behind everything */
  s += `<rect x="${X0}" y="${TY - 16}" width="${r2((X1 - X0) / 2)}" height="${BY - TY + 16}"
    fill="var(--soft)" opacity=".5"/>`;
  s += `<text class="xs" x="${r2(X0 + (X1 - X0) * 0.25)}" y="${TY - 24}" text-anchor="middle">breathing in</text>`;
  s += `<text class="xs" x="${r2(X0 + (X1 - X0) * 0.75)}" y="${TY - 24}" text-anchor="middle">breathing out</text>`;

  s += `<line x1="${X0}" y1="${BY}" x2="${X1}" y2="${BY}" stroke="var(--rule)" stroke-width="1.5"/>`;

  let d = "";
  for(let i = 0; i <= 80; i++){
    const t = i / 80;
    d += `${i ? "L" : "M"}${r2(px(t))} ${r2(py(hr(t)))}`;
  }
  s += `<path d="${d}" fill="none" stroke="var(--clay)" stroke-width="3.5" stroke-linecap="round"/>`;

  const v = hr(phase);
  s += `<line x1="${r2(px(phase))}" y1="${TY - 16}" x2="${r2(px(phase))}" y2="${BY}"
    stroke="var(--dis)" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  s += `<circle cx="${r2(px(phase))}" cy="${r2(py(v))}" r="9" fill="var(--clay)"/>`;
  s += `<text class="big" x="${X0}" y="${BY + 44}" style="font-size:30px;fill:var(--clay)">${
    v.toFixed(0)} beats a minute</text>`;
  s += `<text class="sm" x="${X0}" y="${BY + 64}" style="fill:var(--ink2)">${
    esc(Math.cos(2 * Math.PI * phase) > 0 ? "rising — this is the in-breath"
      : "falling — this is the out-breath")}</text>`;

  s += prose(X0, BY + 76, X1 - X0, noteH,
    `Heart rate rises as you breathe in and falls as you breathe out. It is doing this
     right now, and anything that reads your pulse will show it to you. <b>The
     direction is the established finding; the size of the swing drawn here is
     illustrative</b> — how big yours is depends on your age, your fitness and how
     slowly you are breathing.`);
  return s + "</svg>";
}

/* ══ 5. one rate rings louder than the rest ════════════════════════════
   The resonance peak. Where the peak sits is the established part; the height
   of the hill is drawn, and the caption says so. */
function sceneResonance(st){
  const rate = st.rate2;
  const PAD = NARROW ? 30 : 84;
  const X0 = PAD, X1 = W - PAD;
  const BY = 258, TY = 62;
  const px = r => X0 + ((r - RATES.min) / (RATES.max - RATES.min)) * (X1 - X0);
  const amp = r => RESONANCE.floor + (1 - RESONANCE.floor) *
    Math.exp(-Math.pow((r - RESONANCE.peak) / RESONANCE.width, 2));
  const py = a => BY - a * (BY - TY);
  const noteH = NARROW ? 148 : 100;
  const H = BY + 78 + noteH;

  let s = svgOpen(H, `Heart rate variation when breathing at ${rate.toFixed(1)} a minute`);

  s += `<line x1="${X0}" y1="${BY}" x2="${X1}" y2="${BY}" stroke="var(--rule)" stroke-width="1.5"/>`;
  s += `<line x1="${X0}" y1="${TY}" x2="${X0}" y2="${BY}" stroke="var(--rule)" stroke-width="1.5"/>`;
  s += `<text class="xs" x="${X0}" y="${TY - 12}">how much heart rate swings with the breath</text>`;
  s += `<text class="xs" x="${X0}" y="${BY + 24}">${RATES.min} breaths a minute</text>`;
  s += `<text class="xs" x="${X1}" y="${BY + 24}" text-anchor="end">${RATES.max} a minute</text>`;

  let d = "";
  for(let i = 0; i <= 80; i++){
    const r = RATES.min + (i / 80) * (RATES.max - RATES.min);
    d += `${i ? "L" : "M"}${r2(px(r))} ${r2(py(amp(r)))}`;
  }
  s += `<path d="${d}" fill="none" stroke="var(--clay)" stroke-width="3.5" stroke-linecap="round"/>`;

  /* The peak is named below the axis, not at the top of its own line: at the
     top it sat exactly on the vertical axis title, since the peak is near the
     left-hand end and py(1) is the same height as that title. */
  s += `<line x1="${r2(px(RESONANCE.peak))}" y1="${r2(py(1))}" x2="${r2(px(RESONANCE.peak))}" y2="${BY}"
    stroke="var(--sage)" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  s += `<text class="xs" x="${r2(px(RESONANCE.peak))}" y="${BY + 44}" text-anchor="middle"
    style="fill:var(--sage)">${RESONANCE.peak} a minute — the peak</text>`;

  const a = amp(rate);
  s += `<circle cx="${r2(px(rate))}" cy="${r2(py(a))}" r="9" fill="var(--clay)"/>`;
  /* The readout lives under the plot rather than beside the dot. Centred on
     the dot it ran off both ends of the canvas once the dot reached either
     extreme of the slider. */
  s += `<text class="sm" x="${X0}" y="${BY + 66}"
    style="fill:var(--clay);font-weight:600">${Math.round(a * 100)}% of the largest swing this person gets</text>`;

  s += prose(X0, BY + 78, X1 - X0, noteH,
    `Breathe at about six a minute and the pressure sensors in your arteries are
     already correcting in the opposite direction each time — the two run half a cycle
     apart, and they add up. <b>Where the peak sits is the established finding.</b> The
     height of the hill here is drawn rather than measured, and how sharp yours is
     will not be quite this.`);
  return s + "</svg>";
}

/* ══ 6. and not the same rate for everyone ═════════════════════════════
   What predicted an individual's resonant frequency and what did not. The
   paper reports directions, so the figure shows directions and no numbers. */
function scenePredicts(st){
  const PAD = NARROW ? 14 : 80;
  const ROW = NARROW ? 76 : 58;
  const noteH = NARROW ? 116 : 82;
  const H = 60 + PREDICTS.length * ROW + noteH + 14;
  let s = svgOpen(H, "What predicted a person's best breathing rate, and what did not");

  s += `<text class="xs" x="${PAD}" y="30">56 adults · what predicted their own best rate</text>`;
  PREDICTS.forEach((p, i) => {
    const y = 60 + i * ROW + 20;
    const col = p.rel ? "--sage" : "--ink3";
    s += `<circle cx="${PAD + 9}" cy="${y - 5}" r="9" fill="var(${col})" opacity="${p.rel ? .85 : .25}"/>`;
    s += `<text class="xs" x="${PAD + 9}" y="${y - 1}" text-anchor="middle"
      style="fill:var(${p.rel ? "--card" : "--ink3"})">${p.rel ? "✓" : "–"}</text>`;
    s += `<text class="sm" x="${PAD + 30}" y="${y}"
      style="fill:var(${p.rel ? "--ink" : "--ink3"})">${esc(p.n)}</text>`;
    s += `<text class="xs" x="${PAD + 30}" y="${y + 17}">${esc(p.note)}</text>`;
  });
  s += prose(PAD, 60 + PREDICTS.length * ROW + 6, W - PAD * 2, noteH,
    `No numbers on this figure, because the paper reports these as directions rather
     than as coefficients and inventing the coefficients would be worse than leaving
     them out. One more finding worth having: a person's best rate <b>stayed the same
     across ten sessions</b>. It is a property of them, not a mood.`);
  return s + "</svg>";
}

/* ══ 7. what breathwork measurably does ════════════════════════════════
   Three outcomes. Only the first has a published interval, so only the first
   gets one drawn. */
function sceneEvidence(st){
  const PAD = NARROW ? 30 : 90;
  const X0 = PAD, X1 = W - PAD;
  const LO = -0.8, HI = 0.35;
  const x = v => X0 + ((v - LO) / (HI - LO)) * (X1 - X0);
  const ROW = NARROW ? 116 : 100;
  const top = NARROW ? 78 : 68;
  const noteH = NARROW ? 118 : 82;
  const H = top + BREATHWORK.length * ROW + noteH + 6;

  let s = svgOpen(H, "The measured effect of breathwork on stress, anxiety and low mood");
  s += `<text class="xs" x="${X0}" y="26">randomised trials only · standardised effect size · left is better</text>`;

  BREATHWORK.forEach((r, i) => {
    const y = top + 26 + i * ROW;
    s += `<line x1="${r2(x(0))}" y1="${y - 30}" x2="${r2(x(0))}" y2="${y + 30}"
      stroke="var(--rule)" stroke-width="2"/>`;
    if(!i) s += `<text class="xs" x="${r2(x(0))}" y="${y - 38}" text-anchor="middle">no effect</text>`;
    s += `<text class="sm" x="${X0}" y="${y - 40}" style="fill:var(--ink)">${esc(r.n)}</text>`;
    s += `<text class="xs" x="${X0}" y="${y - 24}">${r.k} trials</text>`;
    if(r.lo != null){
      const containsZero = r.lo <= 0 && r.hi >= 0;
      const col = containsZero ? "--gold" : "--sage";
      s += `<line x1="${r2(x(r.lo))}" y1="${y}" x2="${r2(x(r.hi))}" y2="${y}"
        stroke="var(${col})" stroke-width="9" stroke-linecap="round" opacity=".45"/>`;
      s += `<circle cx="${r2(x(r.g))}" cy="${y}" r="8" fill="var(${col})"/>`;
      s += `<text class="xs" x="${r2(x(r.lo))}" y="${y + 26}" text-anchor="middle">${r.lo}</text>`;
      s += `<text class="xs" x="${r2(x(r.hi))}" y="${y + 26}" text-anchor="middle">${r.hi}</text>`;
      s += `<text class="xs" x="${X1}" y="${y + 46}" text-anchor="end">studies disagreed a little — I² ${r.i2}%</text>`;
    }else{
      s += `<circle cx="${r2(x(r.g))}" cy="${y}" r="8" fill="var(--ink3)" opacity=".6"/>`;
      s += `<text class="xs" x="${r2(x(r.g))}" y="${y + 26}" text-anchor="middle">no interval published</text>`;
    }
    s += `<text class="sm" x="${r2(x(r.g))}" y="${y - 14}" text-anchor="middle"
      style="fill:var(--ink2);font-weight:600">${r.g}</text>`;
  });

  s += prose(X0, top + BREATHWORK.length * ROW + 2, X1 - X0, noteH,
    `Only stress has a published confidence interval, so only stress gets a bar. The
     other two are drawn as bare points, faded, because a made-up interval would be a
     worse figure than an incomplete one. Most of the trials were judged to be at
     <b>moderate risk of bias</b>, which the authors say themselves.`);
  return s + "</svg>";
}

/* ══ 8. how much each of these can carry ═══════════════════════════════ */
function sceneWeights(st){
  const PAD = NARROW ? 12 : 56;
  const BX  = NARROW ? PAD : PAD + 392;
  const R   = NARROW ? 12 : 64;
  const x   = v => BX + v * (W - BX - R);
  const ROW = NARROW ? 118 : 68;
  const H   = (NARROW ? 52 : 54) + WEIGHTS.length * ROW;

  let s = svgOpen(H, "How much weight each claim on this page can carry");
  s += `<text class="xs" x="${BX}" y="24">thin evidence</text>`;
  s += `<text class="xs" x="${W - R}" y="24" text-anchor="end">solid</text>`;
  s += `<line x1="${BX}" y1="34" x2="${W - R}" y2="34" stroke="var(--rule)" stroke-width="1.5"/>`;

  WEIGHTS.forEach((c, i) => {
    const top = NARROW ? 46 + i * ROW : 0;
    const y   = NARROW ? top + 84 : 66 + i * ROW;
    const col = c.s > .7 ? "--sage" : c.s > .5 ? "--gold" : "--clay";
    s += track(BX, W - R, y);
    s += fill(BX, x(c.s), y, col);
    s += `<circle cx="${r2(x(c.s))}" cy="${y}" r="8" fill="var(${col})"/>`;
    s += prose(PAD, NARROW ? top : y - 30, NARROW ? W - 24 : BX - PAD - 26,
      NARROW ? 66 : 62,
      `${esc(c.t)}<div style="font-size:13px;color:var(--ink3);line-height:1.3">${
        esc(c.n)} <i>${esc(c.src)}</i></div>`,
      {size: 15, leading: 1.35, color: "--ink", align: NARROW ? "left" : "right"});
  });
  return s + "</svg>";
}
