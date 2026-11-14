import { tokenizeAndClean } from './tokenizer';
import { KeywordGap } from '../types/ats';

export function computeTFIDFAndMatch(resumeText: string, jdText: string): {
  matchScore: number;
  matchedKeywords: KeywordGap[];
  missingKeywords: KeywordGap[];
} {
  const resumeTokens = tokenizeAndClean(resumeText);
  const jdTokens = tokenizeAndClean(jdText);

  if (jdTokens.length === 0 || resumeTokens.length === 0) {
    return { matchScore: 0, matchedKeywords: [], missingKeywords: [] };
  }

  const jdFreq: Record<string, number> = {};
  for (const token of jdTokens) {
    jdFreq[token] = (jdFreq[token] || 0) + 1;
  }

  const resumeFreq: Record<string, number> = {};
  for (const token of resumeTokens) {
    resumeFreq[token] = (resumeFreq[token] || 0) + 1;
  }

  const sortedJdTerms = Object.entries(jdFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([term]) => term);

  const significantTerms = sortedJdTerms.filter(t => t.length > 1);

  const matched: KeywordGap[] = [];
  const missing: KeywordGap[] = [];

  const coreSkills = new Set([
    'react', 'typescript', 'javascript', 'node', 'node.js', 'python', 'java', 'c', 'cpp', 'sql',
    'postgresql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git', 'tailwind', 'html',
    'css', 'nextjs', 'next.js', 'express', 'django', 'redis', 'graphql', 'rest', 'api', 'agile',
    'scrum', 'linux', 'ci', 'cd', 'testing', 'jest', 'prisma', 'supabase', 'firebase', 'frontend', 'backend'
  ]);

  const targetTerms = significantTerms.slice(0, 36);

  let matchPoints = 0;
  let totalWeight = targetTerms.length;

  for (const term of targetTerms) {
    const freqInResume = resumeFreq[term] || 0;
    const inResume = freqInResume > 0;
    
    let category: KeywordGap['category'] = 'Role Keyword';
    if (coreSkills.has(term) || term.includes('.js') || term.includes('sql') || term === 'react' || term === 'typescript') {
      category = 'Core Skill';
    }

    const formattedKeyword = term.charAt(0).toUpperCase() + term.slice(1);

    const keywordItem: KeywordGap = {
      keyword: formattedKeyword,
      importance: jdFreq[term],
      inResume,
      frequencyInResume: freqInResume,
      category
    };

    if (inResume) {
      matched.push(keywordItem);
      matchPoints += Math.min(freqInResume, 3);
    } else {
      missing.push(keywordItem);
    }
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allUniqueTerms = new Set([...Object.keys(resumeFreq), ...Object.keys(jdFreq)]);
  for (const term of allUniqueTerms) {
    const a = resumeFreq[term] || 0;
    const b = jdFreq[term] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  let cosineSim = 0;
  if (normA > 0 && normB > 0) {
    cosineSim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  const heuristicScore = totalWeight > 0 ? (matchPoints / totalWeight) * 100 : 0;
  const combinedScore = Math.round((cosineSim * 40) + (heuristicScore * 0.6) + 12);
  const finalScore = Math.max(8, Math.min(98, combinedScore));

  return {
    matchScore: finalScore,
    matchedKeywords: matched.sort((a, b) => b.importance - a.importance),
    missingKeywords: missing.sort((a, b) => b.importance - a.importance)
  };
}
