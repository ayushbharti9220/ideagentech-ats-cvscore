import { Entry, ResumeData } from '../types/resume';

export interface AiResult {
  resume: ResumeData;
  notes: string[];
}

const str = (v: unknown): string => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');
const arr = (v: unknown): any[] => (Array.isArray(v) ? v : []);

function entries(v: unknown): Entry[] {
  return arr(v)
    .map((e: any) => ({
      title: str(e?.title),
      subtitle: str(e?.subtitle) || undefined,
      date: str(e?.date) || undefined,
      bullets: arr(e?.bullets).map(str).filter(Boolean)
    }))
    .filter(e => e.title || e.bullets.length);
}

// Validates / cleans whatever the model returned so a bad response can never break the PDF.
export function normalizeResume(raw: any, original: ResumeData): ResumeData {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid AI response');
  const out: ResumeData = {
    name: str(raw.name) || original.name,
    headline: str(raw.headline),
    contacts: arr(raw.contacts).map(str).filter(Boolean),
    summary: str(raw.summary),
    skills: arr(raw.skills)
      .map((g: any) => ({ label: str(g?.label) || undefined, items: arr(g?.items).map(str).filter(Boolean) }))
      .filter(g => g.items.length > 0),
    experience: entries(raw.experience),
    projects: entries(raw.projects),
    education: entries(raw.education),
    certifications: arr(raw.certifications).map(str).filter(Boolean),
    extras: arr(raw.extras)
      .map((x: any) => ({ title: str(x?.title), lines: arr(x?.lines).map(str).filter(Boolean) }))
      .filter(x => x.title && x.lines.length > 0)
  };

  if (out.contacts.length === 0) out.contacts = original.contacts;

  // Safety nets: the AI must not drop real content.
  if (original.experience.length > 0 && out.experience.length < original.experience.length) throw new Error('AI dropped experience');
  if (original.education.length > 0 && out.education.length === 0) throw new Error('AI dropped education');
  if (original.projects.length > 0 && out.projects.length === 0) throw new Error('AI dropped projects');
  if (original.certifications.length > 0 && out.certifications.length === 0) out.certifications = original.certifications;
  if (original.extras.length > 0 && out.extras.length === 0) out.extras = original.extras;
  if (!out.summary && !out.experience.length && !out.projects.length) throw new Error('AI response empty');
  return out;
}

export async function improveWithAI(data: ResumeData, jd: string, timeoutMs = 55000): Promise<AiResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch('/api/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume: data, jd }),
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error(`AI unavailable (${res.status})`);
    const body = await res.json();
    return {
      resume: normalizeResume(body.resume, data),
      notes: arr(body.notes).map(str).filter(Boolean).slice(0, 6)
    };
  } finally {
    clearTimeout(timer);
  }
}
