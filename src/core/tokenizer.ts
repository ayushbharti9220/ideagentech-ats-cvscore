import { STOP_WORDS } from '../data/stopWords';

export function tokenizeAndClean(text: string): string[] {
  if (!text) return [];

  let cleanedText = text.toLowerCase();
  const rawTokens = cleanedText
    .replace(/[^a-z0-9#+._\s]/gi, ' ')
    .split(/\s+/);

  const tokens: string[] = [];
  for (const t of rawTokens) {
    let token = t.replace(/^[.,!?;:()[\]"']+|[.,!?;:()[\]"']+$/g, '');
    
    if (token.length > 1 && !STOP_WORDS.has(token)) {
      if (token.endsWith('ies') && token.length > 4) {
        token = token.slice(0, -3) + 'y';
      } else if (token.endsWith('s') && !token.endsWith('ss') && token.length > 3) {
        token = token.slice(0, -1);
      } else if (token.endsWith('ing') && token.length > 5) {
        token = token.slice(0, -3);
      } else if (token.endsWith('ed') && token.length > 4) {
        token = token.slice(0, -2);
      }
      tokens.push(token);
    }
  }
  return tokens;
}
