# Next up

Short list to come back to. Detail lives in [RESEARCH.md](RESEARCH.md);
decisions and standards live in [HANDOFF.md](HANDOFF.md).

---

## A. The research pass (2026-09-06) — in brief

Fifteen texts checked against source. Full assessments, figure sketches, error
warnings and paste-ready reference entries are in RESEARCH.md. The short version:

**Three gaps found.** The newest reference on the page is 2023 and two relevant
things have landed since. The closing *meaning* figure is the page's strongest
note and its only unevidenced one. Nothing on the page is about the
practitioner's own hands.

**Build these four, in this order:**

| | Text | What it buys | Cost | |
|---|---|---|---|---|
| 1 | **Gazzola 2012** + **Ellingsen 2013** | Removes the only unevidenced figure. Same physical caress, believed source moved the rating −2.53 → +3.05 *and* moved primary somatosensory cortex. | No new stop — rebuild *meaning* | **done 2026-09-06** |
| 2 | **Blakemore, Frith & Wolpert 1999** | The omission HANDOFF §7 already names. Its experiment *is* a two-slider interaction: delay 0→200 ms and rotation 0→90° each bring the sensation back. | One new stop, part three, **before** *meaning* | **next** |
| 3 | **Packheiser 2024** (*Nat Hum Behav*, 137 studies, 12,966 people) | Replaces hand-placed `CLAIMS` dots with measured intervals. Moderators are the practitioner's real questions. | Rebuilds the *how sure* stop — a day, not a paste | |
| 4 | **Johansson & Vallbo 1979** | 241 units/cm² at the fingertip vs 58 in the palm. Gives the acuity ranking a cause instead of a list. | Extends two existing figures | |

**Item 1 is on the page.** RESEARCH.md §2.4 records what shipped and what
reading the two papers in full changed. `refs.bib` is 26 entries now, 24 cited.
Ellingsen ended up in the prose rather than the figure — its rating effects are
a fifth of a point against Gazzola's five and a half, and one axis could not
carry both honestly.

**Two tensions to hold, not resolve.** Packheiser found no familiar-vs-stranger
difference in adults (*g* diff 0.02), against Coan 2006 and Goldstein 2018, both
cited, and against the 0.80 in `CLAIMS`. And adult cortisol at *g* = 0.78 sits
against Moyer 2011, which is why cortisol is at 0.34. Part four is where these
belong, stated as disagreements. **Do not quietly move either number.**

**Second tier, each needing a new stop:** Moore 2025 (CT afferents are hair
follicle receptors — newest primary finding in the field), Peters 2009 (finger
size, not sex, predicts acuity), Legge 2008 (acuity falls 0.86%/yr in sighted
people, not in blind ones), Hertenstein 2009 (emotions decoded from touch alone).

**Five items are unverified** — RESEARCH.md §6. Read the papers before using any
of them. The Hertenstein per-emotion accuracies and the Stevens ~1%/yr aging
figure are the two most likely to be reached for. Ellingsen 2013 was the sixth
and was cleared on 2026-09-06; reading the full text corrected three things the
summary had wrong, including which paper the primary-somatosensory finding
belongs to.

---

## B. The Quarto conversion — done

The single scrolling page is now a six-page Quarto website, live at
`docs/touch-journey/`. Same twelve stops, same figures, same numbers.

```
stories/
├── _quarto.yml            project root · output-dir: docs
├── .nojekyll
├── index.html             the shelf — still hand-written, copied verbatim
├── shared/                theme, figure kit and checkers — every story
│   ├── warm.scss warm.css ama.csl  figure-kit.js  tools/
├── touch-journey/         the source
│   ├── _metadata.yml      bibliography and scripts, this subtree only
│   ├── refs.bib
│   ├── index.qmd territory.qmd second-system.qmd
│   ├── what-touch-does.qmd being-honest.qmd carry-back.qmd
│   ├── js/{figure-data,scenes,figures}.js
│   (checkers are shared now — shared/tools/)
└── docs/                  OUTPUT ONLY — Quarto deletes what it does not own
```

`shared/tools/check.js`: 6 pages · 12 stops · 12 figures · 26 references ·
24 cited · 18 wiki links.
`layout-check.js`: 24 page/width combinations clean. Smallest label 9.4px at
320px, against 8.9px on the single-file original.

The reasoning, the error classes it produced and the rules that came out of it
are in HANDOFF.md — §2 for what changed, §5 for what went wrong. README.md
covers the mechanics.

### The one piece left

**The shelf is still hand-written HTML.** `index.html` at the repo root is
copied verbatim into `docs/` as a project resource. Converting it to `index.qmd`
would finish the move — and **both blockers are now gone** (2026-09-07):

- ~~the theme lives in `touch-journey/_metadata.yml`~~ — it moved to project
  level in `_quarto.yml` when the second and third stories were added, so a
  root `index.qmd` would inherit the warm vocabulary;
- ~~the sidebar is site-wide with this journey's six pages~~ — there is a
  sidebar per story now, scoped by href, so a shelf page would simply match
  none of them.

Still left deliberately: the shelf works and looks right today, and converting
it risks a visible regression on the site's front door for no functional gain.
The reason to do it would be to stop maintaining a second copy of the palette,
which `index.html` still carries inline.

### One risk — decided 2026-09-06

`HANDOFF.md`, `RESEARCH.md` and this file were gitignored by `**/HANDOFF.md` and
friends, so nothing preserved them: the zip that used to had gone, and a Quarto
render had already destroyed one of them once. **They are tracked now.** The
whole working-documents block came out of `.gitignore`, including the unused
`**/NOTES.md` and `**/dev-notes/` patterns, which would have set the same trap
for the next file written.

Checked rather than assumed, per HANDOFF §5: a full render afterwards put no
`.md` into `docs/`. The `resources:` list in `_quarto.yml` is an explicit
allowlist — `touch-journey/js/**` and `index.html` — so working documents in the
source tree are never copied to the published site. No Quarto-side guard needed.


---

## C. Migrated onto the shared figure kit — done 2026-09-07

This story was written before the kit and hand-wired every control, which meant
the shared layout checker could not operate any of them: it reported "clean"
while clicking nothing. `js/figures.js` is now a set of declarations against
`../shared/figure-kit.js`, and `tools/` is gone — one checker covers all three
stories.

Verified as a visual no-op by pixel-comparing every page at two widths before
and after. Two pre-existing defects surfaced on the way and were fixed, both in
the narrow warmth figure and both invisible to a text-versus-text checker:
"skin warm" overran the left edge by about a pixel, and the 18° guide line was
drawn through "the sweet spot".

What the kit gained to make the migration possible, all of it useful to any
story: an `after` hook that runs on every draw (for animations, and for
handlers on parts of a drawing), `controls` declarable as a function of state
(for the predict-then-reveal), a `text` control kind, `coerce: "number"` on
pills whose ids are numbers, and `data-fig-click` so the checker can operate
elements inside a drawing.
