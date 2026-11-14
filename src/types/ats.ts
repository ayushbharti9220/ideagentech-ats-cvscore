export interface TextBlock {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ParseResult {
  text: string;
  lines: string[];
  wordCount: number;
  hasMultiColumnRisk: boolean;
  columnShifts: number;
  detectedSections: string[];
}

export interface KeywordGap {
  keyword: string;
  importance: number;
  inResume: boolean;
  frequencyInResume: number;
  category: 'Core Skill' | 'Role Keyword';
}

export interface PhrasingFix {
  id: string;
  missingKeyword: string;
  context: string;
  suggestedBullet: string;
}

export interface StructuredResume {
  fullName: string;
  headline: string;
  contactLine: string;
  summary: string;
  skills: string[];
  experienceItems: {
    header: string;
    bullets: string[];
  }[];
  educationItems: string[];
  integratedKeywords: string[];
}

export interface AnalysisResult {
  matchScore: number;
  resumeWordCount: number;
  jdWordCount: number;
  hasMultiColumnRisk: boolean;
  columnShifts: number;
  detectedSections: string[];
  matchedKeywords: KeywordGap[];
  missingKeywords: KeywordGap[];
  phrasingFixes: PhrasingFix[];
  rawText: string;
  rawLines: string[];
  summary: string;
}
