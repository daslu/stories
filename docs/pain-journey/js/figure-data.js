/* figure-data.js — the numbers the figures draw, and nothing else.
 *
 * The dividing line: if it is inside a figure it lives here, if it is read as
 * text it lives in the .qmd. Every number in this file came from the paper or
 * its abstract, and the comment above each block says which paper and what was
 * checked, so that a later reader can find the source without leaving the file.
 */

/* ── Brinjikji et al. 2015 ────────────────────────────────────────────
 * Age-stratified prevalence of imaging findings in people WITH NO BACK PAIN.
 * 33 studies, 3110 asymptomatic individuals, 32 of the studies using MRI.
 * Estimates come from the paper's generalized linear mixed-effects model, so
 * these are modelled prevalences by decade, not raw counts.
 *
 * This is the story's most useful figure and also its most misusable. The
 * finding is "these appear on scans of people who feel fine, more so with
 * age". It is NOT "these never matter" — the authors say the findings must be
 * read in the context of the patient, and they did not stratify by severity,
 * so pain-free people may simply have milder versions. The caption says so. */
const ASYMPTOMATIC = {
  ages: [20, 30, 40, 50, 60, 70, 80],
  findings: [
    {id:"degeneration", n:"Disc degeneration",  plain:"the disc has dried and worn",         v:[37,52,68,80,88,93,96]},
    {id:"signal",       n:"Disc signal loss",   plain:"the disc looks darker on the scan",   v:[17,33,54,73,86,94,97]},
    {id:"height",       n:"Disc height loss",   plain:"the disc has flattened",              v:[24,34,45,56,67,76,84]},
    {id:"bulge",        n:"Disc bulge",         plain:"the disc pushes past its edge",       v:[30,40,50,60,69,77,84]},
    {id:"facet",        n:"Facet degeneration", plain:"wear at the small joints behind",     v:[ 4, 9,18,32,50,69,83]},
    {id:"protrusion",   n:"Disc protrusion",    plain:"a more pronounced bulge",             v:[29,31,33,36,38,40,43]},
    {id:"listhesis",    n:"Spondylolisthesis",  plain:"one vertebra sits forward of the next",v:[3, 5, 8,14,23,35,50]},
    {id:"fissure",      n:"Annular fissure",    plain:"a crack in the disc's outer ring",    v:[19,20,22,23,25,27,29]}
  ]
};

/* ── Moseley & Arntz 2007 ─────────────────────────────────────────────
 * A −20 °C rod on one hand for 500 ms, physically identical in every trial.
 * The only thing that changed was a coloured light: red, described as hot and
 * more tissue-damaging, or blue, described as cold and less damaging.
 *
 * The abstract reports differences, not condition means, and it reports them
 * as approximate ("difference on an 11 point scale approximately 5.5"). So
 * these are drawn as a difference from a common baseline, and the figure says
 * "about". Inventing two precise endpoints from one approximate difference
 * would be making up numbers.
 *
 * The abstract does not report the sample size. The page does not claim one. */
const CUE = {
  scale: 11,
  rows: [
    {id:"temp",  n:"how hot it felt",       diff:5.5, note:"the same rod, called cold or called hot"},
    {id:"unpl",  n:"how unpleasant it was", diff:3.5, note:"the affective half of the experience"},
    {id:"int",   n:"how intense it was",    diff:3.0, note:"the sensory half"}
  ]
};

/* ── GBD 2021 Low Back Pain Collaborators ─────────────────────────────
 * Counts in millions with 95% uncertainty intervals, and the change in
 * age-standardised rates over the same period. The two move in opposite
 * directions, which is the whole point of the figure: more people have back
 * pain while a person's chance of having it has gone slightly down. Ageing and
 * population growth, not an epidemic. */
const BURDEN = {
  bars: [
    {id:"y2020", n:"2020",              m:619, lo:554, hi:694, kind:"measured"},
    {id:"y2050", n:"2050, projected",   m:843, lo:759, hi:933, kind:"projected"}
  ],
  rateChange: -10.4,        /* per cent, age-standardised prevalence, 1990–2020 */
  rateLo: -10.9, rateHi: -10.0
};

/* ── Khan et al. 2026 ─────────────────────────────────────────────────
 * Meta-analysis of pain neuroscience education, 12 randomised trials, 1485
 * people. Standardised mean differences with 95% confidence intervals.
 *
 * Drawn as intervals rather than points on purpose. The pain interval reaches
 * 0.00 — the paper calls the effect statistically significant, and its upper
 * bound is exactly no effect. A figure that drew a dot would hide that; a
 * figure that draws the interval cannot. */
const PNE = {
  rows: [
    {id:"pain",  n:"pain intensity",   smd:-0.27, lo:-0.50, hi:0.00, i2:67,
     better:"less pain", dir:-1},
    {id:"sleep", n:"total sleep time", smd: 0.42, lo: 0.12, hi:0.71, i2:0,
     better:"more sleep", dir:1}
  ]
};

/* ── the weight each source can carry ─────────────────────────────────
 * A judgement, not a measurement, and the caption says so. Its value is the
 * gradient: the ranking is what a reader should take away, not the numbers.
 * tools/check.js fails if the descending order breaks, or if the single case
 * report drifts above 0.3 — inflating it would destroy the only thing the
 * figure is for. */
const WEIGHTS = [
  {t:"Findings that look like damage are common in people with no pain", s:.90,
   n:"33 studies, 3110 people, and the pattern is the same in every one.", src:"Brinjikji 2015"},
  {t:"Pain is an experience, not a reading taken from the tissue", s:.88,
   n:"The field's own definition, revised in 2020 after a two-year review.", src:"Raja 2020"},
  {t:"Signals from the body are turned up and down before they arrive", s:.84,
   n:"Gate control, much revised since 1965, and the modulation itself is not in doubt.", src:"Melzack 1965 · Mendell 2014"},
  {t:"What a stimulus is believed to mean changes how much it hurts", s:.78,
   n:"One well-designed experiment with a large effect, and a laboratory stimulus.", src:"Moseley 2007"},
  {t:"A nervous system in pain for a long time can turn its own gain up", s:.72,
   n:"Well described in the laboratory; how much it explains any one person's pain is argued over.", src:"Woolf 2011"},
  {t:"Teaching people how pain works reduces their pain", s:.40,
   n:"12 trials. Small effect, and the confidence interval reaches no effect at all.", src:"Khan 2026"},
  {t:"A builder's nail went through his boot and he felt agony with no wound", s:.18,
   n:"One paragraph in a magazine column. No methods, no follow-up, retold everywhere.", src:"Fisher 1995"}
];

/* ── Rossettini, Carlino & Testa 2018 ─────────────────────────────────
 * A narrative review and a framework, not an effect size, and it must never be
 * cited as evidence that any of this has a measured size. What it is good for
 * is naming the things in a treatment room that are doing something, which is
 * the practitioner-facing half of everything above. Examples are the review's
 * categories, phrased plainly. */
const ROOM = [
  {k:"Who is in front of you", ex:"What they already believe, what happened last time, what they expect today, what they fear it means."},
  {k:"What you say and how", ex:"The words for the finding, the confidence in the voice, how long the appointment feels, whether they were listened to."},
  {k:"The treatment itself", ex:"What it looks like, what it costs, how elaborate it seems, whether it comes with a ritual."},
  {k:"The room and the setting", ex:"Quiet or noisy, private or open, warm or cold, the certificates on the wall."}
];
