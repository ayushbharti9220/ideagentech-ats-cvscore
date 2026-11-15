import { jsPDF } from 'jspdf';

export const SAMPLE_JD = `We are looking for a Full Stack Software Engineer with expertise in React, TypeScript, Node.js and SQL databases.
Requirements:
- 1+ years building web applications with React and TypeScript.
- Strong proficiency in Node.js, REST APIs, and backend integration.
- Experience with Git, Agile methodologies, Docker and Tailwind CSS.
- Knowledge of cloud platforms like AWS or Supabase is a plus.`;

// Builds a real (text-based) sample resume PDF in the browser, with deliberately weak phrasing.
export function makeSampleResumePdf(): ArrayBuffer {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  let y = 56;
  const line = (text: string, size = 10, bold = false, x = 48) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.text(text, x, y);
    y += size + 5;
  };
  const withDate = (left: string, date: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(left, 48, y);
    doc.setFont('helvetica', 'normal');
    doc.text(date, 564, y, { align: 'right' });
    y += 15;
  };

  line('AARAV SHARMA', 20, true);
  line('Full Stack Developer', 11);
  line('New Delhi, India | +91 98765 43210 | aarav.sharma@email.com | github.com/aaravsharma', 9);
  y += 8;
  line('SKILLS', 11, true);
  line('Languages: javascript, typescript, python, sql');
  line('Frameworks: reactjs, nodejs, express, tailwind');
  line('Tools: git, docker, postman, vs code');
  y += 8;
  line('EXPERIENCE', 11, true);
  withDate('Software Developer Intern - Pixel Labs', 'Jun 2024 - Present');
  line('\u2022 Responsible for developing responsive UI components using React and TypeScript');
  line('\u2022 Worked on building REST APIs with Node.js and SQL databases');
  line('\u2022 Helped to reduce page load time by 30% through code splitting');
  line('\u2022 Used Git and Agile practices with a team of 5 developers');
  y += 6;
  withDate('Freelance Web Developer', 'Jan 2023 - May 2024');
  line('\u2022 Building landing pages and small business websites for 6 clients');
  line('\u2022 Was responsible for deployment and maintenance on Vercel');
  y += 8;
  line('PROJECTS', 11, true);
  withDate('Expense Tracker | React, Supabase', '2024');
  line('\u2022 Made a full stack app to track expenses with charts and auth');
  y += 8;
  line('EDUCATION', 11, true);
  withDate('Delhi Technological University', '2020 - 2024');
  line('B.Tech in Computer Science, CGPA: 8.4');

  return doc.output('arraybuffer');
}
