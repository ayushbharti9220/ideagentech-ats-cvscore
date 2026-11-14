# Ideagentech ATS CVScore (v2.2)

A modern, minimalist, 100% client-side Applicant Tracking System (ATS) resume analyzer, keyword gap debugger, and **Direct 1-Click ATS-Optimized Resume PDF Generator** built with React, TypeScript, PDF.js, jsPDF, and Tailwind CSS.

## Features
- **100% Client-Side Parsing & IR Engine:** Reads PDF resumes directly in the browser via PDF.js with zero server uploads or external API dependencies.
- **TF-IDF & Cosine Similarity:** Mathematically scores keyword match coverage against target job descriptions.
- **Formatting Diagnostics:** Detects multi-column layout traps, missing section headers, and word count anomalies.
- **Preserves Candidate's Real Resume:** Extracts your real name, contact details, experience, and education without replacing them with dummy placeholders, and weaves missing high-priority keywords smoothly into your sections.
- **Direct 1-Click PDF Download (`jsPDF`):** Click **Download Optimized PDF** to immediately save a clean, single-column ATS & recruiter-ready `.pdf` file directly to your Downloads folder—no browser print or Save As dialog required.

## Getting Started
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`
