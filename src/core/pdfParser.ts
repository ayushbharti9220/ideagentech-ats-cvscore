import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { buildLines, RawItem } from './lineBuilder';

// Worker is bundled with the app (no external CDN), so it works on Vercel/offline.
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function extractResumeLines(buffer: ArrayBuffer): Promise<string[]> {
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  } catch (err: any) {
    if (err && err.name === 'PasswordException') {
      throw new Error('This PDF is password protected. Please upload an unlocked copy.');
    }
    throw new Error('Could not read this file. Please upload a valid PDF resume.');
  }

  const pages: RawItem[][] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const items: RawItem[] = [];
    for (const raw of content.items as any[]) {
      if (typeof raw.str === 'string' && raw.transform) {
        items.push({ str: raw.str, x: raw.transform[4], y: raw.transform[5], w: raw.width || 0 });
      }
    }
    pages.push(items);
  }

  const lines = buildLines(pages);
  const chars = lines.join('').length;
  if (chars < 80) {
    throw new Error(
      'No readable text found. This looks like a scanned/image PDF. Please upload a text-based PDF (export from Word/Google Docs).'
    );
  }
  return lines;
}
