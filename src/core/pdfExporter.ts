import { jsPDF } from 'jspdf';
import { StructuredResume } from '../types/ats';

export function downloadResumePDF(resume: StructuredResume): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const maxWidth = pageWidth - marginX * 2;
  let cursorY = 52;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 48) {
      doc.addPage();
      cursorY = 52;
    }
  };

  // 1. Candidate Name (Bold Uppercase)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(24, 24, 27); // #18181b
  doc.text(resume.fullName.toUpperCase(), marginX, cursorY);
  cursorY += 18;

  // 2. Headline & Contact Line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(82, 82, 91); // #52525b
  const subHeader = `${resume.headline} • ${resume.contactLine}`;
  const subHeaderLines = doc.splitTextToSize(subHeader, maxWidth);
  doc.text(subHeaderLines, marginX, cursorY);
  cursorY += subHeaderLines.length * 14 + 10;

  const drawSectionHeader = (title: string) => {
    checkPageBreak(36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(24, 24, 27);
    doc.text(title.toUpperCase(), marginX, cursorY);
    cursorY += 5;
    doc.setDrawColor(212, 212, 216); // #d4d4d8
    doc.setLineWidth(0.8);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    cursorY += 15;
  };

  // 3. Professional Summary
  drawSectionHeader('Professional Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(39, 39, 42); // #27272a
  const summaryLines = doc.splitTextToSize(resume.summary, maxWidth);
  checkPageBreak(summaryLines.length * 14);
  doc.text(summaryLines, marginX, cursorY);
  cursorY += summaryLines.length * 14 + 14;

  // 4. Technical Skills (Clean pill badges rendered natively in PDF)
  drawSectionHeader('Technical Skills');
  doc.setFont('helvetica', 'medium');
  doc.setFontSize(9.5);
  let pillX = marginX;
  const pillHeight = 18;
  const pillPadX = 8;
  const pillGapX = 6;
  const pillGapY = 6;

  for (const skill of resume.skills) {
    const textWidth = doc.getTextWidth(skill);
    const pillWidth = textWidth + pillPadX * 2;

    if (pillX + pillWidth > pageWidth - marginX) {
      pillX = marginX;
      cursorY += pillHeight + pillGapY;
      checkPageBreak(pillHeight + 8);
    }

    // Pill background & subtle border
    doc.setFillColor(244, 244, 245); // #f4f4f5
    doc.setDrawColor(228, 228, 231); // #e4e4e7
    doc.setLineWidth(0.6);
    doc.roundedRect(pillX, cursorY - 12, pillWidth, pillHeight, 3, 3, 'FD');

    doc.setTextColor(39, 39, 42);
    doc.text(skill, pillX + pillPadX, cursorY);

    pillX += pillWidth + pillGapX;
  }
  cursorY += pillHeight + 14;

  // 5. Work Experience
  drawSectionHeader('Work Experience');
  for (const exp of resume.experienceItems) {
    checkPageBreak(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(24, 24, 27);
    const headerLines = doc.splitTextToSize(exp.header, maxWidth);
    doc.text(headerLines, marginX, cursorY);
    cursorY += headerLines.length * 14 + 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(39, 39, 42);

    for (const bullet of exp.bullets) {
      const bulletIndent = 12;
      const wrappedBullet = doc.splitTextToSize(bullet, maxWidth - bulletIndent);
      checkPageBreak(wrappedBullet.length * 14 + 4);

      doc.text('•', marginX + 2, cursorY);
      doc.text(wrappedBullet, marginX + bulletIndent, cursorY);
      cursorY += wrappedBullet.length * 14 + 4;
    }
    cursorY += 6;
  }

  // 6. Education
  drawSectionHeader('Education');
  resume.educationItems.forEach((edu, idx) => {
    checkPageBreak(18);
    doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.setTextColor(idx === 0 ? 24 : 63, idx === 0 ? 24 : 63, idx === 0 ? 27 : 70);
    const eduLines = doc.splitTextToSize(edu, maxWidth);
    doc.text(eduLines, marginX, cursorY);
    cursorY += eduLines.length * 14 + 2;
  });

  // Clean filename based on candidate name
  const safeName = resume.fullName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const fileName = `${safeName || 'Candidate'}_ATS_Optimized_Resume.pdf`;

  // Direct instant browser download (zero print dialog!)
  doc.save(fileName);
}
