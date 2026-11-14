import { ParseResult } from '../types/ats';

export interface FormattingDiagnosticReport {
  isSafe: boolean;
  score: number;
  warnings: string[];
  recommendations: string[];
}

export function analyzeLayout(parseResult: ParseResult): FormattingDiagnosticReport {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (parseResult.hasMultiColumnRisk) {
    score -= 35;
    warnings.push('Multi-column or sidebar layout detected (Column shifts: ' + parseResult.columnShifts + ').');
    recommendations.push('Switch to a clean, single-column linear layout. ATS parsers often scramble multi-column text.');
  } else {
    recommendations.push('Layout structure is clean and linear. ATS parsers can read text top-to-bottom accurately.');
  }

  if (parseResult.wordCount < 150) {
    score -= 25;
    warnings.push('Resume word count is very low (' + parseResult.wordCount + ' words).');
    recommendations.push('Expand your experience and project descriptions with detailed impact metrics and tech stacks.');
  } else if (parseResult.wordCount > 900) {
    score -= 10;
    warnings.push('Resume word count is quite high (' + parseResult.wordCount + ' words).');
    recommendations.push('Consider trimming less relevant details to keep your resume concise (ideally 400-700 words).');
  }

  const essentialSections = ['experience', 'skills', 'education'];
  const missingSections = essentialSections.filter(sec => !parseResult.detectedSections.includes(sec));
  if (missingSections.length > 0) {
    score -= (missingSections.length * 15);
    warnings.push('Standard headings missing or unrecognized: ' + missingSections.join(', ') + '.');
    recommendations.push('Use standard section headers like "Work Experience", "Technical Skills", and "Education" so ATS can index them.');
  }

  return {
    isSafe: score >= 75 && !parseResult.hasMultiColumnRisk,
    score: Math.max(10, Math.min(100, score)),
    warnings,
    recommendations
  };
}
