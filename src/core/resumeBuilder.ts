import { Entry, ExtraSection, ResumeData, SkillGroup } from '../types/resume';
import { BULLET, EMAIL_RE, URL_RE, isAllCaps, splitDate, titleCase } from './patterns';
import { polishBullet, polishSummary } from './bulletPolisher';
import { canonicalizeSkill, extractJdKeywords, termInText } from './keywords';

type SectionKey = 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications' | 'extra';

const SECTION_ALIASES: Record<string, SectionKey> = {
  summary: 'summary', 'professional summary': 'summary', 'career summary': 'summary', 'executive summary': 'summary',
  profile: 'summary', 'professional profile': 'summary', about: 'summary', 'about me': 'summary',
  objective: 'summary', 'career objective': 'summary',
  skills: 'skills', 'technical skills': 'skills', 'core competencies': 'skills', competencies: 'skills',
  technologies: 'skills', 'tech stack': 'skills', 'key skills': 'skills', 'skills & tools': 'skills',
  'tools & technologies': 'skills', 'areas of expertise': 'skills', expertise: 'skills', 'skills and tools': 'skills',
  'technical proficiencies': 'skills', 'technical expertise': 'skills',
  experience: 'experience', 'work experience': 'experience', 'professional experience': 'experience',
  employment: 'experience', 'employment history': 'experience', 'work history': 'experience',
  'career history': 'experience', internship: 'experience', internships: 'experience',
  'internship experience': 'experience', 'relevant experience': 'experience',
  projects: 'projects', 'personal projects': 'projects', 'academic projects': 'projects',
  'key projects': 'projects', 'selected projects': 'projects', 'side projects': 'projects',
  education: 'education', 'academic background': 'education', 'academic qualifications': 'education',
  qualifications: 'education', 'education & training': 'education', academics: 'education',
  'education and training': 'education',
  certifications: 'certifications', certificates: 'certifications', certification: 'certifications',
  licenses: 'certifications', 'licenses & certifications': 'certifications', courses: 'certifications',
  training: 'certifications', 'courses & certifications': 'certifications',
  achievements: 'extra', awards: 'extra', honors: 'extra', accomplishments: 'extra', languages: 'extra',
  interests: 'extra', volunteer: 'extra', volunteering: 'extra', publications: 'extra',
  extracurricular: 'extra', activities: 'extra', hobbies: 'extra', 'awards & achievements': 'extra',
  'extracurricular activities': 'extra', 'volunteer experience': 'extra', leadership: 'extra'
};

const ROLE_WORDS = /(engineer|developer|analyst|manager|designer|scientist|consultant|intern|architect|specialist|lead|director|officer|administrator|programmer|tester|associate|executive|coordinator|writer|marketer)/i;
const INST = /\b(university|college|institute|school|academy|polytechnic|iit|nit)\b/i;
const DEG = /\b(b\.?\s?tech|m\.?\s?tech|b\.?\s?e\b|m\.?\s?e\b|b\.?\s?sc|m\.?\s?sc|b\.?\s?a\b|m\.?\s?a\b|b\.?\s?s\b|m\.?\s?s\b|bca|mca|bachelor|master|mba|ph\.?d|doctorate|diploma|associate|high school|secondary|intermediate|class\s+(?:x|xii|10|12))/i;

function normalizeHeader(line: string): string {
  return line
    .toLowerCase()
    .replace(/[^a-z&\s]/g, ' ')
    .replace(/\band\b/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectSection(line: string): { key: SectionKey; title: string } | null {
  if (line.length > 40 || line.includes('\t') || /\d/.test(line)) return null;
  const norm = normalizeHeader(line);
  const key = SECTION_ALIASES[norm] ?? SECTION_ALIASES[norm.replace(/&/g, 'and')];
  if (key) return { key, title: titleCase(line.replace(/[:\-–—_]+$/g, '').trim()) };
  return null;
}

function isHeaderish(text: string): boolean {
  return text.length > 0 && text.length <= 90 && !/[.!?]$/.test(text) && /^[A-Z0-9(]/.test(text);
}

function splitTopLevel(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (depth === 0 && /[,;|•·●▪\t]/.test(ch)) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map(x => x.trim()).filter(Boolean);
}

// ---------- header (name / contacts) ----------

function parseHeader(zone: string[], allText: string) {
  let name = '';
  const contacts: { rank: number; text: string }[] = [];
  let headline = '';
  const summaryBits: string[] = [];

  const nameIdx = zone.findIndex(l => {
    const first = l.split('\t')[0].trim();
    return first.length > 1 && first.length < 45 && !/[@\d]/.test(first) && first.split(/\s+/).length <= 5;
  });
  if (nameIdx >= 0) name = zone[nameIdx].split('\t')[0].trim();
  else if (zone[0]) name = zone[0].split('\t')[0].trim();
  if (isAllCaps(name)) name = titleCase(name);

  const addContact = (rank: number, text: string) => {
    const key = text.toLowerCase();
    if (!contacts.some(c => c.text.toLowerCase() === key)) contacts.push({ rank, text });
  };

  zone.forEach((line, idx) => {
    if (idx === nameIdx) return;
    const segments = line.replace(/\t/g, '|').split(/\s*[|•·●▪]\s*/).map(x => x.trim()).filter(Boolean);
    const unclassified: string[] = [];
    for (const seg of segments) {
      const s = seg.replace(/^(?:email|e-mail|phone|mobile|tel|contact|linkedin|github|portfolio|website|location|address)\s*[:\-]\s*/i, '').trim();
      if (!s) continue;
      if (EMAIL_RE.test(s)) addContact(2, s.match(EMAIL_RE)![0]);
      else if (/linkedin\.com/i.test(s)) addContact(3, s.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, ''));
      else if (/github\.com|gitlab\.com/i.test(s)) addContact(4, s.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, ''));
      else if (URL_RE.test(s) && !/\s/.test(s)) addContact(5, s.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, ''));
      else if (/^[+()\d\s.-]+$/.test(s) && s.replace(/\D/g, '').length >= 9 && s.replace(/\D/g, '').length <= 15) addContact(1, s);
      else unclassified.push(s);
    }
    for (const u of unclassified) {
      if (u.length > 90) summaryBits.push(u);
      else if (/^[A-Za-z .'-]+,\s*[A-Za-z .'-]+(?:,\s*[A-Za-z .'-]+)?$/.test(u) && u.length < 45 && !ROLE_WORDS.test(u)) addContact(0, u);
      else if (!headline && !/\d/.test(u) && u.length < 80) headline = u;
    }
  });

  // Fall back to scanning the entire document for key contact details.
  const email = allText.match(EMAIL_RE)?.[0];
  if (email) addContact(2, email);
  const li = allText.match(/linkedin\.com\/in\/[A-Za-z0-9_%-]+/i)?.[0];
  if (li) addContact(3, li);
  const gh = allText.match(/github\.com\/[A-Za-z0-9_-]+/i)?.[0];
  if (gh) addContact(4, gh);

  // Drop duplicates where a longer variant of the same handle exists
  const sorted = contacts.sort((a, b) => a.rank - b.rank).map(c => c.text);
  const deduped = sorted.filter(
    (t, i) => !sorted.some((o, j) => j !== i && o.length > t.length && o.toLowerCase().includes(t.toLowerCase()))
  );

  if (isAllCaps(headline)) headline = titleCase(headline);
  return { name: name || 'Your Name', contacts: deduped, headline, summaryBits };
}

// ---------- entries ----------

function blank(): Entry {
  return { title: '', bullets: [] };
}

function parseEntries(lines: string[]): Entry[] {
  const entries: Entry[] = [];
  let cur: Entry | null = null;
  const flush = () => {
    if (cur && (cur.title || cur.bullets.length)) entries.push(cur);
    cur = null;
  };

  for (const raw of lines) {
    const isBullet = BULLET.test(raw);
    const line = raw.replace(BULLET, '').replace(/\t/g, ' | ').trim();
    if (!line) continue;

    if (isBullet) {
      if (!cur) cur = blank();
      cur.bullets.push(line);
      continue;
    }

    const { text, date } = splitDate(raw.replace(BULLET, '').trim());

    if (date) {
      if (cur && !cur.date && cur.bullets.length === 0 && cur.title) {
        cur.date = date;
        if (text) cur.subtitle = cur.subtitle ? `${cur.subtitle} | ${text}` : text;
      } else {
        flush();
        cur = blank();
        cur.title = text;
        cur.date = date;
      }
      continue;
    }

    if (!cur) {
      cur = blank();
      cur.title = text;
      continue;
    }

    if (cur.bullets.length === 0) {
      if (!cur.title) cur.title = text;
      else if (!cur.subtitle && isHeaderish(text)) cur.subtitle = text;
      else cur.bullets.push(text);
      continue;
    }

    const last = cur.bullets[cur.bullets.length - 1];
    const wrapped = /^[a-z]/.test(text) || (last.length >= 60 && !/[.!?:;]$/.test(last));
    if (wrapped) {
      cur.bullets[cur.bullets.length - 1] = `${last} ${text}`;
    } else if (isHeaderish(text) && text.length <= 80) {
      flush();
      cur = blank();
      cur.title = text;
    } else {
      cur.bullets.push(text);
    }
  }
  flush();
  return entries.map(e => ({ ...e, bullets: e.bullets.map(polishBullet).filter(Boolean) }));
}

function parseEducation(lines: string[]): Entry[] {
  const entries: (Entry & { hasInst: boolean; hasDeg: boolean })[] = [];
  let cur: (Entry & { hasInst: boolean; hasDeg: boolean }) | null = null;
  const fresh = () => ({ title: '', bullets: [] as string[], hasInst: false, hasDeg: false });

  for (const raw of lines) {
    const isBullet = BULLET.test(raw);
    const cleaned = raw.replace(BULLET, '').trim();
    if (!cleaned) continue;
    if (isBullet) {
      if (!cur) { cur = fresh(); entries.push(cur); }
      cur.bullets.push(cleaned.replace(/\t/g, ' '));
      continue;
    }
    const { text, date } = splitDate(cleaned);
    const isInst = INST.test(text);
    const isDeg = DEG.test(text);
    const startsNew = !cur || (isInst && cur.hasInst) || (isDeg && cur.hasDeg);
    if (startsNew) {
      cur = fresh();
      entries.push(cur);
    }
    const c = cur!;
    if (date && !c.date) c.date = date;
    if (text) {
      if (!c.title) c.title = text;
      else if (!c.subtitle && text.length <= 90) c.subtitle = text;
      else c.bullets.push(text);
    }
    c.hasInst = c.hasInst || isInst;
    c.hasDeg = c.hasDeg || isDeg;
  }
  return entries
    .filter(e => e.title || e.bullets.length)
    .map(({ hasInst, hasDeg, ...e }) => ({ ...e, bullets: e.bullets.map(b => b.replace(/\s+/g, ' ').trim()) }));
}

// ---------- skills ----------

function parseSkills(lines: string[]): SkillGroup[] {
  const groups: SkillGroup[] = [];
  const seen = new Set<string>();

  const addItems = (group: SkillGroup, text: string) => {
    for (const piece of splitTopLevel(text)) {
      const item = canonicalizeSkill(piece.replace(BULLET, '').replace(/^and\s+/i, ''));
      const key = item.toLowerCase();
      if (!item || item.length < 2 || item.length > 45 || item.split(/\s+/).length > 6 || seen.has(key)) continue;
      seen.add(key);
      group.items.push(item);
    }
  };

  for (const raw of lines) {
    const line = raw.replace(BULLET, '').replace(/\t/g, ', ').trim();
    if (!line) continue;
    const lab = line.match(/^([A-Za-z][A-Za-z0-9 &/+#.()-]{1,38}?):\s*(.*)$/);
    if (lab) {
      const g: SkillGroup = { label: lab[1].trim(), items: [] };
      groups.push(g);
      addItems(g, lab[2]);
    } else {
      let g = groups[groups.length - 1];
      if (!g) {
        g = { items: [] };
        groups.push(g);
      }
      addItems(g, line);
    }
  }
  return groups.filter(g => g.items.length > 0);
}

// ---------- main ----------

export function buildResume(rawLines: string[], jdText = ''): ResumeData {
  const lines = rawLines
    .map(l => l.replace(/\u00a0/g, ' ').trim())
    .filter(l => l && !/^(?:page\s*)?\d+(?:\s*(?:of|\/)\s*\d+)?$/i.test(l));

  const allText = lines.join('\n');

  // Split into header zone and sections
  const sections: Record<SectionKey, string[]> = {
    summary: [], skills: [], experience: [], projects: [], education: [], certifications: [], extra: []
  };
  const extras: { title: string; lines: string[] }[] = [];
  const headerZone: string[] = [];

  let current: SectionKey | null = null;
  let currentExtra: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    const det = detectSection(line);
    if (det) {
      current = det.key;
      if (det.key === 'extra') {
        currentExtra = { title: det.title, lines: [] };
        extras.push(currentExtra);
      } else currentExtra = null;
      continue;
    }
    if (
      current &&
      current !== 'experience' && current !== 'projects' && current !== 'education' &&
      isAllCaps(line) && line.length <= 30 && line.split(/\s+/).length <= 4 && !/[@|\d]/.test(line) && !line.includes('\t')
    ) {
      current = 'extra';
      currentExtra = { title: titleCase(line), lines: [] };
      extras.push(currentExtra);
      continue;
    }
    if (!current) headerZone.push(line);
    else if (current === 'extra' && currentExtra) currentExtra.lines.push(line);
    else sections[current].push(line);
  }

  const hdr = parseHeader(headerZone, allText);

  // Nothing recognisable? keep everything instead of dropping content.
  const recognised = Object.entries(sections).some(([k, v]) => k !== 'extra' && v.length > 0);
  if (!recognised && extras.length === 0) {
    const rest = headerZone.filter(l => l.split('\t')[0].trim() !== hdr.name);
    extras.push({ title: 'Resume Content', lines: rest });
  }

  // Skills
  let skills = parseSkills(sections.skills);

  // Experience / projects / education
  const experience = parseEntries(sections.experience);
  const projects = parseEntries(sections.projects);
  const education = parseEducation(sections.education);

  // JD-aware ordering using ONLY skills the candidate already has
  const jdKws = extractJdKeywords(jdText);
  const jdLower = new Set(jdKws.map(k => k.toLowerCase()));
  const resumeLower = allText.toLowerCase();
  const presentJd = jdKws.filter(k => termInText(resumeLower, k));

  const known = new Set(skills.flatMap(g => g.items.map(i => i.toLowerCase())));
  const knownItems = Array.from(known);
  const surfaced = presentJd.filter(k => {
    const kl = k.toLowerCase();
    return !known.has(kl) && !knownItems.some(i => i.startsWith(kl + ' ') || i.startsWith(kl + ' ('));
  });
  if (surfaced.length > 0) {
    if (skills.length === 0) skills = [{ items: surfaced }];
    else skills.push({ label: 'Additional Skills', items: surfaced });
  }
  skills = skills.map(g => ({
    ...g,
    items: [...g.items].sort((a, b) => Number(jdLower.has(b.toLowerCase())) - Number(jdLower.has(a.toLowerCase())))
  }));

  // Headline
  let headline = hdr.headline;
  if (!headline && experience[0]) {
    headline = experience[0].title.split(/\s+(?:at|@|\|)\s+/i)[0].trim();
    if (headline.length > 60 || /\d/.test(headline)) headline = '';
  }

  // Summary
  let summary = polishSummary([...sections.summary, ...hdr.summaryBits].join(' '));
  const topSkills = (presentJd.length > 0 ? presentJd : skills.flatMap(g => g.items)).slice(0, 5);
  if (!summary && topSkills.length > 0) {
    const role = headline || 'Professional';
    const list = topSkills.length > 1 ? `${topSkills.slice(0, -1).join(', ')} and ${topSkills[topSkills.length - 1]}` : topSkills[0];
    summary = `${role} with hands-on experience in ${list}.`;
  } else if (summary && presentJd.length > 0) {
    const low = summary.toLowerCase();
    const missingFromSummary = presentJd.filter(k => !termInText(low, k)).slice(0, 4);
    if (missingFromSummary.length > 0) {
      const l = missingFromSummary.length > 1
        ? `${missingFromSummary.slice(0, -1).join(', ')} and ${missingFromSummary[missingFromSummary.length - 1]}`
        : missingFromSummary[0];
      summary += ` Core strengths include ${l}.`;
    }
  }

  // Certifications
  const certifications: string[] = [];
  for (const raw of sections.certifications) {
    const t = raw.replace(BULLET, '').replace(/\t/g, ' | ').trim();
    if (!t) continue;
    const isBullet = BULLET.test(raw);
    if (!isBullet && /^[a-z]/.test(t) && certifications.length > 0) certifications[certifications.length - 1] += ' ' + t;
    else certifications.push(t);
  }

  const extraSections: ExtraSection[] = extras
    .map(e => ({
      title: e.title,
      lines: e.lines.map(l => l.replace(BULLET, '').replace(/\t/g, ' | ').trim()).filter(Boolean)
    }))
    .filter(e => e.lines.length > 0);

  return {
    name: hdr.name,
    headline,
    contacts: hdr.contacts,
    summary,
    skills,
    experience,
    projects,
    education,
    certifications,
    extras: extraSections
  };
}
