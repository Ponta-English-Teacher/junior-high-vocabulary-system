const fs = require("fs");

const dataPath = "data/vocab.json";
const j = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const allow = new Set();

// Add all headwords to allowed set (normalized)
for (const e of j.entries) {
  if (e.word) allow.add(norm(e.word));
}

// A small whitelist of very common function words (junior-high safe)
const whitelist = [
  "the","a","an","to","of","in","on","at","for","with","from","by","as",
  "and","or","but","so","because","if","when","while","before","after",
  "this","that","these","those","it","its","i","you","he","she","we","they",
  "me","him","her","us","them","my","your","his","our","their","mine","yours","hers","ours","theirs",
  "is","am","are","was","were","be","been","being",
  "do","does","did","done","doing",
  "have","has","had","having",
  "will","would","can","could","may","might","must","should",
  "not","no","yes",
  "there","here","then","now","today","tomorrow","yesterday",
  "very","really","just","also","too","only","even",
  "more","most","less","least",
  "one","two","three","four","five","six","seven","eight","nine","ten",
  "something","someone","somebody","anything","anyone","anybody","nothing","nobody",
  "what","who","which","where","why","how",
  "please","thanks","thank"
];
for (const w of whitelist) allow.add(w);

// Normalization helpers
function norm(s){
  return String(s)
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/～/g, "")
    .replace(/\(.*?\)/g, "")
    .trim();
}

// Tokenizer: keeps words and apostrophes
function tokens(sentence){
  const s = String(sentence)
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return [];
  return s.split(" ").flatMap(t => t.split("-")).filter(Boolean);
}

// Very small lemmatization to reduce false flags
function variants(t){
  const out = new Set([t]);

  // common contractions handling
  if (t.endsWith("n't")) out.add(t.slice(0, -3));
  if (t.endsWith("'s")) out.add(t.slice(0, -2));
  if (t.endsWith("'re")) out.add(t.slice(0, -3));
  if (t.endsWith("'ve")) out.add(t.slice(0, -3));
  if (t.endsWith("'ll")) out.add(t.slice(0, -3));
  if (t.endsWith("'d")) out.add(t.slice(0, -2));

  // plural/3rd person
  if (t.endsWith("s") && t.length > 3) out.add(t.slice(0, -1));
  if (t.endsWith("es") && t.length > 4) out.add(t.slice(0, -2));
  if (t.endsWith("ies") && t.length > 4) out.add(t.slice(0, -3) + "y");

  // -ed / -ing
  if (t.endsWith("ed") && t.length > 4) out.add(t.slice(0, -2));
  if (t.endsWith("ing") && t.length > 5) out.add(t.slice(0, -3));
  if (t.endsWith("ing") && t.length > 6) out.add(t.slice(0, -3) + "e");

  return [...out];
}

let missing = 0;
let checked = 0;

for (const e of j.entries) {
  const ex = e.extras && e.extras.example;
  if (!ex || !ex.en) continue;

  checked++;
  const bad = [];
  for (const t of tokens(ex.en)) {
    const ok = variants(t).some(v => allow.has(v));
    if (!ok) bad.push(t);
  }
  if (bad.length) {
    missing++;
    console.log(`ID ${e.id} | word="${e.word}"`);
    console.log(`  example: ${ex.en}`);
    console.log(`  OUTSIDE: ${[...new Set(bad)].join(", ")}`);
  }
}

console.log("----");
console.log("examples_checked=", checked);
console.log("entries_with_outside_words=", missing);
