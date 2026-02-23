const fs = require("fs");

const j = JSON.parse(fs.readFileSync("data/vocab.json","utf8"));

let total = j.entries.length;
let withExample = 0;
let withoutExample = 0;

for (const e of j.entries) {
  const en = e.extras && e.extras.example && e.extras.example.en;
  if (en && String(en).trim()) withExample++;
  else withoutExample++;
}

console.log("total_entries=", total);
console.log("with_example=", withExample);
console.log("without_example=", withoutExample);
