/* figures.js — what each figure is called, what it can be operated with, and
 * what it draws. The machinery is in ../shared/figure-kit.js; the drawings are
 * in scenes.js; this file is the join between them.
 *
 * Controls are declared, not wired. The kit renders them, keeps their labels
 * in step with their values and redraws — so a control cannot be added and
 * left unconnected, and a hint cannot go on saying "tap to take the hand away"
 * after the hand is already away. Both were real bugs on the touch story.
 */

Fig
  .add("burden", {
    controls: [
      {type:"toggle", key:"band", on:"showing the uncertainty", off:"just the headline numbers",
       hint:{on:"these are estimates, and this is how wide", off:"tidier, and more confident than the evidence is"}}
    ],
    draw: sceneBurden
  })

  .add("pipeline", {
    /* Two rows: the signal never changes, so nothing here can alter it — every
       control is about the situation the signal arrives in. */
    controls: [
      FACTORS.slice(0, 3).map(f => ({
        type:"toggle", key:`f.${f.id}`, on:f.n, off:f.off
      })),
      FACTORS.slice(3).map(f => ({
        type:"toggle", key:`f.${f.id}`, on:f.n, off:f.off
      }))
    ],
    draw: scenePipeline
  })

  .add("gate", {
    controls: [
      {type:"toggle", key:"rub", on:"a hand on the skin", off:"no hand on the skin",
       hint:{on:"tap to take the hand away", off:"tap to put the hand back"}}
    ],
    draw: sceneGate
  })

  .add("scans", {
    controls: [
      {type:"range", key:"age", label:"how old they are", min:20, max:80, step:1,
       aria:"Age of the pain-free people", fmt:v => `${v} years old`}
    ],
    draw: sceneScans
  })

  .add("cue", {
    controls: [
      {type:"pills", key:"cue", label:"the light they were shown",
       options:[{id:"blue", n:"blue — called cold"}, {id:"red", n:"red — called hot"}]}
    ],
    draw: sceneCue
  })

  .add("gain", {
    controls: [
      {type:"range", key:"gain", label:"how sensitised the system is", min:0, max:1, step:0.01,
       aria:"Degree of sensitisation",
       fmt:v => v < 0.08 ? "as it was" : v < 0.4 ? "a little" : v < 0.75 ? "a good deal" : "a great deal"}
    ],
    draw: sceneGain
  })

  .add("room", {
    controls: [
      {type:"pills", key:"room", options:ROOM.map(r => ({id:r.k, n:r.k}))}
    ],
    draw: sceneRoom
  })

  .add("pne",     {draw: scenePne})
  .add("weights", {draw: sceneWeights});

/* The pipeline's factors live in a nested object, so that the figure can ask
   "is this one on" without five separate keys cluttering the state. The kit
   writes to state[key] directly, so the keys it is given are dotted and read
   back through a small accessor the scene uses instead. */
const initialFactors = {};
FACTORS.forEach(f => { initialFactors[f.id] = false; });

Fig.start({
  band: true,
  rub: true,
  age: 40,
  cue: "blue",
  gain: 0.55,
  room: ROOM[0].k,
  f: initialFactors
});
