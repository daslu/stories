/* scenes.js — the illustrations for the pain journey.
 *
 * Deliberately not charts. Rounded caps, soft fills, no gridlines, and no axis
 * unless one is genuinely needed. Everything is drawn against W, which the kit
 * sets to 860 or 420, and every scene branches on NARROW — a scene drawn for
 * 860 inside a 420 canvas puts most of itself off-screen, which is what
 * tools/layout-check.js exists to catch.
 *
 * Drawing rules learned the hard way on the touch story, worth repeating:
 *   · a coloured label uses style="fill:…", never fill="…", because the text
 *     classes set fill and a presentation attribute loses to a class;
 *   · a foreignObject's declared height is what getBBox reports, so reserve
 *     enough for the text or it spills past its own box silently;
 *   · after moving anything, look at the figure. The layout checker compares
 *     <text> against <text> and will not see a shape covering a label.
 */

/* ══ 1. how much back pain there is ════════════════════════════════════
   Two counts with their uncertainty intervals, and — separately, because it
   is a different kind of number — the change in how likely any one person is
   to have it. They point opposite ways, and that is the figure. */
function sceneBurden(st){
  const showBand = st.band !== false;
  const PAD = NARROW ? 12 : 70;
  const X0 = PAD, X1 = W - PAD;
  const MAX = 1000;                         /* millions, gives the bars room */
  const x = v => X0 + (v / MAX) * (X1 - X0);
  const ROW = NARROW ? 92 : 78;
  const top = NARROW ? 34 : 30;

  const dividerY = top + 44 + BURDEN.bars.length * ROW + (NARROW ? 6 : 0);
  const noteH = NARROW ? 96 : 74;
  let s = svgOpen(dividerY + 14 + noteH + 12,
    "How many people have low back pain, and how the rate has changed");

  s += `<text class="xs" x="${X0}" y="${top}">people living with low back pain, in millions</text>`;

  BURDEN.bars.forEach((b, i) => {
    const y = top + 44 + i * ROW;
    const projected = b.kind === "projected";
    const col = projected ? "--ink3" : "--clay";
    s += `<text class="sm" x="${X0}" y="${y - 12}" style="fill:var(--ink2)">${esc(b.n)}</text>`;
    s += track(X0, X1, y);
    s += fill(X0, x(b.m), y, col, {opacity: projected ? .45 : .65});
    /* the interval, drawn on top of the bar so its width is unmissable */
    if(showBand){
      s += `<line x1="${r2(x(b.lo))}" y1="${y}" x2="${r2(x(b.hi))}" y2="${y}"
        stroke="var(${col})" stroke-width="15" opacity=".22" stroke-linecap="butt"/>`;
      [b.lo, b.hi].forEach(v => {
        s += `<line x1="${r2(x(v))}" y1="${y - 11}" x2="${r2(x(v))}" y2="${y + 11}"
          stroke="var(${col})" stroke-width="2" opacity=".7"/>`;
      });
    }
    s += `<circle cx="${r2(x(b.m))}" cy="${y}" r="8" fill="var(${col})"/>`;
    s += `<text class="sm" x="${r2(x(b.m))}" y="${y + 34}" text-anchor="middle"
      style="fill:var(${col});font-weight:600">${b.m}m</text>`;
    /* Centred under the dot this runs off the right edge once the bar is long,
       so when narrow it is left-anchored at the start of the row instead. */
    if(showBand)
      s += NARROW
        ? `<text class="xs" x="${X0}" y="${y + 52}">somewhere between ${b.lo} and ${b.hi} million</text>`
        : `<text class="xs" x="${r2(x(b.m))}" y="${y + 52}" text-anchor="middle">somewhere between ${b.lo} and ${b.hi}</text>`;
  });

  /* the rate, which went the other way */
  s += divider(dividerY, null, {pad: PAD});
  s += prose(X0, dividerY + 14, X1 - X0, noteH,
    `Over the same thirty years the <b>age-standardised rate</b> — one person's
     chance of having it — fell <b style="color:var(--sage)">${Math.abs(BURDEN.rateChange)}%</b>.
     More people have back pain and each person is slightly less likely to. That is
     a bigger, older world, not a spreading epidemic.`);
  return s + "</svg>";
}

/* ══ 2. what pain is made of ═══════════════════════════════════════════
   A diagram of the definition, not a measurement. The signal on the left never
   changes; the experience on the right does. Nothing here is an effect size
   and the caption says so — the point is the shape of the thing. */
const FACTORS = [
  {id:"threat",   n:"it seems dangerous",      off:"it seems harmless",        w: 2.2},
  {id:"attend",   n:"attention is on it",      off:"attention is elsewhere",   w: 1.1},
  {id:"expect",   n:"they expect it to hurt",  off:"they expect it to be fine",w: 1.6},
  {id:"history",  n:"it has hurt before",      off:"it is new",                w: 1.3},
  {id:"worn",     n:"tired, stressed, alone",  off:"rested and supported",     w: 1.4}
];
function scenePipeline(st){
  const on = k => !!st.f[k];
  const raw = 2.0;                       /* the signal, unchanging */
  const extra = FACTORS.reduce((a, f) => a + (on(f.id) ? f.w : 0), 0);
  const felt = clamp(raw + extra, 0, 10);
  const word = felt < 2.5 ? "barely noticed" : felt < 5 ? "sore" : felt < 7.5 ? "painful" : "severe";
  const col  = felt < 2.5 ? "--sage" : felt < 5 ? "--gold" : felt < 7.5 ? "--clay" : "--neg";

  const PAD = NARROW ? 12 : 60;
  /* Laid out as two columns when wide and one when narrow. Both column
     bottoms are computed, because the first version guessed the height and
     put "unchanged in every case below", the factor heading and the first
     factor within fourteen units of each other. */
  const fy    = NARROW ? 128 : 140;        /* first factor baseline */
  const FROW  = NARROW ? 30 : 34;
  const fEnd  = fy + (FACTORS.length - 1) * FROW;
  const oy    = NARROW ? fEnd + 62 : 96;   /* the output block */
  const oProse = NARROW ? 92 : 118;
  const H = Math.max(fEnd, oy + 76 + oProse) + 22;
  let s = svgOpen(H, `The same signal from the body, experienced as ${word}`);

  /* the input — identical in every setting */
  const inW = NARROW ? W - 24 : 250;
  s += `<text class="xs" x="${PAD}" y="26">the signal from the tissue</text>`;
  s += `<rect x="${PAD}" y="36" width="${inW}" height="26" rx="13" fill="var(--soft)"/>`;
  s += `<rect x="${PAD}" y="36" width="${r2(inW * raw / 10)}" height="26" rx="13"
    fill="var(--blue)" opacity=".5"/>`;
  s += `<text class="xs" x="${PAD}" y="80">unchanged in every case below</text>`;

  /* the factors */
  s += `<text class="xs" x="${PAD}" y="${fy - 18}">what else is true at the time</text>`;
  FACTORS.forEach((f, i) => {
    const y = fy + i * FROW;
    const ok = on(f.id);
    s += `<circle cx="${PAD + 6}" cy="${y - 5}" r="5"
      fill="var(${ok ? "--clay" : "--rule"})" opacity="${ok ? .85 : 1}"/>`;
    s += `<text class="sm" x="${PAD + 22}" y="${y}"
      style="fill:var(${ok ? "--ink" : "--ink3"})">${esc(ok ? f.n : f.off)}</text>`;
  });

  /* the output */
  const oX = NARROW ? PAD : 480;
  const oW = NARROW ? W - 24 : W - 480 - 60;
  s += `<text class="xs" x="${oX}" y="${oy - 26}">what is felt</text>`;
  s += `<rect x="${oX}" y="${oy - 16}" width="${oW}" height="26" rx="13" fill="var(--soft)"/>`;
  s += `<rect x="${oX}" y="${oy - 16}" width="${r2(oW * felt / 10)}" height="26" rx="13"
    fill="var(${col})" opacity=".65"/>`;
  s += `<text class="big" x="${oX}" y="${oy + 62}" style="font-size:31px;fill:var(${col})">${esc(word)}</text>`;
  s += prose(oX, oy + 76, oW, oProse,
    `The signal arriving from the tissue is the same in every one of these.
     What changes is everything the body already knows about the situation —
     and pain is the whole of that, not the first part of it.`);
  return s + "</svg>";
}

/* ══ 3. the gate ═══════════════════════════════════════════════════════
   Melzack and Wall's 1965 idea, and what a reader should carry from it now:
   the specific circuit was revised, the modulation was not. */
function sceneGate(st){
  const rub = st.rub !== false;
  const PAD = NARROW ? 12 : 70;
  const gx = NARROW ? W / 2 : 470;         /* the gate */
  const gy = NARROW ? 190 : 150;
  const outY = NARROW ? gy + 118 : gy - 40;
  const noteH = NARROW ? 130 : 150;
  const H = Math.max(outY + 46 + noteH + 14, NARROW ? gy + 90 : gy + 90);
  let s = svgOpen(H, rub ? "Touch arriving alongside pain, partly closing the gate"
                         : "A pain signal arriving with no touch alongside it");

  /* the two incoming fibres */
  const sx = PAD;                          /* where they start */
  s += `<text class="xs" x="${sx}" y="${gy - 84}">from the skin</text>`;

  /* the thin, slow one — always firing in this scene */
  s += `<path d="M${sx} ${gy + 46}Q${(sx + gx) / 2} ${gy + 60} ${gx - 34} ${gy + 12}"
    fill="none" stroke="var(--neg)" stroke-width="3" opacity=".8"/>`;
  s += `<text class="sm" x="${sx}" y="${gy + 74}" style="fill:var(--neg)">the pain signal</text>`;

  /* the thick, fast one — only when a hand is on the skin */
  s += `<path d="M${sx} ${gy - 46}Q${(sx + gx) / 2} ${gy - 60} ${gx - 34} ${gy - 12}"
    fill="none" stroke="var(--blue)" stroke-width="${rub ? 7 : 3}"
    opacity="${rub ? .85 : .18}"/>`;
  s += `<text class="sm" x="${sx}" y="${gy - 56}"
    style="fill:var(${rub ? "--blue" : "--ink3"})">${rub ? "touch, alongside it" : "no touch"}</text>`;

  /* the gate itself — a doorway that narrows */
  const open = rub ? 16 : 40;
  s += `<circle cx="${gx}" cy="${gy}" r="30" fill="var(--paper2)" stroke="var(--rule)" stroke-width="2"/>`;
  s += `<rect x="${gx - 20}" y="${gy - open / 2}" width="40" height="${open}" rx="${Math.min(8, open / 2)}"
    fill="var(--card)" stroke="var(--dis)" stroke-width="2"/>`;
  s += `<text class="xs" x="${gx}" y="${gy + 52}" text-anchor="middle">the gate</text>`;

  /* what gets through */
  const outX = NARROW ? PAD : gx + 90;
  const through = rub ? 0.45 : 1;
  const bw = NARROW ? W - 24 : W - outX - PAD;
  s += `<text class="xs" x="${outX}" y="${outY}">what reaches the brain</text>`;
  s += `<rect x="${outX}" y="${outY + 10}" width="${bw}" height="24" rx="12" fill="var(--soft)"/>`;
  s += `<rect x="${outX}" y="${outY + 10}" width="${r2(bw * through)}" height="24" rx="12"
    fill="var(--neg)" opacity=".6"/>`;
  s += prose(outX, outY + 46, bw, noteH,
    rub
      ? `Rubbing a knock is not a distraction. The touch fibres reach the same
         junction as the pain fibres and change what is passed on — which is why
         the hand goes to the shin before anyone decides to move it.`
      : `With nothing else arriving, the signal passes through largely as it came.
         Turn the touch on and watch the same signal get less far.`);
  return s + "</svg>";
}

/* ══ 4. what a back looks like when nothing hurts ══════════════════════
   The story's most useful figure, and its most misusable. Drag the age. */
function sceneScans(st){
  const age = st.age;
  const ages = ASYMPTOMATIC.ages;
  /* linear interpolation between the modelled decades */
  const at = f => {
    const i = Math.min(Math.floor((age - 20) / 10), ages.length - 2);
    const t = (age - ages[i]) / 10;
    return f.v[i] + (f.v[i + 1] - f.v[i]) * t;
  };
  const rows = ASYMPTOMATIC.findings.map(f => ({f, p: at(f)}))
    .sort((a, b) => b.p - a.p);

  const PAD  = NARROW ? 12 : 60;
  const LABW = NARROW ? 0 : 300;
  const BX   = NARROW ? PAD : PAD + LABW + 26;
  const BW   = W - BX - PAD - (NARROW ? 46 : 46);
  const ROW  = NARROW ? 74 : 46;
  const top  = NARROW ? 96 : 82;
  const H    = top + rows.length * ROW + (NARROW ? 34 : 26);

  let s = svgOpen(H, `Imaging findings in people with no back pain, at age ${Math.round(age)}`);

  s += `<text class="lab" x="${PAD}" y="26" style="fill:var(--clay)">people this age with no back pain at all</text>`;
  s += prose(PAD, 36, W - PAD * 2, NARROW ? 52 : 34,
    `Out of every hundred <b>pain-free</b> ${Math.round(age)}-year-olds, this many have
     each finding on a scan.`);

  rows.forEach((r, i) => {
    const yTop = top + i * ROW;
    const y    = NARROW ? yTop + 44 : yTop + 18;
    const pct  = r.p;
    /* colour by how common, so the eye reads the gradient before the numbers */
    const col  = pct >= 70 ? "--clay" : pct >= 40 ? "--gold" : "--sage";
    if(NARROW){
      s += `<text class="sm" x="${PAD}" y="${yTop + 14}" style="fill:var(--ink)">${esc(r.f.n)}</text>`;
      s += `<text class="xs" x="${PAD}" y="${yTop + 31}">${esc(r.f.plain)}</text>`;
    }else{
      s += `<text class="sm" x="${PAD + LABW}" y="${y + 1}" text-anchor="end"
        style="fill:var(--ink)">${esc(r.f.n)}</text>`;
      s += `<text class="xs" x="${PAD + LABW}" y="${y + 18}" text-anchor="end">${esc(r.f.plain)}</text>`;
    }
    s += track(BX, BX + BW, y);
    s += fill(BX, BX + BW * pct / 100, y, col, {opacity: .6});
    s += `<text class="sm" x="${BX + BW + 10}" y="${y + 5}"
      style="fill:var(${col});font-weight:600">${Math.round(pct)}</text>`;
  });
  return s + "</svg>";
}

/* ══ 5. the same cold, two colours ═════════════════════════════════════
   The paper reports differences, not condition means, and reports them as
   approximate. So the two markers are placed either side of the scale's
   middle, separated by the reported difference, and everything says "about". */
function sceneCue(st){
  const red = st.cue === "red";
  const PAD = NARROW ? 12 : 70;
  const X0 = PAD, X1 = W - PAD;
  const mid = (X0 + X1) / 2;
  const U = (X1 - X0) / CUE.scale;
  const ROW = NARROW ? 126 : 100;
  const top = NARROW ? 118 : 104;
  const H = top + CUE.rows.length * ROW + (NARROW ? 74 : 58);

  let s = svgOpen(H, `The same cold rod, cued ${red ? "red" : "blue"}`);

  /* the stimulus, which never changed */
  s += `<text class="xs" x="${PAD}" y="26">the stimulus, identical in every trial</text>`;
  s += `<rect x="${PAD}" y="36" width="${NARROW ? W - 24 : 330}" height="32" rx="16" fill="var(--soft)"/>`;
  s += `<text class="sm" x="${PAD + 16}" y="${57}">a −20 °C rod · 500 ms · on one hand</text>`;
  /* the only thing that changed */
  const cueY = NARROW ? 92 : 57;
  const cueX = NARROW ? PAD : 400;
  s += `<circle cx="${cueX + 10}" cy="${cueY - 5}" r="10"
    fill="var(${red ? "--neg" : "--blue"})" opacity=".8"/>`;
  s += `<text class="sm" x="${cueX + 30}" y="${cueY}" style="fill:var(--ink2)">${
    esc(red ? "a red light — described as hot, and more damaging"
            : "a blue light — described as cold, and less damaging")}</text>`;

  CUE.rows.forEach((r, i) => {
    const y = top + 30 + i * ROW;
    const half = (r.diff / 2) * U;
    s += `<text class="sm" x="${X0}" y="${y - 30}" style="fill:var(--ink)">${esc(r.n)}</text>`;
    s += `<text class="xs" x="${X0}" y="${y - 13}">${esc(r.note)}</text>`;
    s += track(X0, X1, y, {left: "not at all", right: "as much as it could be"});
    /* the gap between the two conditions is the finding */
    s += `<line x1="${r2(mid - half)}" y1="${y}" x2="${r2(mid + half)}" y2="${y}"
      stroke="var(--ink3)" stroke-width="2" stroke-dasharray="3 3" opacity=".7"/>`;
    [["blue", mid - half, "--blue"], ["red", mid + half, "--neg"]].forEach(([id, cx, c]) => {
      const active = (id === "red") === red;
      s += `<circle cx="${r2(cx)}" cy="${y}" r="${active ? 9 : 6}" fill="var(${c})"
        opacity="${active ? 1 : .3}"/>`;
    });
    /* Below the track, not above it: above, it landed on the row's own note
       at narrow, where the note is nearly half the canvas wide. */
    s += `<text class="xs" x="${r2(mid)}" y="${y + 46}" text-anchor="middle"
      style="fill:var(--ink2)">about ${r.diff} points apart</text>`;
  });

  s += prose(X0, H - (NARROW ? 66 : 50), X1 - X0, NARROW ? 62 : 46,
    `On an eleven-point scale. The paper reports the <b>gap</b> between the two
     conditions rather than a score for each, so the pair is drawn around the middle
     — the distance between them is the measured thing, not where they sit.`);
  return s + "</svg>";
}

/* ══ 6. the gain goes up ═══════════════════════════════════════════════
   A schematic of what central sensitization describes: the curve from stimulus
   to pain shifts left and steepens, so ordinary input crosses into pain. Drawn
   as a schematic and labelled as one — it is not anyone's measured curve. */
function sceneGain(st){
  const g = st.gain;                       /* 0 = ordinary, 1 = strongly sensitized */
  const PAD = NARROW ? 34 : 80;
  const X0 = PAD, X1 = W - PAD;
  const noteH = NARROW ? 150 : 96;
  const BY = 300;                          /* baseline */
  const H  = BY + 58 + noteH + 14;
  const TY = 70;                           /* top of the plot */
  const px = t => X0 + t * (X1 - X0);
  const py = v => BY - (v / 10) * (BY - TY);

  /* a logistic whose midpoint moves left and whose slope rises with g */
  const mid = 0.62 - 0.34 * g;
  const k   = 7 + 7 * g;
  const out = t => 10 / (1 + Math.exp(-k * (t - mid)));

  let s = svgOpen(H, "How a stimulus turns into pain, before and after sensitisation");

  /* Axes, as light as possible. The vertical scale is named once, above the
     plot: endpoint labels at the bottom-left sat exactly where the curve
     leaves the origin, and the curve — drawn afterwards — painted over them.
     The layout checker compares text with text and never saw it. */
  s += `<line x1="${X0}" y1="${BY}" x2="${X1}" y2="${BY}" stroke="var(--rule)" stroke-width="1.5"/>`;
  s += `<line x1="${X0}" y1="${TY}" x2="${X0}" y2="${BY}" stroke="var(--rule)" stroke-width="1.5"/>`;
  s += `<text class="xs" x="${X0}" y="${TY - 12}">how much it hurts, from none to the worst there is</text>`;
  s += `<text class="xs" x="${X0}" y="${BY + 24}">a light touch</text>`;
  s += `<text class="xs" x="${X1}" y="${BY + 24}" text-anchor="end">a real injury</text>`;

  const curve = f => {
    let d = "";
    for(let i = 0; i <= 60; i++){
      const t = i / 60;
      d += `${i ? "L" : "M"}${r2(px(t))} ${r2(py(f(t)))}`;
    }
    return d;
  };
  /* The ordinary curve stays visible as the thing being departed from — but
     only once it has been departed from. At rest it sits exactly under the
     solid one, and a caption pointing at an invisible dashed line is worse
     than no caption. */
  const moved = g > 0.04;
  if(moved)
    s += `<path d="${curve(t => 10 / (1 + Math.exp(-7 * (t - 0.62))))}" fill="none"
      stroke="var(--ink3)" stroke-width="2" stroke-dasharray="5 4" opacity=".55"/>`;
  s += `<path d="${curve(out)}" fill="none" stroke="var(--clay)" stroke-width="3.5"
    stroke-linecap="round"/>`;

  /* one ordinary input, followed across both curves */
  const T = 0.33;
  const was = 10 / (1 + Math.exp(-7 * (T - 0.62))), now = out(T);
  s += `<line x1="${r2(px(T))}" y1="${BY}" x2="${r2(px(T))}" y2="${r2(py(Math.max(was, now)))}"
    stroke="var(--rule)" stroke-width="1.5"/>`;
  s += `<circle cx="${r2(px(T))}" cy="${r2(py(was))}" r="5" fill="var(--ink3)"/>`;
  s += `<circle cx="${r2(px(T))}" cy="${r2(py(now))}" r="8" fill="var(--clay)"/>`;
  s += `<text class="xs" x="${r2(px(T))}" y="${BY + 42}" text-anchor="middle">a firm press</text>`;
  s += `<text class="sm" x="${r2(px(T)) + 14}" y="${r2(py(now)) + 5}"
    style="fill:var(--clay);font-weight:600">${now.toFixed(1)}</text>`;
  /* With the slider at rest the two dots coincide, and two labels in the same
     place is both unreadable and untrue — there is nothing to compare yet. */
  if(Math.abs(now - was) > 0.25)
    s += `<text class="xs" x="${r2(px(T)) + 14}" y="${r2(py(was)) + 4}">was ${was.toFixed(1)}</text>`;

  s += prose(X0, BY + 58, X1 - X0, noteH, moved
    ? `The dashed line is the same nervous system before. Nothing about the press
       changed — the curve did. This is a <b>schematic</b> of what the phenomenon
       describes, not a measured curve from anybody: what is established is that
       the shift happens, not that it has this exact shape.`
    : `This is an ordinary nervous system: it takes a good deal of input before
       anything hurts. Move the slider and the curve shifts left — the same firm
       press starts to cross into pain, with nothing about the press changing.`);
  return s + "</svg>";
}

/* ══ 7. what the room is doing ═════════════════════════════════════════
   Rossettini's categories, phrased plainly. A framework rather than an effect,
   so nothing here carries a number and nothing should be given one. */
function sceneRoom(st){
  const i = ROOM.findIndex(r => r.k === st.room);
  const sel = i < 0 ? 0 : i;
  const PAD = NARROW ? 12 : 60;
  const ROWH = NARROW ? 42 : 46;
  const exY  = NARROW ? 58 + ROOM.length * ROWH + 16 : 58;
  const exH  = NARROW ? 128 : 150;
  const tailDy = NARROW ? 146 : 172;
  const tailH  = NARROW ? 92 : 74;
  const H = Math.max(58 + ROOM.length * ROWH + 10, exY + tailDy + tailH + 14);
  let s = svgOpen(H, `Contextual factors: ${ROOM[sel].k}`);
  s += `<text class="xs" x="${PAD}" y="26">four kinds of thing that travel with a treatment</text>`;
  ROOM.forEach((r, j) => {
    const y = 58 + j * ROWH;
    const on = j === sel;
    s += `<rect x="${PAD}" y="${y - 24}" width="${NARROW ? W - 24 : 330}" height="34" rx="17"
      fill="var(${on ? "--paper2" : "--card"})" stroke="var(${on ? "--clay" : "--rule"})"
      stroke-width="${on ? 2 : 1}"/>`;
    s += `<text class="sm" x="${PAD + 16}" y="${y - 2}"
      style="fill:var(${on ? "--ink" : "--ink3"})">${esc(r.k)}</text>`;
  });

  const eX = NARROW ? PAD : 430;
  const eY = exY;
  const eW = NARROW ? W - 24 : W - eX - PAD;
  s += `<text class="lab" x="${eX}" y="${eY}" style="fill:var(--clay)">for example</text>`;
  s += prose(eX, eY + 12, eW, exH, esc(ROOM[sel].ex), {size: 15, leading: 1.5});
  s += prose(eX, eY + tailDy, eW, tailH,
    `None of these has a number beside it here, because the review that names them
     is a framework rather than a measurement. What it is good for is noticing how
     much of a treatment is not the technique.`, {color: "--ink3"});
  return s + "</svg>";
}

/* ══ 8. what teaching actually does ════════════════════════════════════
   Two intervals on a common scale. Drawn as intervals rather than points on
   purpose: the pain interval reaches exactly zero, and a dot would hide it. */
function scenePne(st){
  const PAD = NARROW ? 30 : 90;
  const X0 = PAD, X1 = W - PAD;
  const LO = -0.8, HI = 0.9;
  const x = v => X0 + ((v - LO) / (HI - LO)) * (X1 - X0);
  const ROW = NARROW ? 138 : 122;
  const top = NARROW ? 86 : 76;
  const H = top + PNE.rows.length * ROW + (NARROW ? 96 : 76);

  let s = svgOpen(H, "The measured effect of teaching people how pain works");

  s += `<text class="xs" x="${X0}" y="26">12 trials · 1485 people · standardised effect size</text>`;

  PNE.rows.forEach((r, i) => {
    const y = top + 30 + i * ROW;
    /* "no effect" is the line that matters, so it is drawn per row and named */
    s += `<line x1="${r2(x(0))}" y1="${y - 34}" x2="${r2(x(0))}" y2="${y + 34}"
      stroke="var(--rule)" stroke-width="2"/>`;
    s += `<text class="xs" x="${r2(x(0))}" y="${y - 42}" text-anchor="middle">no effect</text>`;
    /* An interval contains zero exactly when lo <= 0 <= hi. The first version
       of this test also fired whenever lo was above zero, which coloured the
       sleep result as though it were uncertain — the figure said the opposite
       of the finding. Worth stating plainly: a colour is a claim. */
    const containsZero = r.lo <= 0 && r.hi >= 0;
    const col = containsZero ? "--gold" : "--sage";
    s += `<text class="sm" x="${X0}" y="${y - 52}" style="fill:var(--ink)">${esc(r.n)}</text>`;
    s += `<line x1="${r2(x(r.lo))}" y1="${y}" x2="${r2(x(r.hi))}" y2="${y}"
      stroke="var(${col})" stroke-width="9" stroke-linecap="round" opacity=".45"/>`;
    s += `<circle cx="${r2(x(r.smd))}" cy="${y}" r="8" fill="var(${col})"/>`;
    s += `<text class="xs" x="${r2(x(r.lo))}" y="${y + 26}" text-anchor="middle">${r.lo.toFixed(2)}</text>`;
    s += `<text class="xs" x="${r2(x(r.hi))}" y="${y + 26}" text-anchor="middle">${r.hi.toFixed(2)}</text>`;
    s += `<text class="sm" x="${r2(x(r.smd))}" y="${y - 16}" text-anchor="middle"
      style="fill:var(${col});font-weight:600">${r.smd.toFixed(2)}</text>`;
    s += `<text class="xs" x="${X1}" y="${y + 44}" text-anchor="end">studies disagreed ${
      r.i2 === 0 ? "not at all" : `a good deal — I² ${r.i2}%`}</text>`;
  });

  s += prose(X0, H - (NARROW ? 88 : 68), X1 - X0, NARROW ? 80 : 60,
    `The bar is where the true effect probably lies. The pain bar <b>reaches zero</b>,
     which is to say "no effect at all" is still on the table. The sleep bar does not.`);
  return s + "</svg>";
}

/* ══ 9. how much each of these can carry ═══════════════════════════════
   A judgement, not a measurement, and the caption says so. Its value is the
   ranking: the most repeated story on the page sits at the bottom. */
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
    s += prose(NARROW ? PAD : PAD, NARROW ? top : y - 30,
      NARROW ? W - 24 : BX - PAD - 26, NARROW ? 66 : 62,
      `${esc(c.t)}<div style="font-size:13px;color:var(--ink3);line-height:1.3">${
        esc(c.n)} <i>${esc(c.src)}</i></div>`,
      {size: 15, leading: 1.35, color: "--ink", align: NARROW ? "left" : "right"});
  });
  return s + "</svg>";
}
