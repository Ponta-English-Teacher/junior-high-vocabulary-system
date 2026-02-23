const fs = require("fs");

const src = "data/vocab.json";
const dst = "data/vocab_textbook.json";

const j = JSON.parse(fs.readFileSync(src, "utf8"));
const entries = Array.isArray(j.entries) ? j.entries.slice() : [];

function parsePageFirst(s) {
  // examples: "1年生 p.14", "2年生 p.12", "3年生 p.101"
  const str = String(s || "");
  const mGrade = str.match(/(\d+)\s*年生/);
  const mPage  = str.match(/p\.(\d+)/i);

  const grade = mGrade ? Number(mGrade[1]) : 99;
  const page  = mPage  ? Number(mPage[1])  : 99999;
  return { grade, page, raw: str };
}

entries.sort((a, b) => {
  const A = parsePageFirst(a.page_first);
  const B = parsePageFirst(b.page_first);

  if (A.grade !== B.grade) return A.grade - B.grade;
  if (A.page !== B.page) return A.page - B.page;

  // tie-breaker: keep stable-ish order
  const aid = Number(a.id) || 0;
  const bid = Number(b.id) || 0;
  return aid - bid;
});

const out = {
  meta: {
    ...(j.meta || {}),
    sort: "textbook(page_first: grade asc, page asc)"
  },
  entries
};

fs.writeFileSync(dst, JSON.stringify(out, null, 2), "utf8");
console.log("Wrote:", dst);
console.log("entries:", entries.length);
console.log("first:", entries[0]?.id, entries[0]?.page_first, entries[0]?.word);
console.log("last:", entries[entries.length - 1]?.id, entries[entries.length - 1]?.page_first, entries[entries.length - 1]?.word);
