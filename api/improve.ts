// Vercel serverless function: rewrites a parsed resume with an LLM.
// FREE option: set GEMINI_API_KEY (Google AI Studio, no credit card).
// Optional paid option: set ANTHROPIC_API_KEY instead.

const SYSTEM = `You are an expert resume writer and ATS specialist who has screened thousands of resumes for recruiters and hiring managers.
You receive a candidate's parsed resume as JSON (and optionally a target job description) and return a significantly better version.

HARD RULES (never break):
- Keep every real fact: name, contact details, employers, job titles, dates, degrees, schools, certifications, project names, and every number or metric the candidate gave.
- NEVER invent employers, titles, dates, degrees, tools, or numbers. Do not add a skill unless the resume text clearly shows the candidate uses it.
- If you want a metric but none exists, do NOT make one up. Describe the impact qualitatively only if it is clearly implied, and list the missing metric in "notes".

WHAT TO IMPROVE:
1. Professional summary: 2-3 sentences, specific, third-person-implied (no "I"), role + strongest skills + domain/impact. Tailor to the job description using only truthful content.
2. Bullets: 3-5 per role/project, each = strong action verb + what you did + how (tools) + result/impact. Start every bullet with a different strong past-tense verb (present tense for the current role). Remove filler ("responsible for", "worked on", "helped with"). Merge or split weak bullets. Most job-relevant bullets first.
3. Skills: group into clear labeled categories (e.g. Languages, Frontend, Backend, Databases, Cloud & DevOps, Tools). Use the exact keyword spellings from the job description when the candidate has that skill (e.g. "Node.js", "PostgreSQL", "CI/CD"). Put the most job-relevant first. Remove duplicates.
4. Headline: a concise professional title aligned to the target role, only if consistent with the candidate's real experience.
5. Sections: keep Education, Certifications, and extra sections. Move projects into "projects" and jobs into "experience". Fix inconsistent formatting, casing, punctuation and dates (format like "Jan 2023 – Present").
6. Keep it recruiter-friendly: concise, no buzzword stuffing, no first person, no personal pronouns, no emojis, no tables.

OUTPUT: respond with ONLY a JSON object (no markdown fences, no commentary) of this exact shape:
{
  "resume": {
    "name": string, "headline": string, "contacts": string[], "summary": string,
    "skills": [{"label": string, "items": string[]}],
    "experience": [{"title": string, "subtitle": string, "date": string, "bullets": string[]}],
    "projects": [{"title": string, "subtitle": string, "date": string, "bullets": string[]}],
    "education": [{"title": string, "subtitle": string, "date": string, "bullets": string[]}],
    "certifications": string[],
    "extras": [{"title": string, "lines": string[]}]
  },
  "notes": string[]
}
"notes" = up to 5 short, specific suggestions for details the candidate should add themselves if true (e.g. "Add a metric to the Pixel Labs page-load bullet", "Add your LinkedIn URL"). Use "" for unknown subtitle/date.`;

function extractJson(text: string): any {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('No JSON in model response');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callGemini(key: string, userContent: string): Promise<string> {
  // Model names change over time, so try the configured one first, then safe aliases.
  const candidates = [process.env.GEMINI_MODEL, 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-flash-lite-latest']
    .filter((m, i, a): m is string => !!m && a.indexOf(m) === i);
  let lastErr = 'no_model';
  for (const model of candidates) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.4, maxOutputTokens: 8192 }
      })
    });
    if (r.ok) {
      const data: any = await r.json();
      const text = (data.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('');
      if (text) return text;
      lastErr = 'empty_response';
      continue;
    }
    const detail = (await r.text()).slice(0, 400);
    console.error('Gemini error', model, r.status, detail);
    lastErr = `gemini_${r.status}`;
    // Only try the next model name if this one doesn't exist / isn't available.
    if (r.status !== 404 && r.status !== 400 && r.status !== 403) break;
  }
  throw new Error(lastErr);
}

async function callAnthropic(key: string, userContent: string): Promise<string> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: 6000,
      system: SYSTEM,
      messages: [{ role: 'user', content: userContent }]
    })
  });
  if (!r.ok) {
    console.error('Anthropic error', r.status, (await r.text()).slice(0, 400));
    throw new Error(`anthropic_${r.status}`);
  }
  const data: any = await r.json();
  return (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  // Basic abuse protection: only accept calls coming from this site.
  const origin = req.headers?.origin as string | undefined;
  const host = req.headers?.host as string | undefined;
  if (origin && host && !origin.includes(host)) return res.status(403).json({ error: 'forbidden' });

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!geminiKey && !anthropicKey) return res.status(503).json({ error: 'not_configured' });

  const { resume, jd } = req.body || {};
  if (!resume || typeof resume !== 'object') return res.status(400).json({ error: 'bad_request' });
  const resumeJson = JSON.stringify(resume);
  const jdText = typeof jd === 'string' ? jd : '';
  if (resumeJson.length > 60000 || jdText.length > 20000) return res.status(413).json({ error: 'too_large' });

  const userContent =
    `TARGET JOB DESCRIPTION:\n${jdText.trim() || '(none provided: optimise for general ATS readability and impact)'}\n\n` +
    `PARSED RESUME JSON:\n${resumeJson}`;

  try {
    const text = geminiKey ? await callGemini(geminiKey, userContent) : await callAnthropic(anthropicKey as string, userContent);
    const parsed = extractJson(text);
    return res.status(200).json({ resume: parsed.resume, notes: Array.isArray(parsed.notes) ? parsed.notes : [] });
  } catch (err) {
    console.error('improve failed', err);
    return res.status(502).json({ error: 'failed' });
  }
}
