# Handoff — Breathing is not a switch

Context for continuing this story. [shared/README.md](../shared/README.md)
covers how the machinery works; this covers **what was decided, what was
checked, and what is still open.**

---

## 0. Start here

Everything runs from the **repository root**:

```
quarto render
node shared/tools/check.js breath-journey
node shared/tools/layout-check.js breath-journey    # render first
```

Current state, and both checkers pass:

```
pages 5 · stops 10 · figures 10 · references 6 · cited 6 · wiki links 2
layout-check: 30 page/width combinations clean
```

Nothing is in flight. Written 2026-09-07, not yet committed.

---

## 1. What the page is trying to do

Breathing is the one part of the autonomic nervous system a person can take
hold of directly, which is why every hands-on tradition has found its way to it
— and why it is the most oversold subject in the field.

The page's job is to hand a practitioner **a number, a reason, and a boundary**:
about six breaths a minute, because that is where the heart and the baroreflex
fall into step, and no, it does not rewire anyone.

The shape is deliberately the opposite of a debunk. The strong material comes
first and it is genuinely good — the heart really is following the breath right
now, and there really is a resonance. Only then does part three say how far that
goes.

---

## 2. The eight content stops

```
One · what breathing is doing   rates · oxygen · over
Two · why slow works            rsa · resonance · predicts
Three · being honest            evidence · weights
Closing                         carry · sources
```

`oxygen` is the most surprising figure and `resonance` the most useful.

---

## 3. What is verified, and how well

Checked against the paper or its abstract on 2026-09-07.

| Claim | Confidence | Note |
|---|---|---|
| Ordinary resting rate is 10–20 a minute; "slow" is 4–10 | solid | Russo 2017, quoted exactly. The two ranges **meet at 10**, which is the point of the figure |
| Heart rate rises on the in-breath and falls on the out-breath | solid | Lehrer 2014, quoted. Checkable by anyone with a pulse |
| Heart rate variation is largest at ~0.1 Hz, six a minute | solid, replicated | Lehrer 2014, refined in the same review to **5.5 a minute**, ~11 s a breath |
| At that rate heart rate and blood pressure run 180° apart | good | Lehrer 2014's own words. This is what makes it a resonance |
| …and the mechanism beyond that | **the authors call parts speculation** | especially the vagal-afferent account. The page says so |
| A person's own best rate relates to height, and to being male | modest | Vaschillo 2006, 56 people, one lab. Reported as **directions, not coefficients** |
| …and not to age, weight or asthma; and it stayed put over 10 sessions | same source, same weight | the "stayed put" finding is the practically useful one |
| The blood is already ~97% loaded leaving healthy lungs | textbook | no single modern source; `refs.bib` points at a reference description, as the touch story does for mechanoreceptors |
| More CO₂ makes haemoglobin release oxygen more readily (Bohr) | textbook | over a century old and not contested |
| Slow breathing at 6/min raised oxygen saturation slightly | good, and easy to garble | Russo 2017. **Slow and efficient, not fast and hard** — the page keeps those apart |
| Hyperventilation narrows cerebral vessels and cuts blood flow | large, and from intensive care | Stocchetti 2005 is a head-injury review. Direction only; **no dose**, deliberately |
| Breathwork reduces self-reported stress | real and modest | Fincham 2023: g = −0.35 (−0.55 to −0.14), 12 RCTs, 785 adults, I² 42% |
| …anxiety −0.32 (k=20), low mood −0.40 (k=18) | same | **no confidence intervals published in the abstract** — the figure draws these as bare points and says why |
| Breathing technique changes long-run health | **no adequate source** | sits at 0.22 in WEIGHTS with the source field reading "no adequate source". Its absence is the finding |

---

## 4. Decisions worth not re-litigating

**The story leads with the good news.** An earlier plan opened with the
oxygen myth. Leading with a correction makes the whole page read as a debunk
and loses the reader — and the strongest material here is genuinely positive.
`rates` first, `resonance` in the middle, honesty last.

**Hyperventilation gets a chain with no numbers on it.** The evidence is from
intensive care, where the amount is set by a machine. Drawing a dose would be
inventing one. The figure is directions only, and the prose says explicitly
that anyone offering a threshold is going past their evidence.

**Vaschillo gets directions, not a scatter plot.** The paper reports
relationships without publishing coefficients. A scatter would have looked far
better and would have been made up.

**Anxiety and low mood are drawn as faded points, not bars.** The abstract gives
effect sizes and p values but no intervals. A made-up interval would be a worse
figure than an incomplete one, and the caption says that in those words.

**The resonance curve has a floor.** A bare bell curve decays to zero, which
would claim heart rate stops following the breath at ordinary rates — it does
not, the swing is just smaller. `RESONANCE.floor` is 0.28 so the figure reads
~30% at 14 a minute. Where the peak sits is the established part; the shape is
drawn, and the caption says so.

---

## 5. Errors that actually occurred here

**A curve that made a claim nobody had made.** The resonance figure originally
decayed to 0% at an ordinary rate. Nothing in the sources says that, and it is
false. See above.

**A label on the axis title.** `sceneResonance` named the peak at the top of its
own dashed line, which is the same height as the vertical axis title — and
because the peak is near the left end, they were also in the same place
horizontally. The peak is named below the axis now.

**A readout centred on a moving dot.** The "% of the largest swing" label was
centred on the marker, so it ran off both ends of the canvas once the slider
reached either extreme. It lives under the plot now, left-anchored.

**Two labels saying the same thing.** `sceneOxygen` had axis-end labels ("in
working tissue", "in the lungs") directly above dot labels meaning the same
("reaching the tissue", "leaving the lungs"). It read as two scales. The axis
labels went.

**A comparison against itself.** The oxygen note said "22 points, against 22 at
normal carbon dioxide" whenever the slider was at rest. It now omits the
comparison when there is nothing to compare.

---

## 6. Rough edges

- **`RSA.swing` is illustrative.** A resting heart rate of 66 swinging ±9 is a
  plausible drawing, not anyone's data. The direction is the finding and the
  caption says the amplitude is drawn.
- **The oxygen curve is a Hill equation with n = 2.7**, which reproduces the
  standard shape. It is a model, said to be one.
- **`OXY.shift` — how far CO₂ moves P50 — is a rough magnitude**, chosen to
  show the direction clearly. It is not a measured coefficient and should not
  be quoted as one.
- **Nothing about nasal versus mouth breathing**, which is the single most
  asked question in this area. Left out because the evidence we found was
  thinner than the confidence around it, and doing it properly is its own stop.
- **Nothing about breath-holding, CO₂ tolerance or the Wim Hof material.** Very
  topical, and it needs care: some of it has real trials and much of the public
  version does not.

---

## 7. What could come next

**Nasal versus mouth breathing.** The most-asked question here. Needs a real
search; do not write it from the popular books.

**Breath-holding and CO₂ tolerance.** Some genuine trials exist, including on
the cold-exposure protocols. High interest, high myth density — exactly this
page's kind of subject, and exactly the kind that needs the honest-weight
treatment.

**Sighing.** There is a real literature on the spontaneous sigh as a resetting
breath, and one much-publicised trial of "cyclic sighing" against other
practices. Worth checking properly; it would sit well after `resonance`.

**Breathing and the diaphragm as a postural muscle.** Directly relevant to
bodyworkers, and it connects the breath to the rest of a practitioner's work
rather than treating it as a separate technique.

**Considered and left out:** breathing in specific respiratory disease (needs
clinical framing this page cannot give); hyperventilation syndrome as a
diagnosis (contested); coherence and heart-rate-variability products (a
commercial literature).

---

## 8. If you change one thing, change this

The page ends on the observation that its best-supported claims are the ones a
reader can check on their own wrist, and that the claim with the most riding on
it — that breathing technique changes long-run health — has nothing under it.
Keep that last. Anything added should come **before** it.
