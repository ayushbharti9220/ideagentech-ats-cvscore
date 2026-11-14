import { KeywordGap, PhrasingFix, StructuredResume } from '../types/ats';

export function buildOptimizedResume(
  rawLines: string[],
  rawText: string,
  matchedKeywords: KeywordGap[],
  missingKeywords: KeywordGap[],
  phrasingFixes: PhrasingFix[]
): StructuredResume {
  const lines = rawLines.length > 0 ? rawLines : rawText.split(/\n+/).map(l => l.trim()).filter(Boolean);

  const fullName = lines[0] || 'Candidate Name';
  let headline = '';
  let contactLine = '';

  const topLines = lines.slice(1, 5);
  for (const line of topLines) {
    if (line.includes('@') || line.includes('github.com') || line.includes('linkedin.com') || /\d{3}[-.\s]?\d{3}/.test(line)) {
      contactLine = contactLine ? `${contactLine} • ${line}` : line;
    } else if (!headline && line.length < 70 && !isSectionHeader(line)) {
      headline = line;
    }
  }

  if (!contactLine) {
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const linkMatch = rawText.match(/(github\.com\/[a-zA-Z0-9_-]+|linkedin\.com\/in\/[a-zA-Z0-9_-]+)/);
    contactLine = [emailMatch?.[0], linkMatch?.[0]].filter(Boolean).join(' • ') || 'Contact details preserved from resume';
  }
  if (!headline) {
    headline = 'Software Engineer';
  }

  const sections: Record<string, string[]> = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    other: []
  };

  let currentSection = 'other';
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === headline || contactLine.includes(line)) continue;

    const detected = detectSectionType(line);
    if (detected) {
      currentSection = detected;
      continue;
    }
    sections[currentSection].push(line);
  }

  const missingCoreSkills = missingKeywords
    .filter(k => k.category === 'Core Skill')
    .map(k => k.keyword);
  const topMissingToIntegrate = (missingCoreSkills.length > 0 ? missingCoreSkills : missingKeywords.map(k => k.keyword)).slice(0, 4);

  let summaryText = sections.summary.join(' ').trim();
  if (!summaryText) {
    summaryText = `Results-oriented ${headline} experienced in designing, developing, and deploying reliable software solutions.`;
  }
  if (topMissingToIntegrate.length > 0) {
    const missingNotInSummary = topMissingToIntegrate.filter(kw => !summaryText.toLowerCase().includes(kw.toLowerCase()));
    if (missingNotInSummary.length > 0) {
      summaryText += ` Proficient in ${missingNotInSummary.join(', ')}, with a strong focus on clean architecture and scalable delivery.`;
    }
  }

  const existingSkillTokens = sections.skills
    .join(', ')
    .replace(/^[•\-*]+\s*/gm, '')
    .split(/[,|•·]+/)
    .map(s => s.replace(/^[a-zA-Z\s&]+:\s*/, '').trim())
    .filter(s => s.length > 1 && s.length < 35);

  const matchedNames = matchedKeywords.map(k => k.keyword);
  const combinedSkillsSet = new Set<string>([
    ...existingSkillTokens,
    ...matchedNames,
    ...topMissingToIntegrate
  ]);
  const finalSkills = Array.from(combinedSkillsSet).slice(0, 18);

  const experienceItems: { header: string; bullets: string[] }[] = [];
  let currentRoleHeader = '';
  let currentBullets: string[] = [];

  for (const line of sections.experience) {
    const isBullet = /^[•\-*▪]/.test(line);
    if (!isBullet && (line.includes('20') || line.includes('Present') || line.includes('—') || line.includes('-')) && line.length < 95) {
      if (currentRoleHeader || currentBullets.length > 0) {
        experienceItems.push({
          header: currentRoleHeader || 'Experience',
          bullets: currentBullets
        });
      }
      currentRoleHeader = line;
      currentBullets = [];
    } else {
      currentBullets.push(line.replace(/^[•\-*▪]\s*/, '').trim());
    }
  }

  if (currentRoleHeader || currentBullets.length > 0) {
    experienceItems.push({
      header: currentRoleHeader || 'Professional Experience',
      bullets: currentBullets
    });
  }

  if (experienceItems.length === 0) {
    experienceItems.push({
      header: `${headline} — Key Projects & Experience`,
      bullets: []
    });
  }

  const primaryRole = experienceItems[0];
  phrasingFixes.slice(0, 2).forEach(fix => {
    const alreadyPresent = primaryRole.bullets.some(b =>
      b.toLowerCase().includes(fix.missingKeyword.toLowerCase())
    );
    if (!alreadyPresent) {
      primaryRole.bullets.push(fix.suggestedBullet);
    }
  });

  const educationItems = sections.education.length > 0
    ? sections.education
    : ['Education details preserved from original resume'];

  return {
    fullName,
    headline,
    contactLine,
    summary: summaryText,
    skills: finalSkills,
    experienceItems,
    educationItems,
    integratedKeywords: topMissingToIntegrate
  };
}

function isSectionHeader(line: string): boolean {
  return detectSectionType(line) !== null;
}

function detectSectionType(line: string): 'summary' | 'skills' | 'experience' | 'education' | null {
  const clean = line.replace(/[\[\]:]/g, '').trim().toLowerCase();
  if (clean.length > 35) return null;
  if (['summary', 'professional summary', 'objective', 'profile', 'about'].includes(clean)) return 'summary';
  if (['skills', 'technical skills', 'core competencies', 'technologies', 'tech stack'].includes(clean)) return 'skills';
  if (['experience', 'work experience', 'professional experience', 'employment', 'projects'].includes(clean)) return 'experience';
  if (['education', 'academic background', 'qualifications'].includes(clean)) return 'education';
  return null;
}
