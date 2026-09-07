# Handoff — Pain is not a damage report

Context for continuing this story. Written for whoever picks it up next, human
or agent. [shared/README.md](../shared/README.md) covers how the machinery
works; this covers **what was decided, what was checked, and what is still
open.**

---

## 0. Start here

Everything runs from the **repository root**:

```
quarto render
node shared/tools/check.js pain-journey
node shared/tools/layout-check.js pain-journey     # render first
```

Current state, and both checkers pass:

```
pages 6 · stops 11 · figures 11 · references 10 · cited 10 · wiki links 3
layout-check: 36 page/width combinations clean
```

Nothing is in flight. Written 2026-09-07, not yet committed — the user commits.

---

## 1. What the page is trying to do

Give hands-on practitioners a defensible, kind account of what pain is, for one
situation in particular: **the client who has been told their scan looks
terrible, and believes it.**

The audience constraint that shapes everything is the same as the touch story's:
they have been taught things that are not true, often with confidence, often in
paid training. So the page has to be warm without being credulous, and correct
people without insulting the work they have built a career on.

The resolution: **hurt and harm are different quantities.** That sentence is the
spine, and almost every stop is it with evidence attached.

Two failure modes to avoid in equal measure:

- **Debunking.** "Your scan means nothing, it's all in your head." Untrue,
  unkind, and it is what a sceptical reader is braced for.
- **Motivated softness.** Letting the pain-education literature off because the
  page is an argument for pain education. Part four exists to stop that.

---

## 2. The nine content stops

```
One · what pain is        burden · experience · gate
Two · how loose the link  scans · cue
Three · when pain stays   gain · room
Four · being honest       teaching · weights
Closing                   carry · sources
```

`scans` is the best figure and the reason to have written it. `teaching` is the
most honest one.

---

## 3. What is verified, and how well

Everything was checked against the paper or its abstract during authoring, on
2026-09-07. Confidence varies and the page reflects that; **do not flatten it.**

| Claim | Confidence | Note |
|---|---|---|
| Low back pain is the leading cause of years lived with disability | solid | GBD 2021. 619m (554–694) in 2020, 843m (759–933) projected 2050 |
| Age-standardised rate fell 10.4% while the count rose | solid, and easy to garble | it is a rate against a count — the figure exists to keep them apart |
| The IASP definition does not require tissue damage | not an experiment | it is the field writing down what it agrees on, which is a different kind of evidence. Quoted exactly |
| Imaging findings are common in pain-free people, rising with age | **strong, and the most misusable thing here** | Brinjikji 2015: 33 studies, 3110 asymptomatic people. Full decade table in `figure-data.js` |
| …but that does not make them meaningless | **must stay** | the authors did *not* stratify by severity, and say imaging must be read against the patient. The page says both |
| A red cue made an identical −20 °C rod feel ~5.5 points hotter | good, and a laboratory stimulus | Moseley & Arntz 2007. Abstract gives **differences, not condition means**, and says "approximately" — the figure draws it that way |
| Moseley & Arntz sample size | **not reported in the abstract** | the page states no n. Do not invent one |
| Central sensitisation happens | well described | Woolf 2011. Producible in volunteers |
| …how much it explains any individual's pain | **inference, and argued over** | the page says there is no treatment-room test for it. Keep that |
| Contextual factors matter in musculoskeletal care | a framework, not data | Rossettini 2018 is a narrative review. **Never cite it as an effect size** |
| Teaching people about pain reduces pain | **weak** | Khan 2026: SMD −0.27, CI −0.50 to **0.00**, I² 67%. The interval reaches no effect |
| …and improves sleep | cleaner | +0.42 (0.12–0.71), I² 0%. The sturdier finding, and nobody advertises it |
| The nail through the boot | **one paragraph in a magazine column** | BMJ 1995 "Minerva". No method, no follow-up. Sits at 0.18 in WEIGHTS, deliberately |

`check.js` fails if the `WEIGHTS` ordering breaks or its weakest entry drifts
above 0.4.

---

## 4. Decisions worth not re-litigating

**The nail story is in, at the bottom.** It was tempting to leave out — it is
the weakest evidence on the page. Keeping it and *naming* what it is made of
does more work than omitting it, because the reader has almost certainly been
persuaded by it before, and the stop is about that habit.

**Ellingsen-style caution about `pipeline`.** The `pipeline` figure's factor
weights are invented. It is a diagram of the IASP definition, not a
measurement, and its caption says so in those words. If it ever grows a number
that looks like data, that is a regression.

**"Diagnose" is not a checker rule any more.** There was one. It fired on *"not
something anyone can diagnose from a treatment room"* — the page warning
against exactly the thing the rule was for. A checker that flags correct prose
trains you to skim its output, which is how a real failure gets missed. The
rule went, not the sentence.

**Confidence intervals are drawn as intervals, never as dots.** The whole point
of the `teaching` stop is that the pain interval touches zero. A point estimate
would hide it.

---

## 5. Errors that actually occurred here

Beyond the ones [shared/README.md](../shared/README.md) records:

**A colour that made the wrong claim.** In `scenePne` the "does this interval
contain zero" test was `r.lo >= -0.001 || …`, which is true whenever `lo` is
above zero — so the sleep result, whose interval is comfortably clear of zero,
was coloured as uncertain. The figure said the opposite of the finding, and
nothing would have caught it. It is `r.lo <= 0 && r.hi >= 0` now. **A colour is
a claim; test it like one.**

**A curve drawn through its own axis label.** `sceneGain` labelled the vertical
axis "no pain" at the bottom left, which is exactly where the curve leaves the
origin — and the curve, drawn afterwards, painted over it. layout-check
compares text with text and never saw it. The axis is named once above the plot
now.

**A caption pointing at an invisible line.** `sceneGain` opened with the
sensitisation slider at zero, where the dashed "before" curve sits exactly
under the solid one — while the caption said "the dashed line is the same
nervous system before". It opens at 0.55 now and the note adapts when the
slider is at rest.

**Four heights guessed instead of derived.** Every one of them overflowed. All
figure heights are computed from where their content ends now.

---

## 6. Rough edges

- **`pipeline`'s weights are invented**, and the caption says so. It is the only
  figure on the page with no measurement behind it, which is the position the
  touch story's `meaning` figure was in before it was fixed. Fixing it would
  mean finding a study that manipulates several of those factors at once and
  reports their relative sizes; we did not find one.
- **`room` carries no numbers**, deliberately, because Rossettini has none.
- **The `scans` figure interpolates linearly between the modelled decades.** The
  paper reports by decade; a reader dragging to 47 gets a straight-line
  estimate between 40 and 50. Honest enough at this resolution, and worth
  knowing before anyone quotes a single-year figure off it.
- **The Moseley & Arntz figure places both markers around the scale midpoint**,
  because only the difference is published. If anyone finds the condition means
  in the full text, the figure should move to real positions.
- **No dark theme**, on purpose — the soft fills rely on warmth to read at all.
- **Long-run link rot.** Ten external links, no checker for them.

---

## 7. What could come next

In the order we would do it.

**Imaging and outcomes.** There is a literature suggesting early imaging for
back pain is associated with *worse* outcomes and more surgery, with no
corresponding benefit. It is the natural next stop after `scans` and it is the
one a practitioner can act on most directly. Not verified here — read it before
using it.

**Nocebo in the clinical encounter, with numbers.** `room` is a framework. There
are experiments that measure what a phrase does. That would let part three go
from naming the channel to measuring it.

**Sleep and pain.** A strong and reasonably clean bidirectional literature, and
it connects to the one finding in `teaching` that came out clean.

**Exercise and movement for chronic pain.** The largest evidence base in the
field, and conspicuously absent — the page is about understanding pain and says
almost nothing about what helps. That is a real gap, and it is deliberate for
length rather than for evidence.

**Considered and left out:** fibromyalgia and other specific conditions (the
page would start reading as diagnostic); opioids (a different and much larger
subject); pain in children and in people who cannot report it (important, and it
needs its own page rather than a stop).

---

## 8. If you change one thing, change this

The page ends on `weights` — the observation that the best-supported claims are
the boring ones and the most-repeated story has the least under it. That is the
most transferable thing here, because it survives this subject. Do not bury it
under new material; anything added should come **before** it.
