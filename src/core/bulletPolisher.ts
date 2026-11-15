// Rewrites weak / inconsistent resume phrasing into strong, consistent action-led bullets.
// It only rephrases what the candidate already wrote — it never invents tasks or numbers.

const VERBS: [string, string, string][] = [
  ['develop', 'developed', 'developing'], ['build', 'built', 'building'], ['design', 'designed', 'designing'],
  ['implement', 'implemented', 'implementing'], ['create', 'created', 'creating'], ['manage', 'managed', 'managing'],
  ['lead', 'led', 'leading'], ['maintain', 'maintained', 'maintaining'], ['test', 'tested', 'testing'],
  ['write', 'wrote', 'writing'], ['deploy', 'deployed', 'deploying'], ['optimize', 'optimized', 'optimizing'],
  ['optimise', 'optimized', 'optimising'], ['improve', 'improved', 'improving'], ['reduce', 'reduced', 'reducing'],
  ['integrate', 'integrated', 'integrating'], ['analyze', 'analyzed', 'analyzing'], ['analyse', 'analyzed', 'analysing'],
  ['automate', 'automated', 'automating'], ['migrate', 'migrated', 'migrating'], ['collaborate', 'collaborated', 'collaborating'],
  ['coordinate', 'coordinated', 'coordinating'], ['deliver', 'delivered', 'delivering'], ['debug', 'debugged', 'debugging'],
  ['configure', 'configured', 'configuring'], ['monitor', 'monitored', 'monitoring'], ['review', 'reviewed', 'reviewing'],
  ['mentor', 'mentored', 'mentoring'], ['plan', 'planned', 'planning'], ['research', 'researched', 'researching'],
  ['refactor', 'refactored', 'refactoring'], ['document', 'documented', 'documenting'], ['train', 'trained', 'training'],
  ['launch', 'launched', 'launching'], ['architect', 'architected', 'architecting'], ['execute', 'executed', 'executing'],
  ['establish', 'established', 'establishing'], ['streamline', 'streamlined', 'streamlining'], ['resolve', 'resolved', 'resolving'],
  ['drive', 'drove', 'driving'], ['conduct', 'conducted', 'conducting'], ['prepare', 'prepared', 'preparing'],
  ['organize', 'organized', 'organizing'], ['provide', 'provided', 'providing'], ['perform', 'performed', 'performing'],
  ['gather', 'gathered', 'gathering'], ['enhance', 'enhanced', 'enhancing'], ['generate', 'generated', 'generating'],
  ['construct', 'constructed', 'constructing'], ['modernize', 'modernized', 'modernizing'], ['secure', 'secured', 'securing']
];

const BY_GERUND = new Map(VERBS.map(v => [v[2], v[1]]));
const BY_BARE = new Map(VERBS.map(v => [v[0], v[2]]));

function cap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function gerundToPast(rest: string): string | null {
  const m = rest.match(/^([A-Za-z]+)\b\s*(.*)$/);
  if (!m) return null;
  const past = BY_GERUND.get(m[1].toLowerCase());
  return past ? `${cap(past)}${m[2] ? ' ' + m[2] : ''}` : null;
}

export function polishBullet(raw: string): string {
  let s = raw
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;])(?=[A-Za-z])/g, '$1 ')
    .trim();
  if (!s) return '';

  s = s.replace(/^i(?:'ve| have| had| was| am)?\s+(?=[a-z])/i, '');
  s = s.replace(/^(?:my\s+)?(?:duties|responsibilities|role)\s+(?:included|include|were|was)\s*:?\s*/i, '');
  s = s.replace(/^(?:responsibilities|duties)\s*:\s*/i, '');

  let m: RegExpMatchArray | null;

  if ((m = s.match(/^(?:(?:was|were|am|is|been)\s+)?(?:primarily\s+|mainly\s+)?(?:responsible|accountable)\s+(?:for|of)\s+(.+)$/i))) {
    s = gerundToPast(m[1]) ?? `Managed ${m[1]}`;
  } else if ((m = s.match(/^(?:was\s+)?tasked\s+with\s+(.+)$/i))) {
    s = gerundToPast(m[1]) ?? `Handled ${m[1]}`;
  } else if ((m = s.match(/^(?:worked\s+on|participated\s+in|(?:was\s+)?involved\s+in|took\s+part\s+in)\s+(.+)$/i))) {
    s = `Contributed to ${m[1]}`;
  } else if ((m = s.match(/^helped\s+(?:to\s+)?([a-z]+)\s*(.*)$/i)) && BY_BARE.has(m[1].toLowerCase())) {
    s = `Contributed to ${BY_BARE.get(m[1].toLowerCase())}${m[2] ? ' ' + m[2] : ''}`;
  } else if ((m = s.match(/^(?:helped|assisted|assisting)\s+(?:in\s+|with\s+|on\s+)?(.+)$/i))) {
    s = `Supported ${m[1]}`;
  } else if ((m = s.match(/^made\s+((?:a|an|the)\s+.+)$/i))) {
    s = `Built ${m[1]}`;
  } else if ((m = s.match(/^(?:used|utili[sz]ed|using|utili[sz]ing)\s+(.+)$/i))) {
    s = `Leveraged ${m[1]}`;
  } else {
    const g = gerundToPast(s);
    if (g) s = g;
  }

  s = cap(s.trim());
  s = s.replace(/[\s,;:]+$/, '');
  if (!/[.!?]$/.test(s)) s += '.';
  return s;
}

export function polishSummary(raw: string): string {
  let s = raw.replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
  if (!s) return '';
  s = cap(s);
  if (!/[.!?]$/.test(s)) s += '.';
  return s;
}
