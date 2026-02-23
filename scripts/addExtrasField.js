// scripts/addExtrasField.js
// Adds an "extras" object to each entry (non-destructive to existing fields).
// Output: data/vocab_with_extras.json

const fs = require("fs");
const path = require("path");

const inputPath = path.join("data", "vocab_with_audio.json");
const outputPath = path.join("data", "vocab_with_extras.json");

const json = JSON.parse(fs.readFileSync(inputPath, "utf8"));

json.entries = json.entries.map((e) => {
  if (e.extras) return e; // keep existing if already present

  return {
    ...e,
    extras: {
      ipa: null,
      example: {
        en: null,
        ja: null,
      },
      phrases: [], // array of { en, ja }
      notes: null,
    },
  };
});

fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), "utf8");
console.log("Wrote:", outputPath);
