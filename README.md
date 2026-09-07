# Stories

Long-form reading journeys through what is known — and not known — about how
bodies work, written for people who work with them: massage therapists,
bodyworkers, physiotherapists, nurses, movement and somatic practitioners.

Each story is self-contained, sourced in the open, and built to be **operated**
rather than only read. Every claim names its source before you meet it, and
says how much that source can carry.

Live at **[daslu.github.io/stories](https://daslu.github.io/stories)**.

```
stories/
├── _quarto.yml       the site: what renders, the theme, one sidebar per story
├── index.html        the shelf — hand-written, copied verbatim
├── shared/           theme, figure kit and checkers — see shared/README.md
├── touch-journey/    Touch is not one sense        12 stops
├── pain-journey/     Pain is not a damage report   11 stops
├── breath-journey/   Breathing is not a switch     10 stops
└── docs/             OUTPUT ONLY — Quarto deletes what it does not own here
```

## Working on it

```bash
quarto render                                    # from the repo root
node shared/tools/check.js                       # content audit, all stories
node shared/tools/layout-check.js pain-journey   # layout audit, needs a build
```

Both checkers are cheap. Run them after every edit; `layout-check` reads the
built pages, so render first.

**[shared/README.md](shared/README.md)** is the place to start: it covers the
figure kit, the two layouts, the checkers, how citations are ordered, and how
to add a story. Each story then carries its own `HANDOFF.md` — what was
decided, what was verified and how well, and what is still open.

## The standard

These are not style preferences. Each one exists because breaking it produced a
real error.

- **Every stop names its source before the reader meets the finding**, and
  every source carries an honest one-sentence weight assessment. Write that
  sentence before writing the prose; it disciplines what the prose may say.
- **Say when researchers disagree**, and when the evidence is thin. Every story
  ends with a figure ranking how much its own sources can carry.
- **Never let a measurement carry a conclusion it cannot support.** When a
  sentence moves from what was measured to what you should therefore do,
  re-read it.
- **Humility is calibrated, not uniform.** Hedging everything equally destroys
  the most useful thing these pages do — separating a replicated finding from a
  shaky one.
- **Nothing biological is described as having a purpose.** Say what things do
  and what they respond to, because that is what the studies measured.
- **Plain words**, except where the real name is the point — and then it is
  introduced, linked, and glossed beside.
- **The narrator is "we", and it observes rather than instructs.** These are a
  record of what two readers found, not a protocol.
