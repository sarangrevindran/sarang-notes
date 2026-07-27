// Reads every notes/*.md file, pulls out its frontmatter, and writes

// a single index.json at the repo root. No external dependencies,

// so this runs with plain `node scripts/generate-index.mjs`.

import { readdirSync, readFileSync, writeFileSync } from "fs";

import { join } from "path";

const NOTES_DIR = "notes";

const OUTPUT_FILE = "index.json";

function parseFrontmatter(raw) {

  const match = raw.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {

    throw new Error("Missing frontmatter block");

  }

  const block = match[1];

  const data = {};

  for (const line of block.split("\n")) {

    if (!line.trim()) continue;

    const idx = line.indexOf(":");

    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();

    let value = line.slice(idx + 1).trim();

    if (

      (value.startsWith('"') && value.endsWith('"')) ||

      (value.startsWith("'") && value.endsWith("'"))

    ) {

      value = value.slice(1, -1);

    }

    data[key] = value;

  }

  return data;

}

function main() {

  const files = readdirSync(NOTES_DIR).filter((f) => f.endsWith(".md"));

  const entries = files.map((filename) => {

    const slug = filename.replace(/\.md$/, "");

    const raw = readFileSync(join(NOTES_DIR, filename), "utf-8");

    const frontmatter = parseFrontmatter(raw);

    if (!frontmatter.title || !frontmatter.date) {

      throw new Error(`Note "${filename}" is missing required "title" or "date" frontmatter`);

    }

    return {

      slug,

      title: frontmatter.title,

      date: frontmatter.date,

      excerpt: frontmatter.excerpt || "",

    };

  });

  entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2) + "\n");

  console.log(`Wrote ${entries.length} note(s) to ${OUTPUT_FILE}`);

}

main();
