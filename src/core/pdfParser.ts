import * as pdfjsLib from 'pdfjs-dist';
import { ParseResult } from '../types/ats';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

export async function parseResumePDF(arrayBuffer: ArrayBuffer): Promise<ParseResult> {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  
  let fullText = '';
  const lines: string[] = [];
  let currentLine = '';
  let lastY: number | null = null;
  let lastX = 0;
  let columnShifts = 0;

  const standardSections = ['experience', 'education', 'skills', 'projects', 'summary', 'certifications', 'objective'];
  const detectedSectionsSet = new Set<string>();

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();

    textContent.items.forEach((item: any) => {
      if (item.str && item.str.trim().length > 0) {
        const str = item.str.trim();
        const x = item.transform ? item.transform[4] : 0;
        const y = item.transform ? item.transform[5] : 0;

        if (lastY !== null && Math.abs(y - lastY) > 6) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          currentLine = str;
        } else {
          currentLine += (currentLine ? ' ' : '') + str;
        }
        lastY = y;

        fullText += str + ' ';

        if (Math.abs(x - lastX) > 220 && x > 50 && lastX > 50) {
          columnShifts++;
        }
        lastX = x;

        const lowerStr = str.toLowerCase();
        for (const sec of standardSections) {
          if (lowerStr.includes(sec) && str.length < 35) {
            detectedSectionsSet.add(sec);
          }
        }
      }
    });
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  const cleanedText = fullText.replace(/\s+/g, ' ').trim();
  const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;
  const hasMultiColumnRisk = columnShifts > 14;

  return {
    text: cleanedText,
    lines,
    wordCount,
    hasMultiColumnRisk,
    columnShifts,
    detectedSections: Array.from(detectedSectionsSet)
  };
}
