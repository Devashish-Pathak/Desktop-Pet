// A curated list of common, short English words — good general-purpose
// typing-practice material, no punctuation/capitals (matches the default
// "plain" mode most typing tests start with).
export const WORD_LIST = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for',
  'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
  'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
  'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
  'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like',
  'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year',
  'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
  'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
  'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'water', 'house', 'world', 'life', 'hand', 'part', 'child', 'eye', 'woman',
  'place', 'week', 'case', 'point', 'government', 'company', 'number',
  'group', 'problem', 'fact', 'money', 'story', 'right', 'study', 'book',
  'word', 'business', 'issue', 'side', 'kind', 'head', 'house', 'service',
  'friend', 'father', 'power', 'hour', 'game', 'line', 'end', 'member',
  'law', 'car', 'city', 'community', 'name', 'president', 'team', 'minute',
  'idea', 'body', 'information', 'nothing', 'ago', 'right', 'lead', 'social',
  'understand', 'whether', 'later', 'without', 'often', 'together', 'run',
  'quick', 'brown', 'fox', 'jump', 'lazy', 'dog', 'keyboard', 'window',
  'garden', 'river', 'mountain', 'forest', 'ocean', 'desert', 'island',
  'bridge', 'castle', 'engine', 'rocket', 'planet', 'orange', 'purple',
  'yellow', 'silver', 'golden', 'bright', 'quiet', 'gentle', 'strong',
  'simple', 'happy', 'small', 'large', 'early', 'ready', 'clear', 'clean',
  'fresh', 'sharp', 'smooth', 'sweet', 'sour', 'warm', 'cold', 'light',
  'heavy', 'fast', 'slow', 'high', 'low', 'wide', 'narrow', 'deep', 'shallow',
  'apple', 'bread', 'coffee', 'dinner', 'butter', 'cheese', 'pepper', 'sugar',
  'flower', 'stone', 'metal', 'paper', 'glass', 'wood', 'cloth', 'thread',
  'music', 'paint', 'dance', 'dream', 'voice', 'smile', 'laugh', 'trust',
  'peace', 'value', 'skill', 'craft', 'field', 'chair', 'table', 'plate',
  'spoon', 'knife', 'clock', 'phone', 'light', 'shirt', 'shoes', 'jacket',
];

export function pickWords(count, pool = WORD_LIST) {
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return words;
}
