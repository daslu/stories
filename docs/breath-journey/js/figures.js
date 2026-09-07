/* figures.js — what each figure is called, what it can be operated with, and
 * what it draws. Machinery in ../shared/figure-kit.js, drawings in scenes.js.
 * Controls are declared rather than wired: the kit renders them, keeps their
 * readouts in step with their values, and redraws. */

Fig
  .add("rates", {
    controls: [
      {type:"range", key:"rate", label:"breaths a minute", min:RATES.min, max:RATES.max, step:0.5,
       aria:"Breathing rate", fmt:v => `${v} a minute`}
    ],
    draw: sceneRates
  })

  .add("oxygen", {
    controls: [
      {type:"range", key:"co2", label:"carbon dioxide in the blood", min:-1, max:1, step:0.02,
       aria:"How much carbon dioxide is in the blood",
       fmt:v => v < -0.4 ? "blown right off" : v < -0.08 ? "low"
              : v <= 0.08 ? "normal" : v < 0.4 ? "building up" : "high, as in hard work"}
    ],
    draw: sceneOxygen
  })

  .add("over", {
    controls: [
      {type:"toggle", key:"over", on:"breathing hard, well past what is needed", off:"breathing as the body asks",
       hint:{on:"tap to stop", off:"tap to over-breathe and follow the chain"}}
    ],
    draw: sceneOver
  })

  .add("rsa", {
    controls: [
      {type:"range", key:"phase", label:"where you are in the breath", min:0, max:1, step:0.01,
       aria:"Position within one breath",
       fmt:v => v < 0.5 ? "breathing in" : "breathing out"}
    ],
    draw: sceneRsa
  })

  .add("resonance", {
    controls: [
      {type:"range", key:"rate2", label:"breaths a minute", min:RATES.min, max:RATES.max, step:0.1,
       aria:"Breathing rate", fmt:v => `${v.toFixed(1)} a minute · ${(60 / v).toFixed(1)}s a breath`}
    ],
    draw: sceneResonance
  })

  .add("predicts", {draw: scenePredicts})
  .add("evidence", {draw: sceneEvidence})
  .add("weights",  {draw: sceneWeights});

Fig.start({
  rate: 14,        /* an ordinary resting rate, so the reader starts where they are */
  co2: 0,
  over: false,
  phase: 0.25,     /* mid in-breath, where the rise is clearest */
  rate2: 14        /* start off the peak, so finding it is the reader's move */
});
