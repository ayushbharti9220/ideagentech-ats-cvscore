import { KeywordGap, PhrasingFix } from '../types/ats';

export function generatePhrasingFixes(missingKeywords: KeywordGap[]): PhrasingFix[] {
  const fixes: PhrasingFix[] = [];
  
  const coreTechMissing = missingKeywords.filter(k => k.category === 'Core Skill');
  const targetList = coreTechMissing.length > 0 ? coreTechMissing : missingKeywords;

  targetList.slice(0, 4).forEach((item, index) => {
    const keyword = item.keyword;
    let context = 'Project Experience';
    let suggestedBullet = `Implemented robust features and optimized performance utilizing ${keyword}, increasing workflow efficiency by 25%.`;

    if (keyword.toLowerCase().includes('react') || keyword.toLowerCase().includes('typescript') || keyword.toLowerCase().includes('next')) {
      context = 'Frontend Development';
      suggestedBullet = `Developed scalable responsive web applications using ${keyword}, ensuring clean component architecture and type safety.`;
    } else if (keyword.toLowerCase().includes('node') || keyword.toLowerCase().includes('sql') || keyword.toLowerCase().includes('api')) {
      context = 'Backend & API Integration';
      suggestedBullet = `Engineered and secured RESTful backend services with ${keyword} to handle asynchronous database transactions and high throughput.`;
    }

    fixes.push({
      id: `fix-${index}`,
      missingKeyword: keyword,
      context,
      suggestedBullet
    });
  });

  return fixes;
}
