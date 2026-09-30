export interface ParseResult { names: string[]; duplicates: number; empty: number }

// One participant per line. Duplicates are detected ignoring case, accents and extra spaces.
export function parseParticipants(text: string): ParseResult {
  const seen = new Set<string>();
  const names: string[] = [];
  let duplicates = 0, empty = 0;
  for (const raw of text.split(/\r?\n/)) {
    const name = raw.trim().replace(/\s+/g, " ");
    if (!name) { empty++; continue; }
    const key = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (seen.has(key)) { duplicates++; continue; }
    seen.add(key);
    names.push(name);
  }
  return { names, duplicates, empty };
}

// CSV -> plain list: first column of each row (supports quoted values).
export function csvToLines(csv: string): string {
  return csv.split(/\r?\n/).map((row) => {
    const t = row.trim();
    if (t.startsWith('"')) {
      const m = t.match(/^"((?:[^"]|"")*)"/);
      if (m) return m[1].replace(/""/g, '"');
    }
    return t.split(/[;,]/)[0];
  }).join("\n");
}
