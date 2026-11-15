export const BULLET = /^\s*[•●▪▫◦■□‣⁃∙·*►▶➢✓✔\u2022\uF0B7\uF0A7\uF076\uF0D8-]\s+|^\s*[•●▪▫◦■□‣⁃∙·►▶➢✓✔\u2022\uF0B7\uF0A7\uF076\uF0D8]\s*|^\s*[–—]\s+/;

const MONTH =
  '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const POINT = `(?:${MONTH}\\.?,?\\s+(?:19|20)\\d{2}|\\d{1,2}\\/(?:19|20)\\d{2}|(?:19|20)\\d{2})`;
const OPEN_END = '(?:present|current|now|ongoing|till date|to date|date)';
const RANGE = `${POINT}\\s*(?:-|–|—|to)\\s*(?:${POINT}|${OPEN_END})`;

export const RANGE_RE = new RegExp(RANGE, 'i');
const RANGE_FULL = new RegExp(`^\\(?${RANGE}\\)?$`, 'i');
const POINT_FULL = new RegExp(`^\\(?${POINT}\\)?$`, 'i');
const TRAILING_POINT = new RegExp(`(?:^|[\\s,|(])(${POINT})\\)?\\s*$`, 'i');

export const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
export const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?)\d{3,4}[\s.-]?\d{3,4}/;
export const URL_RE = /(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com|gitlab\.com|behance\.net|dribbble\.com|medium\.com|[a-z0-9-]+\.(?:com|io|dev|me|app|net|org|in)\b)[^\s|,]*/i;

function capWords(s: string): string {
  return s.replace(/[A-Za-z]+/g, w => (w.toLowerCase() === 'present' ? 'Present' : w[0].toUpperCase() + w.slice(1).toLowerCase()));
}

export function normalizeDate(d: string): string {
  let s = d.replace(/^\(|\)$/g, '').trim();
  s = s.replace(/\b(present|current|now|ongoing|till date|to date)\b/gi, 'Present');
  s = s.replace(/\s*(?:-|–|—|\bto\b)\s*/gi, ' – ');
  s = s.replace(/\s+/g, ' ');
  return capWords(s);
}

function cleanEdges(s: string): string {
  return s
    .replace(/\(\s*\)/g, '')
    .replace(/^[\s,|–—-]+/, '')
    .replace(/[\s,|–—-]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function splitDate(line: string): { text: string; date?: string } {
  let l = line;
  if (l.includes('\t')) {
    const parts = l.split('\t').map(s => s.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (parts.length > 1 && (RANGE_FULL.test(last) || POINT_FULL.test(last))) {
      return { text: cleanEdges(parts.slice(0, -1).join(' | ')), date: normalizeDate(last) };
    }
    l = parts.join(' | ');
  }

  if (l.length <= 140) {
    const m = l.match(RANGE_RE);
    if (m && m.index !== undefined) {
      const rest = l.slice(0, m.index) + ' ' + l.slice(m.index + m[0].length);
      return { text: cleanEdges(rest), date: normalizeDate(m[0]) };
    }
  }
  if (l.length <= 90) {
    const t = l.match(TRAILING_POINT);
    if (t && t.index !== undefined) {
      const rest = l.slice(0, t.index + (t[0].length - t[1].length - (t[0].endsWith(')') ? 1 : 0)));
      return { text: cleanEdges(rest), date: normalizeDate(t[1]) };
    }
  }
  return { text: cleanEdges(l) };
}

export function titleCase(s: string): string {
  return s.toLowerCase().replace(/(^|[\s'-])([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase());
}

export function isAllCaps(s: string): boolean {
  const letters = s.replace(/[^A-Za-z]/g, '');
  return letters.length >= 3 && letters === letters.toUpperCase();
}
