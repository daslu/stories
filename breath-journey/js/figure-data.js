/* figure-data.js — the numbers the figures draw, and nothing else.
 *
 * Every number here came from the paper or its abstract, and the comment above
 * each block says which paper and what was checked, so a later reader can find
 * the source without leaving the file.
 */

/* ── Russo, Santarelli & O'Rourke 2017 ────────────────────────────────
 * "The typical respiratory rate in humans is within the range of 10–20 breaths
 * per min", and the review defines slow breathing as "any rate from 4 to 10
 * breaths per min". The two ranges overlap between 10 and 10, which is to say
 * they meet exactly at 10 — worth drawing rather than describing, because the
 * overlap is where most people assume there is a gap. */
const RATES = {
  ordinary: {lo: 10, hi: 20, n: "an ordinary resting rate"},
  slow:     {lo:  4, hi: 10, n: "what the literature calls slow breathing"},
  best:     6,                /* where maximum heart-rate variation is seen */
  min: 3, max: 24
};

/* ── the oxygen–haemoglobin dissociation curve ────────────────────────
 * Textbook physiology, drawn from the standard Hill-type description rather
 * than from any one study, which is why its entry in refs.bib is a pointer to
 * a reference description and not a paper.
 *
 * P50 — the oxygen pressure at which haemoglobin is half loaded — is about
 * 26.6 mmHg under normal conditions. Carbon dioxide and acidity move it: more
 * CO2 shifts the curve right, so haemoglobin lets go of oxygen more readily;
 * less CO2 shifts it left, so it holds on. That is the Bohr effect, and it is
 * the part of this that surprises people.
 *
 * The curve is drawn with the Hill equation, n = 2.7, which reproduces the
 * standard shape. It is a model of the shape, not measured data, and the
 * caption says so. */
const OXY = {
  p50: 26.6,        /* mmHg, normal conditions */
  hill: 2.7,
  arterial: 100,    /* roughly, arterial oxygen pressure breathing air */
  venous: 40,       /* roughly, oxygen pressure in resting tissue */
  /* how far P50 moves with CO2, in mmHg of P50 per direction. Drawn as a
     direction and a rough magnitude, not as a precise measured coefficient. */
  shift: 8
};

/* ── Stocchetti et al. 2005 ───────────────────────────────────────────
 * A review of deliberately induced hypocapnia in head injury: "Hyperventilation
 * lowers intracranial pressure by the induction of cerebral vasoconstriction
 * with a subsequent decrease in cerebral blood volume", and the danger is that
 * it "may decrease cerebral blood flow to ischemic levels."
 *
 * The setting is intensive care, not a breathing class, and the page says so.
 * What it establishes is the direction and that the effect is large enough to
 * be used as a treatment — not a dose-response curve for anybody breathing
 * quickly on a mat. The figure draws it as a direction only. */
const OVERBREATHE = [
  {id:"rate",  n:"breathing faster and deeper than the body is asking for", dir: 1},
  {id:"co2",   n:"carbon dioxide in the blood falls",                       dir:-1},
  {id:"vessel",n:"vessels in the brain narrow",                             dir:-1},
  {id:"flow",  n:"blood flow to the brain falls",                           dir:-1},
  {id:"felt",  n:"light-headed, tingling, unreal",                          dir: 1}
];

/* ── Lehrer & Gevirtz 2014 ────────────────────────────────────────────
 * "maximum heart rate oscillations at respiratory frequency occurred at
 * approximately 0.1 Hz (six breaths per minute)", refined to "about 0.09 Hz,
 * or 5.5 breaths per minute, with breath duration of about 11 s". At that rate
 * heart rate and blood pressure run "in a 180° phase relationship".
 *
 * The resonance curve below is a shape, not measured amplitudes: what is
 * established is where the peak sits and that it is a peak, so the figure
 * draws a peak at 5.5 and says in the caption that the height of the hill is
 * illustrative. */
/* The floor matters. A bare bell curve decays to zero, which would say heart
 * rate stops following the breath at an ordinary rate — and it does not; the
 * swing is simply smaller. What the sources establish is where the peak is,
 * not the shape, so the shape is drawn with a floor that keeps it honest and
 * the caption says the height of the hill is illustrative. */
const RESONANCE = {peak: 5.5, width: 4.5, floor: 0.28};

/* Respiratory sinus arrhythmia: "the heart pattern that occurs when heart rate
 * increases during inhalation and decreases during exhalation." The numbers on
 * the dial below are an illustrative resting heart rate swinging around 66;
 * the direction is the finding, the amplitude is drawn. */
const RSA = {mean: 66, swing: 9};

/* ── Vaschillo, Vaschillo & Lehrer 2006 ───────────────────────────────
 * 32 adults with asthma and 24 healthy adults. What predicted an individual's
 * resonant frequency and what did not — this is the whole finding as the
 * abstract states it, and it is reported as directions rather than
 * coefficients, so the figure shows directions and no numbers. */
const PREDICTS = [
  {n:"how tall they are",     rel:true,  note:"taller people resonate at a slower rate"},
  {n:"whether they are male", rel:true,  note:"men resonated slower than women"},
  {n:"how old they are",      rel:false, note:"no relationship found"},
  {n:"what they weigh",       rel:false, note:"no relationship found"},
  {n:"whether they have asthma", rel:false, note:"no relationship found"}
];

/* ── Fincham et al. 2023 ──────────────────────────────────────────────
 * Meta-analysis of breathwork, randomised controlled trials only.
 *
 * Stress is the primary outcome and the only one whose confidence interval the
 * abstract gives. Anxiety and depression are reported with an effect size and
 * a p value but no interval, so they are drawn as points with the interval
 * left off and the figure says why. Drawing a made-up interval would be worse
 * than drawing none. */
const BREATHWORK = [
  {id:"stress", n:"stress",            k:12, g:-0.35, lo:-0.55, hi:-0.14, i2:42},
  {id:"anx",    n:"anxiety",           k:20, g:-0.32, lo:null,  hi:null,  i2:null},
  {id:"dep",    n:"depressive symptoms", k:18, g:-0.40, lo:null, hi:null, i2:null}
];

/* ── the weight each source can carry ─────────────────────────────────
 * A judgement, not a measurement, and the caption says so. Its value is the
 * ordering. shared/tools/check.js fails if the descending order breaks or if
 * the weakest entry drifts above 0.4. */
const WEIGHTS = [
  {t:"Heart rate rises as you breathe in and falls as you breathe out", s:.92,
   n:"Directly observable, in anyone, with any heart rate monitor.", src:"Lehrer 2014 · Russo 2017"},
  {t:"Heart rate variation is largest at around six breaths a minute", s:.86,
   n:"Replicated across laboratories, and the mechanism has a good account.", src:"Lehrer 2014 · Russo 2017"},
  {t:"Breathing off too much carbon dioxide narrows blood vessels in the brain", s:.82,
   n:"Large and well established — but from intensive care, not from a breathing class.", src:"Stocchetti 2005"},
  {t:"The best rate differs from person to person, and height predicts it", s:.70,
   n:"56 people, one laboratory, reported as directions rather than numbers.", src:"Vaschillo 2006"},
  {t:"Breathwork reduces self-reported stress", s:.55,
   n:"12 trials and a small-to-medium effect, mostly at moderate risk of bias.", src:"Fincham 2023"},
  {t:"Slow breathing improves how efficiently the lungs are used", s:.48,
   n:"Consistent in small studies; the review calls for far more research.", src:"Russo 2017"},
  {t:"Breathing technique changes long-run health", s:.22,
   n:"The claim the field is sold on, and the one nobody has the trials for.", src:"no adequate source"}
];
