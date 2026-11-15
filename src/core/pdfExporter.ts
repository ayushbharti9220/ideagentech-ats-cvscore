import { jsPDF } from 'jspdf';
import { Entry, ResumeData } from '../types/resume';

// Standard PDF fonts only support Latin characters, so we transliterate anything else.
function clean(s: string): string {
  return s
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2010\u2011\u2012]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u25CF\u25AA]/g, '\u2022')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2022]/g, '');
}

const INK: [number, number, number] = [24, 24, 27];
const MUTED: [number, number, number] = [82, 82, 91];
const ACCENT: [number, number, number] = [30, 58, 95];

function render(data: ResumeData, scale: number): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
  doc.setProperties({ title: `${clean(data.name)} - Resume`, author: clean(data.name), subject: 'Resume' });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const mx = 46;
  const my = 42;
  const maxW = W - mx * 2;
  const body = 10 * scale;
  const lh = body * 1.34;
  let y = my;

  const ensure = (h: number) => {
    if (y + h > H - my) {
      doc.addPage();
      y = my;
    }
  };
  const font = (style: 'normal' | 'bold' | 'italic', size: number, color: [number, number, number] = INK) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };
  const wrap = (text: string, width: number): string[] => doc.splitTextToSize(clean(text), width) as string[];

  // ----- Header -----
  font('bold', 22 * scale);
  doc.text(clean(data.name), W / 2, y + 18 * scale, { align: 'center' });
  y += 18 * scale + 11 * scale;

  if (data.headline) {
    font('normal', 11.5 * scale, ACCENT);
    doc.text(clean(data.headline), W / 2, y + 6, { align: 'center', maxWidth: maxW });
    y += 15 * scale;
  }
  if (data.contacts.length > 0) {
    font('normal', 9.3 * scale, MUTED);
    const lines = wrap(data.contacts.join('  |  '), maxW);
    for (const l of lines) {
      doc.text(l, W / 2, y + 6, { align: 'center' });
      y += 12 * scale;
    }
  }
  y += 4 * scale;

  const heading = (title: string) => {
    ensure(lh * 3.2);
    y += 7 * scale;
    font('bold', 10.5 * scale, ACCENT);
    doc.text(clean(title).toUpperCase(), mx, y + 4);
    y += 7;
    doc.setDrawColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.setLineWidth(0.8);
    doc.line(mx, y, W - mx, y);
    y += lh * 0.95;
  };

  const bullets = (items: string[]) => {
    const indent = 11;
    for (const b of items) {
      const ls = wrap(b, maxW - indent);
      ensure(Math.min(ls.length, 3) * lh + 2);
      font('normal', body);
      doc.text('\u2022', mx + 2, y);
      for (const l of ls) {
        doc.text(l, mx + indent, y);
        y += lh;
      }
      y += 1.6 * scale;
    }
  };

  const entry = (e: Entry) => {
    const firstBullet = e.bullets[0] ? wrap(e.bullets[0], maxW - 11).length : 0;
    ensure(lh * (e.subtitle ? 2 : 1) + Math.min(firstBullet, 2) * lh + 4);

    font('normal', body * 0.95, MUTED);
    const dateW = e.date ? doc.getTextWidth(clean(e.date)) + 12 : 0;
    font('bold', body * 1.03);
    const titleLines = wrap(e.title || '', maxW - dateW);
    titleLines.forEach((l, i) => {
      font('bold', body * 1.03);
      doc.text(l, mx, y);
      if (i === 0 && e.date) {
        font('normal', body * 0.95, MUTED);
        doc.text(clean(e.date), W - mx, y, { align: 'right' });
      }
      y += lh;
    });
    if (!e.title && e.date) {
      font('normal', body * 0.95, MUTED);
      doc.text(clean(e.date), W - mx, y, { align: 'right' });
      y += lh;
    }
    if (e.subtitle) {
      font('italic', body, MUTED);
      for (const l of wrap(e.subtitle, maxW)) {
        doc.text(l, mx, y);
        y += lh;
      }
    }
    y += 1.5 * scale;
    bullets(e.bullets);
    y += 4.5 * scale;
  };

  // ----- Summary -----
  if (data.summary) {
    heading('Professional Summary');
    font('normal', body);
    for (const l of wrap(data.summary, maxW)) {
      ensure(lh);
      doc.text(l, mx, y);
      y += lh;
    }
  }

  // ----- Skills -----
  if (data.skills.length > 0) {
    heading('Technical Skills');
    for (const g of data.skills) {
      const text = g.items.join(', ');
      let labelW = 0;
      if (g.label) {
        font('bold', body);
        labelW = doc.getTextWidth(clean(g.label) + ': ') + 2;
      }
      font('normal', body);
      const ls = wrap(text, maxW - labelW);
      ensure(Math.min(ls.length, 2) * lh);
      if (g.label) {
        font('bold', body);
        doc.text(clean(g.label) + ':', mx, y);
      }
      font('normal', body);
      for (const l of ls) {
        doc.text(l, mx + labelW, y);
        y += lh;
      }
      y += 1.5 * scale;
    }
  }

  // ----- Experience / Projects / Education -----
  if (data.experience.length > 0) {
    heading('Professional Experience');
    data.experience.forEach(entry);
  }
  if (data.projects.length > 0) {
    heading('Projects');
    data.projects.forEach(entry);
  }
  if (data.education.length > 0) {
    heading('Education');
    data.education.forEach(entry);
  }
  if (data.certifications.length > 0) {
    heading('Certifications');
    bullets(data.certifications);
  }
  for (const ex of data.extras) {
    heading(ex.title);
    bullets(ex.lines);
  }

  return doc;
}

export function buildResumePdf(data: ResumeData): jsPDF {
  // Prefer a tidy one-pager when the content is only slightly over; never shrink below ~9.2pt.
  let first: jsPDF | null = null;
  for (const scale of [1, 0.97, 0.94, 0.92]) {
    const doc = render(data, scale);
    if (!first) first = doc;
    if (doc.getNumberOfPages() === 1) return doc;
  }
  return first as jsPDF;
}

export function resumeFileName(data: ResumeData): string {
  const safe = clean(data.name).replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '_');
  return `${safe || 'Candidate'}_Resume.pdf`;
}

export function downloadResumePdf(data: ResumeData): void {
  buildResumePdf(data).save(resumeFileName(data));
}
