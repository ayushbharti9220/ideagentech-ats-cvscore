// Pure function (no pdf.js import) that turns positioned text items into reading-order lines.
export interface RawItem {
  str: string;
  x: number;
  y: number;
  w: number;
}

export function buildLines(pages: RawItem[][]): string[] {
  const out: string[] = [];

  for (const items of pages) {
    const sorted = items
      .filter(i => i.str.length > 0)
      .sort((a, b) => b.y - a.y || a.x - b.x);

    const rows: RawItem[][] = [];
    for (const it of sorted) {
      const row = rows[rows.length - 1];
      if (row && Math.abs(row[0].y - it.y) <= 3) row.push(it);
      else rows.push([it]);
    }

    for (const row of rows) {
      row.sort((a, b) => a.x - b.x);
      let line = '';
      let prevEnd: number | null = null;
      for (const it of row) {
        if (prevEnd !== null) {
          const gap = it.x - prevEnd;
          if (gap > 28) line += '\t';
          else if (gap > 1.2 && !/\s$/.test(line) && !/^\s/.test(it.str)) line += ' ';
        }
        line += it.str;
        prevEnd = it.x + it.w;
      }
      line = line.replace(/[ \u00a0]+/g, ' ').replace(/ *\t */g, '\t').trim();
      if (line) out.push(line);
    }
  }
  return out;
}
