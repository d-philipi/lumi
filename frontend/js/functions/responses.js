/* ------------------------------------------------------------------
   responses.js — Lumi's little "brain".
   No backend / no libraries — just a friendly canned-response engine
   with keyword matching so the demo feels alive.
------------------------------------------------------------------ */

const RULES = [
  {
    test: /\b(hi|hello|hey|yo|greetings)\b/i,
    replies: [
      "Hey there! ✨ I'm Lumi. What's on your mind today?",
      "Hello! Lovely to see you. How can I help?",
    ],
  },
  {
    test: /\b(poem|haiku|verse|rhyme)\b/i,
    replies: [
      "Here's a little something:\n\nMorning light unfolds,\nspilling gold across the hills —\nthe day says hello.",
      "Soft sun on the sill,\na quiet cup of coffee,\nthe world breathes again.",
    ],
  },
  {
    test: /\b(rainbow|rainbows)\b/i,
    replies: [
      "Imagine sunlight is a box of crayons all stacked together as white light. When it passes through a raindrop, the drop acts like a tiny prism and bends each color a little differently — red bends least, violet bends most. Spread them out and you get a rainbow! 🌈",
    ],
  },
  {
    test: /\b(coffee|cafe|café|shop name)\b/i,
    replies: [
      "Here are three cozy coffee-shop names:\n\n1. Ember & Oat\n2. The Golden Hour\n3. Steam Theory ☕",
    ],
  },
  {
    test: /\b(weekend|mountain|trip|travel|plan)\b/i,
    replies: [
      "A relaxing mountain weekend:\n\n• Friday — arrive, light hike, warm dinner\n• Saturday — sunrise viewpoint, lazy brunch, an afternoon by the lake, stargazing at night\n• Sunday — slow morning, local market, scenic drive home 🏔️",
    ],
  },
  {
    test: /\b(thank|thanks|thx)\b/i,
    replies: ["Anytime! I'm glad I could help. 🌟", "You're very welcome!"],
  },
  {
    test: /\b(who are you|your name|what are you)\b/i,
    replies: [
      "I'm Lumi — a bright little companion built entirely with HTML, CSS and JavaScript. No frameworks, just good vibes. 🌼",
    ],
  },
  {
    test: /\?$/,
    replies: [
      "Great question! Here's how I'd think about it: break it into small pieces, tackle the clearest one first, and let the rest fall into place.",
      "Good one — the short answer is \"it depends\", but let's explore it together.",
    ],
  },
];

const FALLBACKS = [
  "Tell me a little more — I'd love to dig into that with you.",
  "Interesting! Here's a thought to get us started…",
  "I'm on it. Let's untangle this one piece at a time.",
  "Hmm, let me think out loud with you about that.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Returns a reply string for the given user text. */
export function getReply(text) {
  const t = (text || "").trim();
  for (const rule of RULES) {
    if (rule.test.test(t)) return pick(rule.replies);
  }
  return pick(FALLBACKS);
}

/** Build a short chat title from the first user message. */
export function makeTitle(text) {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > 32 ? clean.slice(0, 32).trimEnd() + "…" : clean || "New chat";
}
