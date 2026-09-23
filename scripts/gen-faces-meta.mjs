import fs from "node:fs";
import path from "node:path";

const ROOT = "public/faces";
const TAGS = ["man", "woman", "baby"];

const meta = {};
for (const tag of TAGS) {
  const dir = path.join(ROOT, tag);
  if (!fs.existsSync(dir)) {
    meta[tag] = [];
    continue;
  }
  meta[tag] = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort()
    .map((f) => `/faces/${tag}/${f}`);
}

fs.writeFileSync(path.join(ROOT, "meta.json"), JSON.stringify(meta, null, 2));
console.log("Generated meta.json");
for (const tag of TAGS) console.log(tag, meta[tag].length);