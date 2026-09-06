# Handoff

Context for continuing *Touch is not one sense* — a reading journey for hands-on
practitioners. Written for whoever picks this up next, human or agent.

Read this before editing. The README covers how the code works; this covers
**what was decided, what was checked, and what is still wrong.**
---

## 0. Start here

The story is a **Quarto website**. Everything runs from the **repository root**,
not from this directory:

```
quarto render                              # -> docs/touch-journey/
node touch-journey/tools/check.js          # content audit — milliseconds, no deps
node touch-journey/tools/layout-check.js   # layout audit — needs chrome, render first
```

Four documents, in the order to read them:

| | |
|---|---|
| [README.md](README.md) | the mechanics — file layout, the shape of a stop, citations, the two layouts |
| **HANDOFF.md** (this) | what was decided and why, what is verified, what went wrong |
| [TODO.md](TODO.md) | what is next, and the one decision waiting on the user |
| [RESEARCH.md](RESEARCH.md) | fifteen candidate papers assessed for new stops, with the figure each could carry |

**Nothing is in flight.** The last session put Gazzola 2012 and Ellingsen 2013
into the *meaning* stop — the first of the four builds RESEARCH.md names — and
both checkers pass:

```
pages 6 · stops 12 · figures 12 · references 26 · cited 24 · wiki links 18 · claims 7 · rules 10
layout-check: 24 page/width combinations clean
```

The Quarto conversion is committed (`transitioned to Quarto`); the meaning build
is **not committed yet**. The user commits; do not commit or push unless asked.

`docs/` is generated output. Never edit anything in it by hand, and remember
that Quarto **deletes** what it does not own there — §5.

If you are here to add material rather than fix something, TODO.md §A names the
four papers worth building, in order, and RESEARCH.md holds the assessments.

---

## 1. What the page is trying to do

Teach hands-on practitioners — massage therapists, bodyworkers, physios, nurses,
somatic practitioners — what is actually established about touch, in a way that
survives contact with a sceptical client.

The audience constraint that shapes everything: **they have been taught things
that are not true**, usually with confidence, often in paid training. So the page
has to be warm without being credulous, and correct people without insulting the
work they have built a career on. That balance is the hardest thing here and it
is easy to lose in an edit.

Two failure modes to avoid in equal measure:

- **Debunking tone.** "Everything you learned is wrong." Untrue, unkind, and it
  loses the reader in a paragraph.
- **Motivated softness.** Letting a weak claim stand because it is nice. The
  oxytocin material is where this pressure is strongest.

The resolution the page settled on: *the felt experience is real; the mechanism
attributed to it often is not*. That sentence is the spine of parts three and
four.

---

## 2. Current state

Twelve stops across six pages, about thirty minutes, twelve figures of which eleven
are interactive (only *the patient* is static). 24 citations, 26 references, 18 Wikipedia links. Self-contained
— someone arriving cold from a link is oriented before the first stop.

```
Part one · the territory       two roads · the organ · how fine
Part two · the second system   found · the proof · a speed · a warmth
Part three · what touch does   pain · where · how sure
Part four · being honest       corrections · meaning
```

Build with `quarto render` **from the repository root**, audit content with
`node touch-journey/tools/check.js`, audit layout with
`node touch-journey/tools/layout-check.js`. The checkers are cheap; run both
after every edit. layout-check reads the built pages, so render first.

**The source is tracked directly now.** It used to be a single `hands-src.zip`,
the only copy git held — unzip, edit, rebuild, re-zip, and nothing else
survived. The Quarto conversion ended that: the `.qmd` files, the stylesheets,
the bibliography and the figure layer are all ordinary tracked files, and
`docs/` is generated output. The zip is gone; git history still has it.

**The page has two layouts.** Scenes are drawn against `W`: 860 wide, 420
narrow. Every scene branches on `NARROW`. The choice is made from **the figure's
own box width**, not the viewport — `figures.js` measures it and passes the
answer to `layout()`, and a `ResizeObserver` re-renders when the decision flips.
It used to key off a media query, which stopped predicting anything once a
sidebar and a margin TOC sat beside the reading column: at a 1100px viewport the
column is about 560px, and an 860-unit scene put labels at 8.8px there. README
§*Two layouts* has the reasoning.

### The Quarto conversion (2026-09-06)

The single scrolling page became a six-page Quarto website. Same twelve stops,
same figures, same numbers — `check.js` reports 12 stops, 12 figures, 24
references, 22 cited, 17 wiki links, 7 claims, 10 rules, as before.

- **Prose is markdown now.** `md()`, `refNum()` and `REF_ORDER` are gone;
  citeproc numbers citations from `refs.bib` under a numeric superscript style
  and builds a reference list at the foot of each page, with the complete list
  in journey order on the closing page.
- **`page.js` became `js/figures.js`** and does figure mounting only.
  `scenes.js` is unchanged apart from `layout()` taking an override.
- **The twelve figure captions moved into the `.qmd`**, so `check.js` audits
  them. They used to sit in `page.js`, outside everything it looked at.
- **Navigation is the Quarto sidebar** plus a per-page TOC, replacing the
  contents rail.
- **The narrow/wide decision became box-based** — see above.

### The meaning build (2026-09-06)

Gazzola 2012 and Ellingsen 2013 went into the last stop — RESEARCH.md's item
one, and the fix for the only figure on the page carrying no evidence.

- **The `context` figure has two halves now**, either side of a rule. Above it,
  the three switches and the verdict words, unchanged and still illustrative.
  Below it, `believePanel()` draws Gazzola's two measured ratings on a −5 to +5
  scale from `BELIEF` in `figure-data.js`, with ± one SD. A fourth control
  changes what the reader believes and moves the marker. The caption says which
  half is which, because they are not the same kind of thing.
- **Ellingsen stayed out of the figure** and went into the prose. Its rating
  effects are a fifth of a point against Gazzola's five and a half; one axis
  could not carry both without making the smaller look like nothing. Its real
  contribution — sensory processing moving *up* for pleasure and *down* for pain
  under the same expectation — is a sentence.
- **Reading Ellingsen in full changed three things** that the research document
  had from secondary sources. Its control session gave no spray at all, so it is
  placebo against nothing rather than a blinded comparison. Its SI finding is
  for *pain*, downward — the primary-somatosensory result for pleasant touch is
  **Gazzola's alone**, and the figure note was going to attribute it wrongly.
  And the pleasantness effects are small. RESEARCH.md §2.4 records all three.
- **The confound rides with the data.** Gazzola's woman also behaved warmly
  where the man behaved distantly, so belief about sex, attractiveness and
  manner cannot be separated. That sentence is in the figure itself, not only in
  the caption, because a figure gets screenshotted away from its caption.
- **`refs.bib` gained two entries**, positioned where the journey first cites
  them rather than appended — the file is in first-citation order and
  `carry-back.qmd` pulls all of it in with `nocite: @*`.
- **A pre-existing bug fixed on the way**: the narrow doorway painted over the
  third condition label. §5 has it.
- **`layout-check.js` clicks the new control.** Adding a control without adding
  it to that selector would have quietly broken the promise that every control
  is exercised.

### The pass before it (2026-09-06)

- **Twelve narrow layouts added.** The page had never worked on a phone: at
  `W=860` on a 390px screen the scale factor is 0.36, so a 13u label rendered at
  **4.7px**. It is 11.1px now, and 8.9px at 320px.
- **Label colour restored.** Every `fill` attribute on a classed `<text>` had
  been dead for the life of the page — see §5.
- **Voice changed.** Instruction became observation, the narrator is **we**, and
  purpose language was removed — see §3.
- **Four layout bugs and two dead code paths fixed**, all pre-existing.

---

## 3. The editorial standard

These are not style preferences. Each one exists because breaking it produced a
real error during authoring.

**Every stop names its source before the reader meets the finding.** The `src`
block sits above the figure. An earlier draft had a citation card *after* the
prose, which meant meeting a claim before knowing where it came from.

**Every source carries an honest weight assessment**, in a sentence, not a badge:
*"Strong evidence, and a single case — you cannot arrange for a second patient."*
If you add a paper, write this line before you write the prose. It disciplines
what the prose is allowed to say.

**Say when researchers disagree.** Part four exists for this. The page is more
credible for containing "we had to take this back" than it would be without.

**Never let a measurement carry a practice conclusion it cannot support.** See
§5 — this is the error class that got furthest.

**Do not describe chrome that is conditional on viewport.** This is why the
opening block never mentioned the old contents rail, which only rendered above
1340px. The rail is gone — navigation is Quarto's sidebar and a per-page table
of contents, which are always present — but the rule stands for anything else
added later. `check.js` still fails on the phrase "contents rail".

**Interface text must track state.** A hint that says "tap to take the hand away"
has to change when the hand is away.

**The narrator is "we", and it observes rather than instructs.** The closing list
used to be ten imperatives under "What to actually do with this" — *Slow down*,
*Warm your hands*, *Drop the hormone claims*. It is now "What we would carry back
into the room", and the entries report what the reading suggested rather than
telling the reader what to do. Same evidence, same order; different standing. The
page is a record of what two readers found, not a protocol.

**Humility is calibrated, not uniform.** This matters more than it sounds. The
temptation when softening tone is to hedge everything equally, which destroys the
single most useful thing the page does — separating a replicated finding from a
shaky one. Stay confident where the evidence is (two systems, the speed tuning,
the gate); be openly unsure only where it is thin (oxytocin, cortisol). Rule 8
still says flatly that "Activating your C-tactile fibres" goes beyond the
evidence, and should.

**Nothing biological is described as having a purpose.** Not *what each system is
for*, not *seems to exist to*, not *in the business of*. The page says what things
do and what they respond to, because that is what the studies measured. The 1999
paper found a second system and did not know **what it was doing** — that is a
statement about observation, not about a purpose still to be discovered. Human
purpose is fine and stays: "Who it is for", the practitioner's "role, for a
purpose", and "what you believe it is for" — the last one is the whole subject of
the final stop.

**Plain words, except where the real name is the point.** Written for readers with
no science background, so: *hairless* not *glabrous*, *nerve disease* not
*neuropathy*, *how common they are* not *a prevalence figure*, *checking their own
published work* not *auditing their own literature*. The exception is a term the
page deliberately introduces and links to Wikipedia — *myelin*, *mechanoreceptors*,
*two-point discrimination*, *microneurography*, *affective touch*. Those stay, with
a plain gloss beside them. Paper titles and journal names in `refs.bib` are quoted
records and are never reworded.

---

## 4. What is verified, and how well

Everything below was checked against sources during authoring. Confidence varies
and the page reflects that; **do not flatten it.**

| Claim | Confidence | Note |
|---|---|---|
| Two systems, fast myelinated and slow unmyelinated | solid | Vallbo 1999, replicated for 25 years |
| CT signal arrives ~1 s behind | solid enough | ~1 m/s conduction over a forearm; page says "something like a second behind" |
| 27 of 38 units were low-threshold | **exact, but easy to misuse** | those units were *selected* for answering gentle touch — it is not a prevalence figure. The page says so explicitly. Do not simplify this back. |
| Patient could feel brushing, activated insula not S1 | solid | Olausson 2002, single case |
| CT firing peaks 1–10 cm/s, tracks pleasantness | solid at group level | individual variation is large — part four says so |
| Spontaneous caress speed | **contradicted** | measured spontaneous stroking runs *faster* than the CT optimum. An earlier draft claimed the opposite. The caveat is in the text; keep it. |
| Tuned to ~32 °C; all speeds rated better at skin temperature | good | Ackerley 2014, small study |
| Two-point thresholds: fingertip 2–3 mm … back ~39 mm | ranking solid, numbers soft | Weinstein 1968; the test itself is criticised (Tong 2013) |
| Gate control | foundational, much revised | do not present the 1965 mechanism as current detail |
| Handholding reduces threat response; partner > stranger | good, small studies | Coan 2006, Goldstein 2018 |
| Permitted-touch area tracks bond strength, n=1368, 5 countries | solid | self-report; the page says so |
| Sparse CT innervation of glabrous hand skin | newer, revises the old story | Watkins 2021 — the "none in the palm" line is retired |
| Only ~34% of "affective touch" papers mention CT afferents | exact | Schirmer 2023 |
| Massage lowers cortisol | **weak** | Moyer 2011 found it far smaller than claimed |
| Touch raises blood oxytocin | **weakest thing on the page** | sits at 0.26 in the CLAIMS figure, deliberately |
| Same caress, believed source moved the rating −2.53 → +3.05, and moved SI | good, and confounded | Gazzola 2012, n=18 heterosexual white men. The woman also behaved warmly where the man behaved distantly — sex, attractiveness and manner cannot be separated, and the page says so. The trial-by-trial SI correlation is at an **uncorrected** *p* < 0.005 |
| Expectation raised pleasure and lowered pain, moving sensory processing in opposite directions | dissociation good, effects small | Ellingsen 2013, n=28. The control session gave **no spray at all**, so it is placebo against nothing. Pleasantness moved a fifth of a point (*p* = 0.049); the pain effect and the imaging dissociation are the sturdy parts |

The `CLAIMS` figure encodes a judgement, not effect sizes, and the caption says
so. Its value is the **gradient** — physical claims strong, hormone claims weak.
`check.js` fails if the ordering breaks or the weakest claim drifts above 0.4.

---

## 5. Error classes that actually occurred

Worth knowing, because they will recur.

**A CSS rule silently beating a presentation attribute.** Every
`fill="var(--blue)"` on a `<text>` that also carried a class was dead, because
`.lab`/`.sm`/`.xs`/`.big` all set `fill` and presentation attributes sit *below*
author CSS in the cascade. For most of this page's life no label was ever blue or
clay — measured, all 14 class+fill combinations computed to the class colour —
while the source read as though the two-colour scheme was working. Fixed by
moving them to inline `style="fill:…"`, which does outrank a class. **If you add
a coloured label, use `style`, not the attribute.**

**A duplicate declaration silently shadowing the real one.** `scenes.js` defined
`sceneContext` twice; the later definition won, so the earlier doorway
illustration never rendered at all. The old `page.js` had a second, unreachable
`case "claims"`. This is legal JavaScript — neither a syntax check nor
`check.js` will tell you. It is also where the "eleven figures / twelve items"
confusion in the README came from.

**Selector specificity beating a later rule.** A mobile `figure { margin-left: … }`
did nothing, because `.wide` zeroes those margins at ≤820px and a class outranks
an element selector. It has to be `figure.wide`. Nothing errors; the rule is just
ignored.

**A checker that under-reports is worse than no checker.** The first version of
the layout probe inspected only `<text>` and wrapped `getBBox()` in a try/catch
returning a zero box. It reported the `meaning` figure **clean** while most of
that figure sat off-canvas. `layout-check.js` now walks every drawable element
and lets a throw surface.

**A correct measurement carrying a conclusion it cannot support.** The worst one,
and it survived several drafts:

> "So fine, detailed work on a back is largely wasted as information — the
> resolution is not there."

Two-point discrimination measures whether skin resolves two *simultaneous*
points. It says nothing about whether precise placement matters, because
(a) locating a single contact is more accurate than telling two apart, (b) pressure
reaches muscle, fascia and joints, which have their own sensory supply, and
(c) in manual work the precision often matters most to the *practitioner*, whose
fingertips resolve at 2–3 mm. A reader who works with tissue rather than skin
spotted it immediately. **Rule: when a sentence moves from what was measured to
what you should therefore do, re-read it.**

**An opaque shape drawn over a label, which the layout checker cannot see.**
`layout-check.js` asserts that no two **`<text>`** elements overlap. It says
nothing about a `<path>` or a `<rect>` landing on one. In the narrow *meaning*
figure the doorway's arch apex sits at `DTOP + 38 - DW/2`, not at `DTOP` — with
`DW=176` that put it at y=160, above the third condition label at y=176 — and
the path's opaque `paper2` fill is drawn *after* the labels, so it painted over
"…was coming". It had been doing that for the life of the narrow layout, through
a green checker, and only a screenshot found it. Twice in one session, in fact:
the measured panel's first draft also had a `<foreignObject>` sitting on two
labels, equally invisibly. **Rule: after moving anything in a scene, look at it.
The checker rules out one class of error and not this one.**

**Stale counts after the page grew.** "Six stops" survived an expansion to twelve.
`check.js` now cross-checks stated counts against the arrays.

**A title that stopped matching the scope.** *"Your hands are talking to a second
nervous system"* was right for seven stops about CT afferents and misleading once
part three existed. If you add sections, check the title still covers them.

**Assumed prior training.** "The fast road is what you learned about" excludes
exactly the reader the page is for.

**Interface text that did not track state.** The gate hint.

**A silently failed edit.** The send-a-touch animation was inserted against an
anchor comment that no longer existed. The build passed its syntax check because
the file was still valid JavaScript — it just did not contain the function. Only
clicking the button found it. **Lesson: a green build is not evidence a feature
exists.** `tools/layout-check.js` now clicks every control on every page, which
is the cheapest defence against this recurring.

---

**A generator that owns its output directory.** `docs/` is what GitHub Pages
serves and it is now Quarto's `output-dir`. Quarto **deletes anything in there
that the project does not know about**: the first full render removed the
published `docs/touch-journey/` outright and replaced the hand-written
`docs/index.html` with a redirect stub to whichever page sorted first. A working
document that lived only at that path was lost with it.

Worse, this had been checked and the check was wrong. An earlier probe concluded
Quarto left unknown files alone — but that probe used `output-dir: ../docs`,
where Quarto *refuses* to clean because the directory sits outside the project
and says so in a warning. The conclusion did not survive moving the project root
inside. **Lesson: a probe's result is only valid for the configuration it was
run under, and "I verified this" is worth nothing if the thing verified is not
the thing shipped.** Anything that must exist in `docs/` is now a project input.

**A stylesheet rewrite that silently dropped a rule block.** Porting `warm.css`
into the theme lost `.lab/.sm/.xs/.big`, the four SVG text classes. Every label
in every scene fell back to the 19px body size — about 40% oversized — and
collided at every width. Nothing errored; the page just looked wrong in a way
that is hard to see without measuring. `layout-check.js` caught it, which is the
entire argument for having it.

**A framework parser that cannot read valid CSS.** Quarto's `cssVarsBlock` step
throws `SCSSParsingError` on quoted strings, negative numbers and `calc()` in an
`scss:rules` block. It is non-fatal, so it prints on every render and trains you
to ignore render output — which is how a real error gets missed. The fix was to
split the look: `warm.scss` holds Bootstrap variables only, `warm.css` holds the
page's rules.

**Markup that lands in two places at once.** Pandoc copies a heading's classes
and attributes onto both the `<section>` it creates and the `<h2>` inside it, so
`.stop` block styling hit every heading as well. Block rules say `section.stop`
for this reason. Related: headings nested inside fenced divs are excluded from
the page TOC entirely, which is why each stop is a heading with attributes
rather than a div wrapping one.

## 6. Rough edges

- **`W` is two values, not one** — 860 wide, 420 narrow, set by `layout()` in
  `scenes.js`. Which one is chosen is decided in `figures.js`, from the figure's
  **own box width** rather than the viewport, and re-decided by a
  `ResizeObserver` when it flips. A new scene needs a `NARROW` branch; without
  one it is drawn for an 860 canvas inside a 420 one and most of it lands
  off-screen. `layout-check.js` fails loudly on this, which is the point of it.
- **The stroking dot's travel span** comes from `STROKE_GEOM`, which `sceneSpeed`
  sets as it draws, because the arm sits in a different place in each layout.
  `stroke()` in `figures.js` reads it. If you change `arm()` or the speed-scene
  margins, that object is what to re-check.
- **No dark theme**, on purpose. Adding one means a second palette for the soft
  fills, which mostly rely on warmth to read at all.
- **Body zones in the topography figure are invented** — a simplification of the
  published maps. The bond-against-area bars beside them are the paper's actual
  finding. Do not present the body map as data.
- **The meaning figure's verdict words** (welcome / endured / intrusive) are
  illustrative. No study assigns them. Caption says so; keep it. Since the
  Gazzola panel was added below the rule, the figure holds both kinds of thing
  at once, and the caption now has to say which half is which — that is the only
  reason the two can sit together honestly. If the panels are ever rearranged,
  that labelling is the thing to protect.
- **`check.js` still cannot see layout** — that is what `tools/layout-check.js`
  is for. It walks the **built** pages in headless Chrome at six widths, clicks
  every control on each, and asserts that nothing leaves its viewBox and no two
  labels overlap. It does not render, so `quarto render` first or it audits a
  stale build. Geometry comes from `getBBox()`, so results are
  independent of display scale. Exit 1 on failure. It needs `chrome` or
  `chromium` on PATH and skips quietly if neither is there. Two notes if you
  extend it: headless Chrome will not size its window below ~500px, so the page
  is loaded in an exact-width iframe, and that iframe needs
  `--allow-file-access-from-files` to be readable over `file://`.
- **The two-point figure is not drawn to scale**, although its caption used to
  claim it was. Measured: the dots render at 1.27x life size at 320px and 2.45x
  at 1100px, against a true 3.78 CSS px per mm. The caption now says "drawn
  larger than life … the proportions between body parts are the real ones",
  which is honest. But the figure still cannot be checked against a real ruler,
  and "test it on yourself in a minute" is the promise it is making. Genuine 1:1
  is feasible — 2.5mm is 9.4px and a 45mm calf 170px, both fit a phone — and
  would make that promise real. **Left undone deliberately: it is a content
  decision, not a bug.**
- **Long-run link rot.** Two dozen external links. No checker for them.

---

## 7. Ideas considered and not built

> Several of these have since been assessed properly against source —
> see [RESEARCH.md](RESEARCH.md), which supersedes the sketches below for
> self-touch, development, deprivation and clinical populations, and adds ten
> more. What follows is the original reasoning for leaving each out.


Not rejected — just not yet, with the reason, so you can weigh them.

**A "test yourself" two-point widget** that asks the reader to actually try it and
record what they found. The acuity stop already invites this in prose. A recorded
result would make it stick, but it needs storage and the page is deliberately
stateless.

**Self-touch versus other-touch.** Why you cannot tickle yourself — prediction
cancels the sensation. Genuinely interesting, directly relevant to why a
practitioner's hand does something the client's own cannot, and there is decent
work behind it (Blakemore, Wolpert & Frith). The best single omission to fix.

**Touch across development.** Kangaroo care, preterm skin-to-skin, Feldman's
follow-up work. Strong evidence, high emotional weight, and it would broaden the
audience to midwives and neonatal staff. Left out only for length.

**Touch deprivation.** Topical and poorly evidenced. Would need care.

**Clinical populations** — altered affective touch in anorexia nervosa, autism.
Real literature, but it risks the page being read as diagnostic.

**Itch, temperature and proprioception** as siblings of touch. Would complete
part one, at the cost of the page's focus.

**Spaced repetition or a quiz.** On the design checklist, never built. The
predict-then-reveal in the claims figure is the only retrieval practice present.

---

## 8. The research landscape, beyond what made it in

Extended in [RESEARCH.md](RESEARCH.md), which assesses fifteen further texts for
fit and for whether they could carry a figure. Two things there change what is
written below: a 2024 meta-analysis (Packheiser et al., 137 studies, 12,966
people) now sits above everything in this list for the claims in part three, and
the newest primary finding on CT afferents is 2025, not 2023.

If you extend, these are the reference points:

- **McGlone, Wessberg & Olausson (2014), *Neuron*** — the standard overview, free
  to read, and the source most second-hand accounts are quoting. Start here.
- **Suvilehto, Cekaite & Morrison (2023), *Nature Reviews Psychology*** — the
  widest recent view of social touch.
- **Kidd, Devine & Walker (2023), *Health Psychology Review*** — the bridge from
  fibres to stress physiology, and the closest thing to a review written for
  people who do this for a living.
- **Schirmer, Croy & Ackerley (2023)** — the field auditing itself. The single
  most important corrective, and the reason part four exists.
- **Morrison, Löken & Olausson (2010), "The skin as a social organ"** — the
  friendliest conceptual framing.

The field's own open questions, as of writing: how much CT afferents contribute
relative to Aβ in ordinary perception; whether the social-touch hypothesis
generalises beyond stroking; how much individual variation is real signal versus
measurement noise; and whether "affective touch" as a construct should be pinned
to a fibre class at all. That last one is live and unresolved.

---

## 9. If you change one thing, change this

The page currently ends on the strongest note it has — *the fibre is not the
feeling*, meaning is doing most of the work, which is what a good practitioner
already knows. Do not bury that under new material. If part five appears, it
should come **before** "meaning", not after.
