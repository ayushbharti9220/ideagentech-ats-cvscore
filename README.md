# Ideagentech ATS CVScore

A browser-based tool that checks how well a PDF resume matches a job description, spots layout issues that break ATS parsers, and exports a clean single-column PDF. Everything runs locally in your browser—no files are uploaded to any server.

## What It Does

- **PDF Text & Layout Check:** Reads your PDF using `PDF.js` and checks text coordinates to warn you if multi-column layouts or tables might scramble your work history.
- **Keyword Match Score:** Compares your resume against a job description using TF-IDF and cosine similarity to show matched skills and missing keywords.
- **Bullet Point Suggestions:** Generates ready-to-copy resume bullet points for missing technical skills.
- **1-Click PDF Export:** Adds missing keywords into your existing resume sections and downloads a single-column PDF using `jsPDF`.

## Built With

- React + TypeScript
- Vite
- Tailwind CSS
- PDF.js (`pdfjs-dist`)
- jsPDF
