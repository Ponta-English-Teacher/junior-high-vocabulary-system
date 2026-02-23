const fs = require("fs");
const path = require("path");

function normalize(word) {
  return word
    .toLowerCase()
    .replace(/～/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

const inputPath = path.join(__dirname, "../data/vocab.json");
const outputPath = path.join(__dirname, "../data/vocab_with_audio.json");

const raw = fs.readFileSync(inputPath, "utf8");
const data = JSON.parse(raw);

if (!data.entries || !Array.isArray(data.entries)) {
  console.error("Invalid JSON structure.");
  process.exit(1);
}

data.entries = data.entries.map(entry => {
  const baseName = normalize(entry.word);
  const filename = `${entry.id}_${baseName}.mp3`;
  return {
    ...entry,
    audio: filename
  };
});

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log("Audio field updated with unique filenames.");