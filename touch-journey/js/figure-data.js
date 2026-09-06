/* figure-data.js — the data the figures draw, and nothing else.
 *
 * The dividing line after the Quarto conversion: if it is inside a figure it
 * lives here, if it is read as text it lives in the .qmd. So the prose, the
 * references and the closing rules are all markdown now; these two arrays are
 * not, because they are drawn rather than read.
 *
 * CLAIMS is consumed by sceneClaims() in scenes.js, REVISIONS by the flip
 * cards in figures.js. Load this before both. */

/* Evidence strength, hand-placed on a 0–1 scale.
 *
 * These are judgements about how much weight a practitioner should give each
 * claim, not effect sizes, and the caption says so. The value of the figure is
 * the gradient — physical claims strong, hormone claims weak. tools/check.js
 * fails if the descending order breaks or the weakest claim drifts above 0.4,
 * because inflating the oxytocin line would destroy the only thing the figure
 * is for. */
const CLAIMS = [
 {t:"Skin-to-skin contact reduces newborn pain and distress", s:.93,
  n:"Repeatedly demonstrated during heel-prick procedures, and now part of routine care."},
 {t:"Touch can reduce pain", s:.86,
  n:"Gate control plus a large modern literature. The size of the effect varies a lot."},
 {t:"Who is touching you changes how much it helps", s:.80,
  n:"A partner's hand beats a stranger's, and the effect scales with relationship quality."},
 {t:"Slow, warm, moving touch on hairy skin is rated most pleasant", s:.78,
  n:"Robust as a group average. Individuals vary more than the curve suggests."},
 {t:"Touch reduces self-reported stress and anxiety", s:.72,
  n:"Consistent, but how people say they feel is the easiest thing in science to shift."},
 {t:"Massage produces lasting reductions in cortisol", s:.34,
  n:"Widely repeated in training. Meta-analysis has found the effect far smaller than claimed."},
 {t:"Interpersonal touch measurably raises oxytocin in blood", s:.26,
  n:"The most confidently stated and least secure claim in the field. Measurement is genuinely hard."}
];

/* The four flip cards. Front is what the field used to say, back is what it
 * says now. Not a chart, because the content is a before/after and cards are
 * the honest shape for that. */
const REVISIONS = [
 {old:"CT fibres are found only in hairy skin. There are none in the palm.",
  neu:"A few of them have now been found in the hairless skin of the palm and fingers too. Fewer, not none — and pleasant touch is processed differently there rather than being absent.",
  src:"Watkins et al. 2021"},
 {old:"Pleasant touch means slow stroking. That is what this system answers to.",
  neu:"Sustained, firmer contact is pleasant too. In one study static touch was preferred over stroking at the wrong speed — though optimal-speed stroking still won overall.",
  src:"Case et al. 2021 · Ali et al. 2023"},
 {old:"The tuning curve is the human response to touch speed.",
  neu:"It is a group average. Individuals vary considerably, and how quickly people get used to repeated touch differs person to person. The hill is real; your client's hill may sit elsewhere.",
  src:"Bendas et al. 2021 · Crucianelli et al. 2022"},
 {old:"“Affective touch” and “CT afferents” describe the same thing.",
  neu:"They have been used interchangeably without warrant. Only about a third of affective-touch papers mention these fibres at all. One is a nerve; the other is an experience.",
  src:"Schirmer, Croy & Ackerley 2023"}
];

/* Gazzola et al. 2012, verified from the full text. Eighteen heterosexual
 * white men, mean age 26.2. Every caress was delivered by the same woman,
 * blind to which video was playing, so the contact at the skin was constant
 * and only the belief about its source changed. Ratings on a −5 to +5 scale,
 * mean ± SD.
 *
 * Unlike CLAIMS above, these are measured numbers, and the figure has to say
 * which half of it is measured and which half is illustrative — the verdict
 * words in sceneContext are still nobody's data.
 *
 * The confound travels with the data on purpose. The woman in the video also
 * behaved warmly and the man distantly, which the authors say themselves, so
 * belief about sex, attractiveness and manner cannot be pulled apart. A figure
 * that drops that is using the tidy version of the study. */
const BELIEF = [
 {id:"woman", n:"a woman", m:  3.05, sd:0.87},
 {id:"man",   n:"a man",   m: -2.53, sd:1.38}
];
