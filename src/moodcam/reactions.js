// Pure expression -> reaction mapping. No camera/DOM/face-api.js dependency
// here at all, so it's directly unit-testable. face-api.js's expression
// classifier returns a softmax distribution over these 7 categories.
const CONFIDENCE_THRESHOLD = 0.5;

const REACTIONS = {
  happy: {
    phrases: ['you look happy! that makes me happy too~', 'nice smile!'],
    moodDelta: 6,
  },
  sad: {
    phrases: ["you seem a little down... want to pet me?", 'aw, cheer up a bit?'],
    moodDelta: -2,
  },
  angry: {
    phrases: ['whoa, take a breath...', 'everything okay? you look tense.'],
    moodDelta: -2,
  },
  fearful: {
    phrases: ["hey, it's okay.", 'you seem worried...'],
    moodDelta: -1,
  },
  disgusted: {
    phrases: ['ew, what happened?'],
    moodDelta: 0,
  },
  surprised: {
    phrases: ['oh! something surprising?'],
    moodDelta: 1,
  },
  // neutral intentionally has no entry — no reaction, avoids constant chatter
};

function dominantExpression(expressions) {
  if (!expressions || typeof expressions !== 'object') return null;
  let best = null;
  let bestScore = -Infinity;
  for (const [name, score] of Object.entries(expressions)) {
    if (typeof score === 'number' && score > bestScore) {
      bestScore = score;
      best = name;
    }
  }
  return best ? { name: best, confidence: bestScore } : null;
}

// Takes face-api.js's raw expressions object plus whatever expression we
// reacted to (or last tracked) last time, and returns:
//   - reaction: null, or { expression, confidence, phrase, moodDelta }
//   - nextExpression: what the caller should pass in as `previousExpression`
//     on the next call
// A reaction only fires for a NEW (changed from last time), non-neutral,
// above-confidence-threshold expression — so a sustained expression reacts
// once, not every single check, but a genuine change (including a trip
// through neutral) can react again.
export function evaluateExpression(expressions, previousExpression = null) {
  const dominant = dominantExpression(expressions);
  if (!dominant || dominant.confidence < CONFIDENCE_THRESHOLD) {
    return { reaction: null, nextExpression: previousExpression };
  }

  const nextExpression = dominant.name;
  if (dominant.name === 'neutral' || dominant.name === previousExpression) {
    return { reaction: null, nextExpression };
  }

  const config = REACTIONS[dominant.name];
  if (!config) return { reaction: null, nextExpression };

  const phrase = config.phrases[Math.floor(Math.random() * config.phrases.length)];
  return {
    reaction: { expression: dominant.name, confidence: dominant.confidence, phrase, moodDelta: config.moodDelta },
    nextExpression,
  };
}
