# Touch is not one sense — source

A reading journey for hands-on practitioners.

A scroll-through page on what is known about touch.
**Twelve stops in four parts**, about thirty minutes, twelve figures of which
eleven are interactive.

```
One · the territory      two roads · the organ · how fine
Two · the second system  found · the proof · a speed · a warmth
Three · what touch does  pain · where · how sure
Four · being honest      corrections · meaning
```

It is written to be **self-contained**: someone arriving cold from a link learns
what it is, who it is for and how it is sourced before the first stop. Three rows,
deliberately short — the opening block is orientation, not an introduction, and
anything that could live inside a stop does.

The block says nothing about the contents rail, because the rail only appears
above **1340px** and many readers never see it. Never describe chrome that is
conditional on viewport.

That breakpoint is not arbitrary and should not be lowered casually: the rail is
fixed-positioned at `50vw - 656px`, and below about 1340px it lands on top of the
prose. It was briefly set to 1160px and did exactly that.

> **Continuing this?** Read [HANDOFF.md](HANDOFF.md) first. It covers what was
> decided and why, what is verified and how well, the error classes that actually
> occurred during authoring, and what was considered but not built. This README
> covers the mechanics.

## What is in this folder

This is the **published** copy, served from `docs/touch-journey/`:

```
index.html        the built single-file page (build.sh output, renamed)
hands-src.zip     the source tree the rest of this README describes
README.md         this file
```

`HANDOFF.md` and `check.js` sit here too but are gitignored, so they stay local
and are never served.

Everything below describes the **source** tree — unzip `hands-src.zip` and work
in `hands-src/`. Its `index.html` is the small loader that pulls in `css/` and
`js/`; the `index.html` sitting next to this README is the built result, and is
what the link from the site index points at.

## Run it

```
open index.html            # no server, no build, no dependencies
node tools/check.js        # content audit — run after every edit
./build.sh                 # -> dist/touch-journey.html
```

`tools/check.js` has no dependencies and takes milliseconds. It verifies that
every `[ref:id]` resolves, that wiki markup is well formed and balanced, that
every stop has the fields it needs and a registered scene, that stated counts
("twelve short stops") match the arrays, that the evidence figure keeps its
descending shape, and that phrasings which caused trouble before have not come
back. Exit code 1 on failure, so it drops into a pre-commit hook.

It cannot see layout. SVG overflow, label collisions and helper text that fails
to track state still need a browser — see HANDOFF.md §6.

## Why it looks different

This is the odd one out in the family. Everything else here — the hormone
instrument, the sleep lesson, the paper explainers — uses the same strip-chart
vocabulary: sage paper, Spectral and IBM Plex, muted traces on a grid. That
reads as *laboratory*, which is right for those and wrong for this.

So this one is a book rather than an instrument:

| | The instrument pieces | This |
|---|---|---|
| Paper | sage grey `#EDEEE9` | warm clay-white `#FAF5EF` |
| Type | Spectral + IBM Plex Sans | **Fraunces** + **Newsreader** |
| Shapes | rectangles, gridlines, axes | rounded, soft fills, almost no axes |
| Colour meaning | 13 trace hues | two: **blue** for the fast road (information), **clay** for the slow road (feeling) |
| Navigation | steppers and rulers | scroll, with a thin contents rail |
| Body size | 15px | 19px |
| Theme | light and dark | light only, on purpose |

The two-colour scheme does real work: once the reader learns blue = fast/what
and clay = slow/how-it-feels in the first figure, every later figure reads
without a legend.

## Two layouts

Scenes are drawn in user units against `W`, and `W` has two values. Above
820px it is **860** — the original wide layout. At or below 820px `layout()`
switches it to **420** and every scene takes its narrow branch: side-by-side
panels stack, right-hand label columns move underneath the art, long
annotations wrap into a `foreignObject`.

This is not cosmetic. An SVG scales to its box, so a label's real size is
`fontsize x (box px / W)`. At W=860 on a 390px phone that factor is 0.36 and a
13u label renders at **4.7px**. At W=420 the same label renders at 11.6px.
`css/warm.css` caps the narrow SVG at 460px so it cannot scale past a
comfortable size on a tablet.

`page.js` listens on the media query and calls `render()` when it flips, because
the drawing width changes on each side of it. `ST` is module-level, so every
control the reader has already touched keeps its value across the redraw.

**Adding a scene:** give it a narrow branch. `tools/check.js` cannot see
layout — verify at 320, 390 and 1100px with something that can.

## Markup conventions

Two small conventions inside the prose strings in `journey.js`, expanded by
`md()` in `page.js`:

```
[ref:vallbo99]                    → superscript link to the numbered reference
{{Insular cortex|the insula}}     → link to English Wikipedia
```

References are **numbered in citation order automatically** — `refNum()` assigns
numbers the first time each id is seen while the page renders, so adding or
reordering a stop renumbers everything correctly with no manual work. The
reference list at the bottom is built from that same order, and every citation
anchors to its entry.

Add a source to `REFS`, cite it with `[ref:id]`, and it appears. A citation to an
id that does not exist renders as nothing rather than breaking.

**Verified on each build:** 22 citations, 0 broken anchors, 22 references listed,
0 unexpanded markup tokens, 17 Wikipedia links. That check is in the test harness
and is worth re-running after any content edit.

## Layout

```
index.html        script order matters
css/warm.css      the whole look; light only
js/journey.js     ALL prose, citations, the corrections, the seven rules
js/scenes.js      six illustrations. Not charts — rounded caps, soft fills
js/page.js        assembles the page, wires the two live figures
```

Edit copy in `journey.js`; nothing else contains reader-facing text.

## The figures

Twelve, deliberately in different visual vocabularies so that no two stops feel
like the same chart twice. **Eleven of the twelve are interactive**, and the rule
for adding interaction is that it has to teach something the prose cannot:

1. **Two roads** *(interactive)* — the fast road is drawn dead straight, the slow road wanders. Press **send a touch** and both signals travel **in real time**: the fast one crosses in 0.06 s, the slow one takes a full second, and a live readout counts it down. The one-second gap is the stop's whole claim, and it is the difference between reading it and feeling it.
2. **Microneurography** *(interactive)* — swap the soft brush for a sharp point and the slow fibre goes quiet while the fast one keeps firing. That contrast is literally how the fibres were told apart from pain fibres, so it belongs on a switch rather than in a sentence.
3. **The patient** — two panels side by side, one with the fast road greyed and dashed. The design of the study *is* the illustration.
4. **Speed** *(interactive)* — the tuning hill against the ramp, plus a dot stroking 15 cm of forearm at the true speed. Watch the dot, not the curve.
5. **Speed × warmth** *(interactive)* — the sweet spot as a region rather than a line, with a verdict that changes.
6. **Corrections** *(interactive)* — four flip cards, each holding what the field used to say on the front and what it says now on the back. Not a chart at all, and the only figure with no SVG in it.
7. **Skin cross-section** *(interactive)* — five receptor types at their real depths, each drawn as its own shape. Tap to read what it does. The only anatomical figure.
8. **Two-point acuity** *(interactive)* — two dots drawn **to scale on screen** at the true threshold, plus every body part as a comparison ruler. The most physical figure on the page; readers can test it on themselves in a minute.
9. **The gate** *(interactive)* — take the hand away and the gate opens. A mechanism diagram, not a chart.
10. **Social touch topography** *(interactive)* — a body outline with permitted zones, beside the bond-against-area bars. Clicking either the buttons or the bars changes it.
11. **How sure are we** *(interactive)* — the chart is **hidden until you guess**. You place your own estimate for "touch measurably raises oxytocin" first, then reveal; your marker stays on the chart next to the real position. Predict-then-reveal is the one interaction pattern with direct experimental support for improving recall, and this is the claim practitioners most reliably overrate.
12. **Meaning** *(interactive)* — three switches for consent, trust and warning, with the physical stroke held identical at 3 cm/s and 32°. The verdict moves from *welcome* through *endured* to *intrusive* while nothing about the touch changes. Labelled illustrative, because no study assigns those words.

The corrections are four tap-to-turn cards rather than a figure, because the
content is a before/after and cards are the honest shape for that.

## Honesty rules kept from the rest of the family

Lighter in tone, same standard underneath:

- Every stop names its paper, links it, and carries a one-sentence **grade** in plain English — "widely replicated as a group average", "strong, and a single case" — instead of a badge.
- The corrections section exists specifically so a reader does not leave quoting the 2014 version of a story the field has since revised.
- The final rules are ordered by **how confident you can be**, and the last one says explicitly that safety, consent and relationship are doing more work than any number on the page.
- The closing note says the page cannot tell you what the person in front of you wants.

## The evidence-strength figure

`CLAIMS` in `journey.js` places seven claims on a 0–1 confidence line. These are
**judgements about how much weight a practitioner should give each claim**, not
effect sizes, and the caption says so. They are ordered deliberately: the
best-supported claims are the simplest and most physical, and the two weakest are
the hormone claims that circulate most confidently in training rooms.

If you edit it, keep that shape honest. The point of the figure is the gradient,
and inflating the oxytocin line would destroy it.

## Structure of a stop

Fixed, so the shape is learnable and every claim is held to the same standard:

1. **Year or era**, then the title
2. **The lead** — the question this stop answers
3. **The research** — a shaded strip naming the paper *before the reader meets
   the finding*, with an honest one-line assessment of how much weight it bears
4. **The figure**
5. **The body**
6. **For your hands** — what changes in practice

The research strip sits above the figure deliberately. An earlier draft put the
citation in a card *after* the prose, which meant a reader met the claim before
they met its source.

## Interface text must track state

A hint that describes an action has to change when the action changes. The gate
figure shipped with a button that toggled its label and a hint beside it that did
not — so after taking the hand away it still read *"tap to take the hand away."*

The check that catches this: for every control, click it and assert the
surrounding helper text is different. Note that **option pickers are exempt** —
"where on the body" and the body-part buttons should not change their labels, and
a naive sweep flags them as false positives. The real target is imperative text:
`tap to…`, `drag the…`, `press…`.

Audited after the fix: the gate hint was the only stale one. The flip cards, the
receptor diagram, the send-a-touch readout and the context toggles all update, and
the two static instructions that remain ("tap any receptor", "tap each card to
turn it over") are true in every state.

## The class of error to watch for

The commonest way this page could go wrong is not a wrong number. It is a
**correct measurement carrying a conclusion it cannot support**. One got through
several drafts:

> "So fine, detailed work on a back is largely wasted as information — the
> resolution is not there."

Two-point discrimination measures one narrow thing: whether skin resolves two
*simultaneous* points. It says nothing about whether precise placement matters,
because (a) locating a single contact is more accurate than telling two apart,
(b) pressure reaches muscle, fascia and joints, which have their own sensory
supply, and (c) in manual work the precision often matters most to the
*practitioner*, whose fingertips resolve at 2–3 mm. A reader who works with
tissue rather than skin spotted it immediately.

Four more of the same species were found in the sweep that followed:

| Was | Problem | Now |
|---|---|---|
| "27 of the 38 fibres they isolated" | implies a prevalence the design cannot give — the units were *selected* for responding to light touch | ratio stated, then flagged as not a prevalence figure, with the separate observation that does support it |
| "the speed at which a person spontaneously strokes someone they love" | measured spontaneous stroking actually runs *faster* than the tuning peak | the caveat is now stated in the text |
| "proportional to the strength of the emotional bond" | the paper says "directly related to" | "tracks" |
| "the rest of this page is about them" | untrue after the page grew — parts three and four are not | "the next four stops" |

The lesson for editing: when a sentence moves from *what was measured* to
*what you should therefore do*, that is the sentence to re-read.

## On the title

It was originally *"Your hands are talking to a second nervous system"*, which was
a good hook for a seven-stop piece about C-tactile afferents and a **misleading
one** once the page grew to twelve stops. Part three — pain, the social map, the
evidence audit — is not about that system at all.

The current title covers the actual spine (two systems, five receptors, acuity,
pain, meaning) and the C-tactile revelation moved into the standfirst, where it
still does the hooking without over-promising. If you add sections, check the
title still covers them.

## Known rough edges

- The stroking dot's travel span is hand-tuned to the arm shape in `scenes.js`; if you change `arm()` or the scene margins, re-check `stroke()` in `page.js`.
- `W = 860` is assumed in `scenes.js` and again in that animation.
- No dark theme. Adding one would need a second palette for the soft fills, which mostly rely on warmth.
